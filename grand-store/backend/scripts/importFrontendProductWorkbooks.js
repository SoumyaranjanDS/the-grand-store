require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const crypto = require('crypto');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Product = require('../models/Product');
const {
  cleanText,
  keyOf,
  normalizeProduct
} = require('../utils/productNormalization');

const WORKBOOK_DIR = path.resolve(__dirname, '../../frontend');
const WORKBOOK_PATTERN = /\(1\)\.xlsx$/i;
const DEFAULT_IMPORT_STOCK = Math.max(1, Number(process.env.IMPORT_DEFAULT_STOCK) || 25);

const findHeaderRow = (rows) => rows.findIndex((row) => (
  Array.isArray(row) && row.some((cell) => cleanText(cell).toLowerCase() === 'product name')
));

const rowToObject = (headers, row) => Object.fromEntries(headers.map((header, index) => [cleanText(header), row[index]]));

const normalizePrice = (value) => {
  const numeric = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) && numeric >= 0 ? numeric.toFixed(2) : '0.00';
};

const qualityScore = (product, rawCategory) => (
  (product.image ? 8 : 0)
  + ((product.gallery?.length || 0) * 2)
  + (product.description ? 3 : 0)
  + (product.subcategory ? 2 : 0)
  + (keyOf(rawCategory) === 'whisky' ? 4 : 0)
);

const readWorkbookProducts = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const products = [];

  for (const sheetName of workbook.SheetNames) {
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
    const headerIndex = findHeaderRow(rows);
    if (headerIndex < 0) continue;

    const headers = rows[headerIndex].map(cleanText);
    for (const row of rows.slice(headerIndex + 1)) {
      const record = rowToObject(headers, row);
      if (!cleanText(record['Product Name'])) continue;

      const rawName = cleanText(record['Product Name']);
      const rawCategory = cleanText(record.Category);
      const image = cleanText(record['Image URL 1']);
      const gallery = [2, 3, 4, 5]
        .map((number) => cleanText(record[`Image URL ${number}`]))
        .filter(Boolean);

      const normalized = normalizeProduct({
        category: rawCategory,
        country: record.Country,
        subcategory: record.Subcategory,
        brand: record.Brand,
        name: rawName,
        description: record['Detailed Description'],
        price: normalizePrice(record.Price),
        tags: record.Tags,
        tastingNotes: record['Tasting Notes'],
        flavorProfile: record['Flavor Profile'],
        foodPairing: record['Food Pairing'],
        image,
        gallery,
        size: record['Bottle Size']
      });

      products.push({
        ...normalized,
        _aliases: [...new Set([rawName, normalized.name].filter(Boolean))],
        _qualityScore: qualityScore(normalized, rawCategory),
        sourceWorkbooks: [path.basename(filePath)],
        sourceUrl: cleanText(record['NGF Source'])
      });
    }
  }

  return products;
};

const buildImportPlan = (directory = WORKBOOK_DIR) => {
  const files = fs.readdirSync(directory)
    .filter((file) => WORKBOOK_PATTERN.test(file))
    .sort((left, right) => left.localeCompare(right));
  const byProduct = new Map();
  let rawRowCount = 0;

  for (const file of files) {
    const workbookProducts = readWorkbookProducts(path.join(directory, file));
    rawRowCount += workbookProducts.length;

    for (const product of workbookProducts) {
      const productKey = keyOf(product.name);
      const existing = byProduct.get(productKey);
      if (!existing) {
        byProduct.set(productKey, product);
        continue;
      }

      const preferred = product._qualityScore > existing._qualityScore ? product : existing;
      const alternate = preferred === product ? existing : product;
      byProduct.set(productKey, {
        ...preferred,
        image: preferred.image || alternate.image,
        gallery: preferred.gallery?.length ? preferred.gallery : alternate.gallery,
        _aliases: [...new Set([...(existing._aliases || []), ...(product._aliases || [])])],
        sourceWorkbooks: [...new Set([...(existing.sourceWorkbooks || []), ...(product.sourceWorkbooks || [])])],
        sourceUrl: preferred.sourceUrl || alternate.sourceUrl
      });
    }
  }

  return {
    files,
    rawRowCount,
    duplicateRowCount: rawRowCount - byProduct.size,
    products: [...byProduct.values()].sort((left, right) => left.name.localeCompare(right.name))
  };
};

const validateImportPlan = (plan) => {
  const errors = [];
  const seen = new Set();

  for (const product of plan.products) {
    const productKey = keyOf(product.name);
    if (!product.name) errors.push('A product is missing its name.');
    if (!product.category) errors.push(`${product.name}: category is missing.`);
    if (!product.country) errors.push(`${product.name}: country is missing.`);
    if (!product.subcategory) errors.push(`${product.name}: subcategory is missing.`);
    if (!product.brand) errors.push(`${product.name}: brand is missing.`);
    if (['scotch', 'whiskey'].includes(keyOf(product.category))) errors.push(`${product.name}: category was not normalized to Whisky.`);
    if (/\b(?:whisky|whiskey|scotch|beer|champagne|cognac|gin|rum|spirits|tequila|vodka)$/i.test(product.country)) {
      errors.push(`${product.name}: country still contains a category suffix (${product.country}).`);
    }
    if (seen.has(productKey)) errors.push(`${product.name}: duplicate normalized name.`);
    seen.add(productKey);
  }

  return errors;
};

