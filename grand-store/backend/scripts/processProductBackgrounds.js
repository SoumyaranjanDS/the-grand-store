require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const dns = require('dns');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Product = require('../models/Product');
const { keyOf } = require('../utils/productNormalization');

const POLL_INTERVAL_MS = Math.max(1500, Number(process.env.BG_REMOVAL_POLL_INTERVAL_MS) || 3000);
const POLL_ATTEMPTS = Math.max(3, Number(process.env.BG_REMOVAL_POLL_ATTEMPTS) || 20);
const DEFAULT_CONCURRENCY = Math.max(1, Math.min(5, Number(process.env.BG_REMOVAL_CONCURRENCY) || 3));
const INVALID_IMAGE_VALUES = new Set(['', 'n', 'na', 'n/a', 'null', 'undefined', '-']);
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const publicIdFor = (product) => {
  const stableId = keyOf(product.id || product._id).replace(/\s+/g, '-');
  return `grand-store/catalog-originals/${stableId}`;
};

const buildTransparentUrl = (publicId, version, { removeBackground = true } = {}) => cloudinary.url(publicId, {
  secure: true,
  version,
  format: 'png',
  transformation: [
    ...(removeBackground ? [{ effect: 'background_removal' }] : []),
    { width: 1200, height: 1600, crop: 'limit' }
  ]
});

const waitForTransformation = async (url) => {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(url, {
      headers: { Accept: 'image/png,image/*;q=0.8' }
    });
    lastStatus = response.status;
    if (response.ok && String(response.headers.get('content-type') || '').startsWith('image/')) {
      await response.arrayBuffer();
      return { status: response.status, contentType: response.headers.get('content-type') };
    }
    if (![420, 423, 429, 500, 502, 503, 504].includes(response.status)) {
      const body = (await response.text()).slice(0, 240);
      throw new Error(`Cloudinary transformation failed with HTTP ${response.status}${body ? `: ${body}` : ''}`);
    }
    if (attempt < POLL_ATTEMPTS) await wait(POLL_INTERVAL_MS);
  }
  throw new Error(`Cloudinary transformation did not finish (last HTTP status ${lastStatus}).`);
};

const processProduct = async (product, shouldApply, { alreadyTransparent = false } = {}) => {
  const currentImage = String(product.image || '');
  const isProcessedImage = currentImage.includes('res.cloudinary.com') && currentImage.includes('/e_background_removal/');
  const sourceImage = isProcessedImage ? product.originalImage : currentImage;
  if (INVALID_IMAGE_VALUES.has(String(sourceImage || '').trim().toLowerCase())) {
    return { product, status: 'skipped', reason: 'missing_source_image' };
  }
  if (!shouldApply) {
    return { product, status: 'would_process', sourceImage, publicId: publicIdFor(product) };
  }

  const publicId = product.cloudinaryPublicId || publicIdFor(product);
  await Product.updateOne({ _id: product._id }, {
    $set: { backgroundRemovalStatus: 'pending', backgroundRemovalError: '' }
  });

  try {
    const uploaded = await cloudinary.uploader.upload(sourceImage, {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      unique_filename: false,
      resource_type: 'image',
      tags: ['grand-store-catalog', 'background-removal-source'],
      context: { product_id: product.id, product_name: product.name }
    });
    const transparentUrl = buildTransparentUrl(uploaded.public_id, uploaded.version, {
      removeBackground: !alreadyTransparent
    });
    await waitForTransformation(transparentUrl);
    await Product.updateOne({ _id: product._id }, {
      $set: {
        originalImage: sourceImage,
        image: transparentUrl,
        cloudinaryPublicId: uploaded.public_id,
        backgroundRemovalStatus: 'complete',
        backgroundRemovalError: '',
        backgroundRemovedAt: new Date()
      }
    });
    return { product, status: 'complete', sourceImage, transparentUrl, publicId: uploaded.public_id };
  } catch (error) {
    await Product.updateOne({ _id: product._id }, {
      $set: { backgroundRemovalStatus: 'failed', backgroundRemovalError: error.message.slice(0, 500) }
    });
    return { product, status: 'failed', error: error.message };
  }
};

const mapWithConcurrency = async (items, concurrency, worker) => {
  const results = new Array(items.length);
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
};

const main = async () => {
  const shouldApply = process.argv.includes('--apply');
  const retryFailed = process.argv.includes('--retry-failed');
  const alreadyTransparent = process.argv.includes('--already-transparent');
  const idArg = process.argv.find((argument) => argument.startsWith('--id='))?.slice(5);
  const idsArg = process.argv.find((argument) => argument.startsWith('--ids='))?.slice(6)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const limitArg = Number(process.argv.find((argument) => argument.startsWith('--limit='))?.slice(8));
  const concurrencyArg = Number(process.argv.find((argument) => argument.startsWith('--concurrency='))?.slice(14));
  const concurrency = Number.isFinite(concurrencyArg) && concurrencyArg > 0
    ? Math.max(1, Math.min(5, concurrencyArg))
    : DEFAULT_CONCURRENCY;

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured.');
  if (!process.env.CLOUDINARY_API_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured.');
  }
  if (process.env.MONGO_URI.startsWith('mongodb+srv://')) {
    dns.setServers((process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map((item) => item.trim()).filter(Boolean));
  }
  await mongoose.connect(process.env.MONGO_URI);

  const query = {
    isCatalogDuplicate: { $ne: true },
    image: { $nin: [...INVALID_IMAGE_VALUES] }
  };
  if (idArg) query.id = idArg;
  else if (idsArg?.length) query.id = { $in: idsArg };
  if (!idArg && !idsArg?.length) query.backgroundRemovalStatus = retryFailed
    ? { $in: ['not_requested', 'failed', 'skipped', null] }
    : { $in: ['not_requested', 'skipped', null] };

  let products = await Product.find(query)
    .select('_id id name image originalImage cloudinaryPublicId backgroundRemovalStatus')
    .sort({ name: 1 });
  if (Number.isFinite(limitArg) && limitArg > 0) products = products.slice(0, limitArg);

  let processed = 0;
  const results = await mapWithConcurrency(products, concurrency, async (product) => {
    const result = await processProduct(product, shouldApply, { alreadyTransparent });
    processed += 1;
    console.log(`[${processed}/${products.length}] ${product.name}: ${result.status}`);
    if (result.status === 'failed') console.log(`  ${result.error}`);
    return result;
  });

  const counts = results.reduce((summary, result) => {
    summary[result.status] = (summary[result.status] || 0) + 1;
    return summary;
  }, {});
  console.log(JSON.stringify({ mode: shouldApply ? 'applied' : 'dry_run', productsChecked: products.length, counts }, null, 2));
  if (products.length === 1 && results[0]?.transparentUrl) {
    console.log(JSON.stringify({ sample: results[0].transparentUrl }, null, 2));
  }
};

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    });
}

module.exports = {
  buildTransparentUrl,
  processProduct,
  publicIdFor,
  waitForTransformation
};
