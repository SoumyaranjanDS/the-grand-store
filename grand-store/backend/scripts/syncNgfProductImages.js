require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const dns = require('dns');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { cleanText, keyOf } = require('../utils/productNormalization');

const NGF_ORIGIN = 'https://www.ngf.co.za';
const DEFAULT_CONCURRENCY = Math.max(1, Math.min(4, Number(process.env.NGF_SYNC_CONCURRENCY) || 2));
const REQUEST_GAP_MS = Math.max(250, Number(process.env.NGF_SYNC_REQUEST_GAP_MS) || 750);
const INVALID_IMAGE_VALUES = new Set(['', 'n', 'na', 'n/a', 'null', 'undefined', '-']);
const NGF_DRAUGHT_MACHINE = {
  image: 'https://www.ngf.co.za/wp-content/uploads/2023/11/wp-image-32778148708535.jpg',
  productUrl: 'https://www.ngf.co.za/promotions/castle-lite-draught-machine/'
};
const NGF_IMAGE_OVERRIDES = {
  // NGF's full Tobala PNG is over Cloudinary's 10 MB upload limit. This is
  // NGF's own high-resolution, transparency-preserving WordPress derivative.
  '57407677-836d-4ff0-9d20-d8aa4f9ec43e': 'https://www.ngf.co.za/wp-content/uploads/2024/08/127474-1366x2048.png'
};
let nextRequestAt = 0;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const reserveRequestSlot = async () => {
  const delay = Math.max(0, nextRequestAt - Date.now());
  nextRequestAt = Math.max(Date.now(), nextRequestAt) + REQUEST_GAP_MS;
  if (delay) await wait(delay);
};

const decodeEntities = (value) => String(value || '')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&nbsp;/gi, ' ');

const getAttribute = (html, name) => {
  const match = html.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return decodeEntities(match?.[1] || '');
};

const parseNgfProductCards = (html) => {
  const cards = [];
  const cardPattern = /<a\b[^>]*href=["'](https:\/\/www\.ngf\.co\.za\/product\/[^"']+)["'][^>]*>\s*<img\b([^>]+)>/gi;
  for (const match of html.matchAll(cardPattern)) {
    const imageHtml = match[2];
    const image = getAttribute(imageHtml, 'src');
    const title = cleanText(getAttribute(imageHtml, 'alt'));
    if (!image || !title || /gift card/i.test(title)) continue;
    cards.push({ productUrl: decodeEntities(match[1]), image, title });
  }
  return [...new Map(cards.map((card) => [card.productUrl, card])).values()];
};

const parseNgfApiProducts = (payload) => (Array.isArray(payload) ? payload : [])
  .map((product) => ({
    productUrl: decodeEntities(product?.link),
    image: decodeEntities(product?._embedded?.['wp:featuredmedia']?.[0]?.source_url),
    title: cleanText(decodeEntities(product?.title?.rendered))
  }))
  .filter((product) => product.productUrl && product.image && product.title && !/gift card/i.test(product.title));

const matchTokens = (value) => new Set(
  keyOf(value)
    .replace(/\bd usse\b/g, 'dusse')
    .replace(/\b(?:ki no bi|kino bi)\b/g, 'kinobi')
    .replace(/\b(?:philipponnat|philippoinnat)\b/g, 'philipponnat')
    .replace(/\b(?:yozakura|yozukura)\b/g, 'yozakura')
    .replace(/\b(\d+)\s*(?:years?\s*old|yrs?|yo)\b/g, '$1')
    .replace(/\b(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/g, '$1$2')
    .split(' ')
    .filter((token) => token && !['the', 'import'].includes(token))
);

const scoreCandidate = (productName, candidateTitle) => {
  const targetKey = keyOf(productName);
  const candidateKey = keyOf(candidateTitle);
  if (targetKey === candidateKey) return 1;
  const targetTokens = matchTokens(productName);
  const candidateTokens = matchTokens(candidateTitle);
  const intersection = [...targetTokens].filter((token) => candidateTokens.has(token)).length;
  const union = new Set([...targetTokens, ...candidateTokens]).size || 1;
  const coverage = intersection / Math.max(1, targetTokens.size);
  const jaccard = intersection / union;
  const firstTargetToken = [...targetTokens][0];
  const brandBonus = firstTargetToken && candidateTokens.has(firstTargetToken) ? 0.08 : 0;
  let score = Math.min(0.99, (coverage * 0.62) + (jaccard * 0.3) + brandBonus);
  const variantTerms = [
    'blanco', 'reposado', 'anejo', 'cristalino', 'mezcal',
    'vs', 'vsop', 'xo', 'xxo', 'brut', 'rose', 'demi',
    'black', 'blue', 'gold', 'green', 'red', 'white'
  ];
  const targetVariants = variantTerms.filter((token) => targetTokens.has(token));
  if (targetVariants.some((token) => !candidateTokens.has(token))) score -= 0.22;

  const targetNumbers = [...targetTokens].filter((token) => /^\d{1,4}$/.test(token));
  const candidateNumbers = [...candidateTokens].filter((token) => /^\d{1,4}$/.test(token));
  if (targetNumbers.length && candidateNumbers.length && !targetNumbers.some((token) => candidateNumbers.includes(token))) {
    score -= 0.25;
  }
  return Math.max(0, score);
};

const fetchText = async (url, attempts = 5) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await reserveRequestSlot();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GrandStoreCatalogSync/1.0 (+https://thegrandstore.co.za)',
          Accept: 'text/html,application/xhtml+xml'
        }
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        const retryAfterSeconds = Number(response.headers.get('retry-after'));
        error.retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 0;
        throw error;
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      const retryable = !error.status || error.status === 408 || error.status === 425 || error.status === 429 || error.status >= 500;
      if (!retryable || attempt === attempts) break;
      const backoff = error.status === 429
        ? Math.min(30000, Math.max(error.retryAfterMs || 0, 2500 * (2 ** (attempt - 1))))
        : Math.min(10000, 750 * (2 ** (attempt - 1)));
      await wait(backoff);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
};