const summarizePlan = (plan) => {
  const categories = {};
  const countries = {};
  let restoredStockCandidates = 0;
  for (const product of plan.products) {
    categories[product.category] = (categories[product.category] || 0) + 1;
    countries[product.country] = (countries[product.country] || 0) + 1;
    if (product.stock === 0) restoredStockCandidates += 1;
  }
  return {
    files: plan.files.length,
    rowsRead: plan.rawRowCount,
    duplicateRowsRemoved: plan.duplicateRowCount,
    uniqueProducts: plan.products.length,
    categories,
    countries,
    restoredStockCandidates
  };
};

const applyImportPlan = async (plan) => {
  // Internal catalogue products are few enough to normalize in memory. This
  // catches legacy punctuation/spacing differences that an exact Mongo query
  // would miss, while never merging independent vendor listings.
  const existingProducts = await Product.find({ vendorId: null })
    .select('_id id name stock image gallery catalogManaged vendorId')
    .lean();
  const existingByKey = new Map();
  for (const existingProduct of existingProducts) {
    const productKey = keyOf(existingProduct.name);
    if (!existingByKey.has(productKey)) existingByKey.set(productKey, []);
    existingByKey.get(productKey).push(existingProduct);
  }
  const operations = [];
  let inserted = 0;
  let updated = 0;
  let stockRestored = 0;
  let duplicatesHidden = 0;

  for (const product of plan.products) {
    const matches = [...new Map(
      product._aliases
        .flatMap((alias) => existingByKey.get(keyOf(alias)) || [])
        .map((match) => [String(match._id), match])
    ).values()];
    const existing = matches.find((match) => match.catalogManaged) || matches[0];
    const {
      _aliases,
      _qualityScore,
      image,
      gallery,
      ...catalogData
    } = product;
    const setData = {
      ...catalogData,
      catalogManaged: true,
      isCatalogDuplicate: false,
      catalogDuplicateOf: null,
      importedAt: new Date(),
      approvalStatus: 'approved'
    };
    if (image) setData.image = image;
    if (gallery?.length) setData.gallery = gallery;

    if (existing) {
      if (!Number.isFinite(Number(existing.stock)) || Number(existing.stock) <= 0) {
        setData.stock = DEFAULT_IMPORT_STOCK;
        stockRestored += 1;
      }
      operations.push({
        updateOne: {
          filter: { _id: existing._id },
          update: { $set: setData },
          upsert: false
        }
      });
      for (const duplicate of matches.filter((match) => String(match._id) !== String(existing._id))) {
        operations.push({
          updateOne: {
            filter: { _id: duplicate._id },
            update: {
              $set: {
                isCatalogDuplicate: true,
                catalogDuplicateOf: existing._id
              }
            },
            upsert: false
          }
        });
        duplicatesHidden += 1;
      }
      updated += 1;
    } else {
      operations.push({
        updateOne: {
          filter: { name: product.name },
          update: {
            $set: setData,
            $setOnInsert: {
              id: crypto.randomUUID(),
              stock: DEFAULT_IMPORT_STOCK,
              vendorId: null
            }
          },
          upsert: true
        }
      });
      inserted += 1;
    }
  }

  if (operations.length) await Product.bulkWrite(operations, { ordered: false });
  return {
    inserted,
    updated,
    stockRestored,
    duplicatesHidden,
    defaultImportStock: DEFAULT_IMPORT_STOCK
  };
};

const normalizeExistingCatalog = async () => {
  const products = await Product.find({
    vendorId: null,
    isCatalogDuplicate: { $ne: true }
  }).lean();
  const fields = [
    'name', 'type', 'category', 'country', 'brand', 'size', 'subcategory',
    'description', 'tags', 'tastingNotes', 'flavorProfile', 'foodPairing', 'identity'
  ];
  const operations = [];

  for (const product of products) {
    const normalized = normalizeProduct(product);
    const setData = Object.fromEntries(fields.map((field) => [field, normalized[field]]));
    const before = Object.fromEntries(fields.map((field) => [field, product[field]]));
    if (JSON.stringify(before) === JSON.stringify(setData)) continue;
    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: setData },
        upsert: false
      }
    });
  }

  if (operations.length) await Product.bulkWrite(operations, { ordered: false });
  return { catalogProductsChecked: products.length, taxonomyRecordsUpdated: operations.length };
};

const main = async () => {
  const shouldApply = process.argv.includes('--apply');
  const plan = buildImportPlan();
  const validationErrors = validateImportPlan(plan);
  console.log(JSON.stringify({ summary: summarizePlan(plan), validationErrors }, null, 2));

  if (validationErrors.length) throw new Error(`Import validation failed with ${validationErrors.length} error(s).`);
  if (!shouldApply) {
    console.log('Dry run complete. Re-run with --apply to update MongoDB.');
    return;
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured.');

  // Some Windows/CI DNS resolvers intermittently refuse Atlas SRV lookups even
  // while normal host lookups work. Public resolvers keep this one-off import
  // deterministic; override them with MONGO_DNS_SERVERS when required.
  if (process.env.MONGO_URI.startsWith('mongodb+srv://')) {
    const dnsServers = (process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8')
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean);
    if (dnsServers.length) dns.setServers(dnsServers);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const result = await applyImportPlan(plan);
  const normalizedCatalog = await normalizeExistingCatalog();
  console.log(JSON.stringify({ applied: { ...result, ...normalizedCatalog } }, null, 2));
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
  applyImportPlan,
  buildImportPlan,
  normalizeExistingCatalog,
  readWorkbookProducts,
  summarizePlan,
  validateImportPlan
};
