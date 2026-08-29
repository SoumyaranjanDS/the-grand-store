const HTML_ENTITIES = {
  amp: '&',
  apos: "'",
  quot: '"',
  nbsp: ' ',
  ndash: '–',
  mdash: '—'
};

const decodeHtmlEntities = (value) => String(value ?? '')
  .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return HTML_ENTITIES[entity.toLowerCase()] ?? match;
  });

const cleanText = (value) => decodeHtmlEntities(value)
  .normalize('NFC')
  .replace(/\u00a0/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\s+([,.;:])/g, '$1')
  .trim();

const keyOf = (value) => cleanText(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const normalizeCategory = (category) => {
  const key = keyOf(category);
  const aliases = {
    scotch: 'Whisky',
    whiskey: 'Whisky',
    whisky: 'Whisky',
    beer: 'Beer',
    brandy: 'Brandy',
    champagne: 'Champagne',
    cognac: 'Cognac',
    gin: 'Gin',
    liqueur: 'Liqueur',
    rum: 'Rum',
    spirits: 'Spirits',
    tequila: 'Tequila',
    vodka: 'Vodka'
  };
  return aliases[key] || cleanText(category);
};

const COUNTRY_ALIASES = {
  'american whiskey': 'USA',
  'american whisky': 'USA',
  usa: 'USA',
  'united states': 'USA',
  'united states of america': 'USA',
  'irish whiskey': 'Ireland',
  'irish whisky': 'Ireland',
  'israeli whisky': 'Israel',
  'japanese whisky': 'Japan',
  'scotch whisky': 'Scotland',
  'scotland scotch': 'Scotland',
  'south african whisky': 'South Africa',
  'taiwanese whisky': 'Taiwan',
  'welsh whisky': 'Wales',
  'belgian beer': 'Belgium',
  'dutch beer': 'Netherlands',
  'german beer': 'Germany',
  'south african beer': 'South Africa'
};

const COUNTRY_NAMES = {
  armenia: 'Armenia',
  belgium: 'Belgium',
  china: 'China',
  france: 'France',
  germany: 'Germany',
  ireland: 'Ireland',
  israel: 'Israel',
  jamaica: 'Jamaica',
  japan: 'Japan',
  mexico: 'Mexico',
  netherlands: 'Netherlands',
  nicaragua: 'Nicaragua',
  scotland: 'Scotland',
  'south africa': 'South Africa',
  taiwan: 'Taiwan',
  usa: 'USA',
  wales: 'Wales'
};

const normalizeCountry = (country, category = '') => {
  const original = cleanText(country);
  const key = keyOf(original);
  if (COUNTRY_ALIASES[key]) return COUNTRY_ALIASES[key];
  if (COUNTRY_NAMES[key]) return COUNTRY_NAMES[key];

  const suffixes = [
    normalizeCategory(category),
    'Whisky',
    'Whiskey',
    'Scotch',
    'Beer',
    'Brandy',
    'Champagne',
    'Cognac',
    'Gin',
    'Liqueur',
    'Rum',
    'Spirits',
    'Tequila',
    'Vodka'
  ].filter(Boolean);
  let stripped = original;
  for (const suffix of suffixes) {
    stripped = stripped.replace(new RegExp(`\\s+${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), '').trim();
  }

  return COUNTRY_NAMES[keyOf(stripped)] || stripped;
};

const BRAND_REPLACEMENTS = {
  avion: 'Avión',
  bisquit: 'Bisquit & Dubouché',
  dusse: "D'Ussé",
  espolon: 'Espolòn',
  'flor de cana': 'Flor de Cana',
  'jose cuervo': 'José Cuervo',
  'laurent perrier': 'Laurent-Perrier',
  'remy martin': 'Rémy Martin',
  'triple 3': 'Triple Three',
  'volcan de mi tierra': 'Volcán de Mi Tierra'
};

const normalizeBrand = (brand) => (BRAND_REPLACEMENTS[keyOf(brand)] || cleanText(brand))
  .replace(/ñ/g, 'n')
  .replace(/Ñ/g, 'N');

const normalizeProductName = (name) => cleanText(name)
  .replace(/&\s*(2|two)\s+glasses\b/gi, (_, count) => `with ${count.toLowerCase() === 'two' ? 'Two' : count} Glasses`)
  .replace(/\b(\d{1,2})\s*(?:yrs?|year(?:s)?(?:\s+old)?)\b/gi, '$1 Year Old')
  .replace(/\bOld\s+Old\b/gi, 'Old')
  .replace(/\bAged\s+(\d{1,2})\s+Year Old\b/gi, 'Aged $1 Years')
  .replace(/\bAnejo\b/gi, 'Añejo')
  .replace(/\bCuvee\b/gi, 'Cuvée')
  .replace(/\bMillesime\b/gi, 'Millésime')
  .replace(/\bFlor De Cana\b/gi, 'Flor de Cana')
  .replace(/\bDusse\b/g, "D'Ussé")
  .replace(/\bRemy Martin\b/g, 'Rémy Martin')
  .replace(/\bAvion\b/g, 'Avión')
  .replace(/\bEspolon\b/g, 'Espolòn')
  .replace(/\bJose Cuervo\b/g, 'José Cuervo')
  .replace(/\bVolcan De Mi Tierra\b/g, 'Volcán de Mi Tierra')
  .replace(/\bTriple 3\b/g, 'Triple Three')
  .replace(/ñ/g, 'n')
  .replace(/Ñ/g, 'N')
  .replace(/\s{2,}/g, ' ')
  .trim();

const titleCase = (value) => cleanText(value).toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());

const SUBCATEGORY_ALIASES = {
  anejo: 'Añejo',
  'extra anejo': 'Extra Añejo',
  blanco: 'Blanco',
  reposado: 'Reposado',
  mezcal: 'Mezcal',
  gin: 'Gin',
  plain: 'Plain Vodka',
  'blanc de blanc': 'Blanc de Blancs',
  'blanc de blancs': 'Blanc de Blancs',
  brut: 'Brut',
  'brut rose': 'Brut Rosé',
  'demi sec': 'Demi-Sec',
  'extra brut': 'Extra Brut',
  rose: 'Rosé',
  'single barrel bourbon': 'Bourbon',
  'blended irish whiskey': 'Blended Irish Whiskey',
  'blended irish whisky': 'Blended Irish Whiskey',
  'blended malt': 'Blended Malt Whisky',
  'blended whisky': 'Blended Whisky',
  'blended malt scotch': 'Blended Malt Scotch',
  'blended scotch': 'Blended Scotch',
  'single malt scotch': 'Single Malt Scotch',
  'single pot still': 'Single Pot Still',
  'single malt': 'Single Malt',
  bourbon: 'Bourbon',
  vs: 'VS',
  vsop: 'VSOP',
  xo: 'XO',
  xxo: 'XXO'
};

const normalizeSubcategory = (subcategory, product = {}) => {
  const category = normalizeCategory(product.category || product.type);
  const categoryKey = keyOf(category);
  const hierarchyParts = cleanText(subcategory)
    .split(/\s*(?:>|›|→|\||\/)\s*/)
    .map(cleanText)
    .filter(Boolean);
  // Legacy sheets sometimes stored a full path such as "COGNAC > VSOP".
  // Keep only the most specific value and suppress category/category repeats.
  const raw = [...hierarchyParts].reverse().find((part) => keyOf(part) !== categoryKey) || '';
  const rawKey = keyOf(raw);
  if (SUBCATEGORY_ALIASES[rawKey]) return SUBCATEGORY_ALIASES[rawKey];
  if (raw) return raw === raw.toUpperCase() ? titleCase(raw) : raw;

  const search = keyOf([product.name, product.description, ...(product.tags || [])].join(' '));
  if (category === 'Whisky') {
    if (search.includes('single malt scotch')) return 'Single Malt Scotch';
    if (search.includes('blended malt scotch')) return 'Blended Malt Scotch';
    if (search.includes('blended scotch')) return 'Blended Scotch';
    if (search.includes('single barrel bourbon') || search.includes('bourbon')) return 'Bourbon';
    if (search.includes('rye whiskey') || search.includes('rye whisky')) return 'Rye Whisky';
    if (search.includes('single pot still')) return 'Single Pot Still';
    if (search.includes('single malt')) return 'Single Malt';
    if (search.includes('blended')) return 'Blended Whisky';
  }
  if (category === 'Tequila') {
    if (search.includes('cristalino anejo')) return 'Cristalino Añejo';
    if (search.includes('extra anejo')) return 'Extra Añejo';
    if (search.includes('cristalino')) return 'Cristalino';
    if (search.includes('anejo')) return 'Añejo';
    if (search.includes('reposado')) return 'Reposado';
    if (search.includes('blanco') || search.includes('plata')) return 'Blanco';
    if (search.includes('agave spirit')) return 'Agave Spirit';
    return 'Other Tequila';
  }
  if (category === 'Cognac') {
    if (/\bxxo\b/.test(search)) return 'XXO';
    if (/\bvsop\b/.test(search)) return 'VSOP';
    if (/\bxo\b/.test(search)) return 'XO';
    if (/\bvs\b/.test(search)) return 'VS';
    return 'Other Cognac';
  }
  if (category === 'Champagne') {
    if (search.includes('non dose')) return 'Non-Dosé';
    if (search.includes('demi sec')) return 'Demi-Sec';
    if (search.includes('extra brut')) return 'Extra Brut';
    if (search.includes('brut rose')) return 'Brut Rosé';
    if (search.includes('rose')) return 'Rosé';
    if (search.includes('brut')) return 'Brut';
    if (search.includes('sec')) return 'Sec';
    return 'Other Champagne';
  }
  if (category === 'Spirits') return search.includes('baijiu') || search.includes('moutai') ? 'Baijiu' : 'Premium Spirits';
  if (category === 'Rum') return /\b\d{1,2} (?:year|yr)/.test(search) ? 'Aged Rum' : 'Other Rum';
  if (category === 'Gin') {
    if (search.includes('raspberry') || search.includes('flavoured')) return 'Flavoured Gin';
    if (search.includes('dry gin')) return 'Dry Gin';
    return 'Other Gin';
  }
  if (category === 'Vodka') return 'Plain Vodka';
  if (category === 'Beer') {
    if (search.includes('cider')) return 'Cider';
    if (search.includes('lager')) return 'Lager';
    if (search.includes('stout')) return 'Stout';
    if (search.includes('wheat')) return 'Wheat Beer';
    if (search.includes('ale')) return 'Ale';
    if (search.includes('ready to drink') || search.includes('rtd')) return 'Ready to Drink';
    return 'Other Beer';
  }
  if (category === 'Brandy') {
    if (search.includes('potstill')) return 'Potstill Brandy';
    if (search.includes('blended')) return 'Blended Brandy';
    return 'Other Brandy';
  }
  if (category === 'Liqueur') {
    if (search.includes('cream')) return 'Cream Liqueur';
    if (search.includes('coffee')) return 'Coffee Liqueur';
    if (search.includes('herbal')) return 'Herbal Liqueur';
    if (search.includes('fruit')) return 'Fruit Liqueur';
    return 'Other Liqueur';
  }
  if (category === 'Whisky') return 'Other Whisky';
  return '';
};

const splitList = (value) => {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  return cleanText(value).split(',').map(cleanText).filter(Boolean);
};

const normalizeBottleSize = (size, name = '') => {
  const source = cleanText(size) || cleanText(name).match(/\b\d+(?:\.\d+)?\s*(?:ml|cl|l)\b/i)?.[0] || '';
  const match = source.match(/(\d+(?:\.\d+)?)\s*(ml|cl|l)/i);
  if (!match) return source;
  const unit = match[2].toLowerCase();
  return `${match[1]}${unit === 'l' ? 'L' : unit}`;
};

const findAge = (product, brand, category, subcategory) => {
  if (/blanton/i.test(brand || product.name)) return '6+ Years';
  const search = keyOf(`${product.name} ${product.description} ${subcategory}`);
  if (category === 'Cognac') {
    if (/\bxxo\b/.test(search)) return 'Minimum 14 Years';
    if (/\bxo\b/.test(search)) return 'Minimum 10 Years';
    if (/\bvsop\b/.test(search)) return 'Minimum 4 Years';
    if (/\bvs\b/.test(search)) return 'Minimum 2 Years';
  }
  const match = `${product.name} ${product.description}`.match(/\b(?:aged\s+)?(\d{1,2})\s*(?:year(?:s)?(?:\s+old)?|yrs?)\b/i);
  return match ? `${match[1]} Years` : '';
};

const findAbv = (name, description, brand) => {
  if (/blanton gold/i.test(name)) return '51.5%';
  if (/blanton.*(?:original|single barrel)/i.test(name) || /blanton/i.test(brand)) return '46.5%';
  if (keyOf(brand).includes('remy martin') && /\bvsop\b/i.test(`${name} ${description}`)) return '40%';
  const match = `${name} ${description}`.match(/\b(\d{1,2}(?:\.\d+)?)\s*%\s*(?:abv)?\b/i);
  return match ? `${match[1]}%` : '';
};

const findRegion = (search, brand, category, country) => {
  if (/blanton/i.test(brand)) return 'Kentucky';
  const regions = [
    ['speyside', 'Speyside'],
    ['islay', 'Islay'],
    ['campbeltown', 'Campbeltown'],
    ['highlands', 'Highlands'],
    ['highland', 'Highlands'],
    ['lowlands', 'Lowlands'],
    ['lowland', 'Lowlands'],
    ['island', 'Islands']
  ];
  const region = regions.find(([needle]) => search.includes(needle))?.[1];
  if (region) return region;
  if (category === 'Cognac' && country === 'France') return 'Cognac';
  if (category === 'Champagne' && country === 'France') return 'Champagne';
  return '';
};

const findProduction = (search) => {
  const methods = [
    ['single barrel', 'Single Barrel'],
    ['small batch', 'Small Batch'],
    ['double cask', 'Double Cask'],
    ['triple cask', 'Triple Cask'],
    ['caribbean cask', 'Caribbean Cask Finish'],
    ['port wood', 'Port Wood Finish'],
    ['sherry cask', 'Sherry Cask'],
    ['cask strength', 'Cask Strength'],
    ['bottled in bond', 'Bottled in Bond'],
    ['limited edition', 'Limited Edition'],
    ['vintage', 'Vintage']
  ];
  return methods.find(([needle]) => search.includes(needle))?.[1] || '';
};

const deriveIdentity = (product) => {
  const category = normalizeCategory(product.category || product.type);
  const country = normalizeCountry(product.country, category);
  const brand = normalizeBrand(product.brand);
  const subcategory = normalizeSubcategory(product.subcategory, { ...product, category });
  const search = keyOf([product.name, product.description, subcategory, ...(product.tags || [])].join(' '));
  let type = category;
  if (category === 'Whisky') {
    if (search.includes('bourbon')) type = 'Bourbon';
    else if (country === 'Scotland') type = 'Scotch Whisky';
    else if (country === 'Ireland') type = 'Irish Whiskey';
    else type = 'Whisky';
  } else if (category === 'Spirits' && search.includes('mezcal')) type = 'Mezcal';
  else if (category === 'Spirits' && (search.includes('baijiu') || search.includes('moutai'))) type = 'Baijiu';

  let style = subcategory && keyOf(subcategory) !== keyOf(type) && !keyOf(subcategory).startsWith('other ')
    ? subcategory
    : '';
  if (type === 'Bourbon') style = search.includes('straight bourbon') || /blanton/i.test(brand) ? 'Straight Bourbon' : 'Bourbon';
  const region = findRegion(search, brand, category, country);
  let production = findProduction(search);
  if (!production && category === 'Cognac' && (/fine champagne/.test(search) || (keyOf(brand).includes('remy martin') && style === 'VSOP'))) {
    production = 'Fine Champagne Blend';
  }

  return {
    type,
    style,
    production,
    origin: [region, country].filter(Boolean).join(', '),
    age: findAge(product, brand, category, subcategory),
    bottleSize: normalizeBottleSize(product.size, product.name),
    abv: findAbv(product.name, product.description, brand)
  };
};

const normalizeProduct = (product) => {
  const category = normalizeCategory(product.category || product.type);
  const country = normalizeCountry(product.country, category);
  const tags = splitList(product.tags);
  const regionalizeWhiskey = (value) => {
    const text = cleanText(value);
    return ['USA', 'Ireland'].includes(country)
      ? text.replace(/\bWhisky\b/gi, 'Whiskey')
      : text;
  };
  const normalized = {
    ...product,
    name: regionalizeWhiskey(normalizeProductName(product.name)),
    type: category,
    category,
    country,
    brand: normalizeBrand(product.brand),
    description: regionalizeWhiskey(cleanText(product.description)),
    size: normalizeBottleSize(product.size, product.name),
    tags: tags.map(regionalizeWhiskey),
    tastingNotes: splitList(product.tastingNotes),
    flavorProfile: splitList(product.flavorProfile),
    foodPairing: splitList(product.foodPairing)
  };
  normalized.subcategory = regionalizeWhiskey(normalizeSubcategory(product.subcategory, normalized));
  normalized.identity = deriveIdentity(normalized);
  return normalized;
};

module.exports = {
  cleanText,
  deriveIdentity,
  keyOf,
  normalizeBottleSize,
  normalizeBrand,
  normalizeCategory,
  normalizeCountry,
  normalizeProduct,
  normalizeProductName,
  normalizeSubcategory,
  splitList
};