const buildSearchQueries = (name) => {
  const cleaned = cleanText(name).replace(/\bOld\s+Old\b/gi, 'Old');
  const unpacked = cleaned
    .replace(/\b(?:Gift|Presentation)\s+(?:Box|Pack)\b/gi, '')
    .replace(/\bwith\s+(?:Two|2)\s+Glasses\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const withoutSize = unpacked.replace(/\b\d+(?:\.\d+)?\s*(?:ml|cl|l)\b/gi, '').replace(/\s+/g, ' ').trim();
  const withoutOld = unpacked.replace(/\b(\d{1,2})\s+Year(?:s)?\s+Old\b/gi, '$1 Year').replace(/\s+/g, ' ').trim();
  const shortAge = unpacked.replace(/\b(\d{1,2})\s+Year(?:s)?\s+Old\b/gi, '$1').replace(/\s+/g, ' ').trim();
  const withoutBundle = unpacked.replace(/\s*\[?Liq\]?\s*&\s*SAB\s+Draught\s+Machine\s+7\s+Days.*$/i, '').trim();
  const ngfSpelling = unpacked
    .replace(/\bPhilipponnat\b/gi, 'Philippoinnat')
    .replace(/\bYozakura\b/gi, 'Yozukura');
  const ngfShortName = ngfSpelling
    .replace(/\b(\d{1,2})\s+Year(?:s)?\s+Old\b/gi, '$1Yr')
    .replace(/\s+/g, ' ')
    .trim();
  const compact = withoutSize
    .replace(/\b(\d{1,2})\s+Year(?:s)?\s+Old\b/gi, '$1Yr')
    .replace(/\b(?:Single Malt|Blended Malt|Blended|Scotch|Irish)\s+(?:Scotch\s+)?Whisk(?:e)?y\b/gi, '')
    .replace(/\b(?:Cognac|Tequila|Champagne|Vodka|Gin|Rum|Brandy|Liqueur)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const ascii = keyOf(unpacked);
  return [...new Set([
    cleaned, unpacked, withoutBundle, withoutOld, shortAge, withoutSize, compact, ngfSpelling, ngfShortName, ascii
  ].filter((query) => query.length >= 3))];
};

const findNgfImage = async (product) => {
  if (/\b30\s*l\b.*\bkeg\b.*\bsab\s+draught\s+machine\b/i.test(cleanText(product.name))) {
    return { status: 'matched', ...NGF_DRAUGHT_MACHINE, title: product.name, score: 1 };
  }
  const queries = buildSearchQueries(product.name);
  const candidatesByUrl = new Map();
  for (const query of queries) {
    const apiUrl = `${NGF_ORIGIN}/wp-json/wp/v2/product?search=${encodeURIComponent(query)}&per_page=20&_embed=wp:featuredmedia`;
    const payload = JSON.parse(await fetchText(apiUrl));
    parseNgfApiProducts(payload).forEach((candidate) => candidatesByUrl.set(candidate.productUrl, candidate));
    const currentBest = [...candidatesByUrl.values()]
      .map((candidate) => scoreCandidate(product.name, candidate.title))
      .sort((left, right) => right - left)[0];
    if (currentBest >= 0.86) break;
  }
  if (!candidatesByUrl.size) {
    for (const query of queries) {
      const searchUrl = `${NGF_ORIGIN}/?s=${encodeURIComponent(query)}&post_type=product`;
      const html = await fetchText(searchUrl);
      parseNgfProductCards(html).forEach((candidate) => candidatesByUrl.set(candidate.productUrl, candidate));
      if (candidatesByUrl.size) break;
    }
  }
  const candidates = [...candidatesByUrl.values()];
  if (!candidates.length) return { status: 'not_found' };

  const ranked = candidates
    .map((candidate) => ({ ...candidate, score: scoreCandidate(product.name, candidate.title) }))
    .sort((left, right) => right.score - left.score);
  const best = ranked[0];
  if (!best || best.score < 0.7) {
    return { status: 'low_confidence', best, candidates: ranked.slice(0, 3) };
  }
  return {
    status: 'matched',
    ...best,
    image: NGF_IMAGE_OVERRIDES[product.id] || best.image
  };
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

const isMissingImage = (value) => INVALID_IMAGE_VALUES.has(String(value || '').trim().toLowerCase());

const main = async () => {
  const shouldApply = process.argv.includes('--apply');
  const missingOnly = process.argv.includes('--missing-only');
  const idArg = process.argv.find((arg) => arg.startsWith('--id='))?.slice(5);
  const idsArg = process.argv.find((arg) => arg.startsWith('--ids='))?.slice(6)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const limitArg = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.slice(8));

  dns.setServers((process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map((item) => item.trim()).filter(Boolean));
  await mongoose.connect(process.env.MONGO_URI);

  const query = { isCatalogDuplicate: { $ne: true } };
  if (idArg) query.id = idArg;
  else if (idsArg?.length) query.id = { $in: idsArg };
  let products = await Product.find(query)
    .select('_id id name image originalImage sourceUrl category country imageSource imageSourceUrl backgroundRemovalStatus')
    .sort({ name: 1 })
    .lean();
  if (missingOnly) products = products.filter((product) => isMissingImage(product.image));
  if (Number.isFinite(limitArg) && limitArg > 0) products = products.slice(0, limitArg);

  let processed = 0;
  const results = await mapWithConcurrency(products, DEFAULT_CONCURRENCY, async (product) => {
    try {
      const result = await findNgfImage(product);
      return { product, ...result };
    } catch (error) {
      return { product, status: 'error', error: error.message };
    } finally {
      processed += 1;
      if (processed % 10 === 0 || processed === products.length) {
        console.log(`NGF image lookup: ${processed}/${products.length}`);
      }
    }
  });

  const matched = results.filter((result) => result.status === 'matched');
  const changed = matched.filter((result) => (
    result.product.image !== result.image ||
    result.product.imageSource !== 'Norman Goodfellows' ||
    result.product.imageSourceUrl !== result.productUrl ||
    result.product.backgroundRemovalStatus !== 'not_requested'
  ));
  if (shouldApply && changed.length) {
    await Product.bulkWrite(changed.map((result) => ({
      updateOne: {
        filter: { _id: result.product._id },
        update: {
          $set: {
            image: result.image,
            originalImage: result.product.originalImage || result.product.image || result.image,
            imageSource: 'Norman Goodfellows',
            imageSourceUrl: result.productUrl,
            sourceUrl: result.productUrl,
            imageSyncedAt: new Date(),
            backgroundRemovalStatus: 'not_requested'
          }
        }
      }
    })), { ordered: false });
  }

  const summary = {
    mode: shouldApply ? 'applied' : 'dry_run',
    productsChecked: products.length,
    matched: matched.length,
    highConfidenceChanges: changed.length,
    missingImagesResolved: matched.filter((result) => isMissingImage(result.product.image)).length,
    lowConfidence: results.filter((result) => result.status === 'low_confidence').length,
    notFound: results.filter((result) => result.status === 'not_found').length,
    errors: results.filter((result) => result.status === 'error').length
  };
  console.log(JSON.stringify(summary, null, 2));
  const unresolved = results
    .filter((result) => result.status !== 'matched')
    .map((result) => ({
      id: result.product.id,
      name: result.product.name,
      status: result.status,
      best: result.best ? { title: result.best.title, score: Number(result.best.score.toFixed(3)) } : undefined,
      error: result.error
    }));
  if (unresolved.length) console.log(JSON.stringify({ unresolved }, null, 2));
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
  buildSearchQueries,
  findNgfImage,
  parseNgfApiProducts,
  parseNgfProductCards,
  scoreCandidate
};
