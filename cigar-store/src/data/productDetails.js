import { mosiProductDetails } from './mosiProducts';

const specifications = (brand) => [
  ['Size', '8.4cm'],
  ['Brand', brand],
  ['Product Weight', '1.2kg'],
  ['Product Dimension', '17.5 mm(W) 17.5 mm(H) 112 mm(L)'],
];

export const products = [
  {
    slug: 'arturo-feunte-8-5-8',
    name: 'Arturo Feunte 8-5-8',
    brand: 'Arturo Fuente',
    sku: 'CCC001',
    image: '/images/products/arturo-fuente-858.png',
    detailHeading: 'A timeless Flor Fina.',
    description: 'The 8-5-8 Natural from Arturo Fuente is truly a classic and has been around for decades. The Cameroon wrapper encases a rich nutty blend of aged Dominican fillers that provides for a well-balanced smoke. These high-quality Flor Fina cigars are constructed with the utmost care. These timeless cigars deserve a place in your humidor!',
    specifications: specifications('Arturo Fuente'),
    review: { name: 'sam sharma', quote: 'test' },
  },
  {
    slug: 'arturo-fuente-between-the-lines',
    name: 'Arturo Fuente Between The Lines',
    brand: 'Arturo Fuente',
    sku: 'CCC005',
    image: '/images/products/arturo-fuente-between-lines.png',
    detailHeading: 'A layered barber pole.',
    description: 'Arturo Fuente Hemingway Between the Lines Cigars creates a rich and varied story through its brilliant construction and blend of sweetly savory flavors. Inspired by the timeless literature of Ernest Hemingway, each cigar of the brand brings a unique sense of style that would no doubt please the author himself. Between the lines distinguishes itself with a vibrant blend of medium-bodied Dominican tobacco, rolled in the sticks signature hybrid barber pole wrapper of African Cameroon and Connecticut Broadleaf Maduro. The result is a layered and nuanced smoke bursting with the luscious tastes of nutmeg, baking spices, and almond. At four and a half inches, with a fifty-four ring gauge, Between the Lines is an intense thirty-minute smoke.',
    specifications: specifications('Arturo Fuente'),
  },
  {
    slug: 'bolivar-tubos-no-2-at',
    name: 'Bolivar Tubos No 2 AT',
    brand: 'Bolivar',
    sku: 'CCC011',
    image: '/images/products/bolivar-tubos-no2.png',
    detailHeading: 'Rich, exotic and spicy.',
    description: 'The Bolivar Tubos No. 2 Cigar is one of the smaller releases from Bolivar. This full-bodied smoke is sure to please aficionados with great experience. Expect rich, exotic and spicy flavours. Each cigar is presented in a gorgeous deep, red aluminium tube – encased in a box adorned with the brand’s logo, making them perfect when given out at special occasions.',
    specifications: specifications('Bolivar'),
  },
  {
    slug: 'cohiba-medio-siglo',
    name: 'Cohiba Medio Siglo',
    brand: 'Cohiba',
    sku: 'CCC012',
    image: '/images/products/cohiba-medio-siglo.png',
    detailHeading: 'A modern Petit Robusto.',
    description: 'The Cohiba Medio Siglo Cigar is keeping with the smaller format trend. This smoke was released in 2016 – sporting the new Petit Robusto format, in tribute to Cohiba cigars 50th anniversary. With a ring gauge of 52 and a length of 102mm, you are given a shorter smoking time of roughly 30 minutes. The shorter smoking time makes it a valuable addition to your Cuban cigar collection, for those moments when you’re short for time. Its flavour profile is incredibly pleasant and typical of the Cohiba Linea 1492. Leather, cocoa and floral notes are the most predominant ones here and create an impeccable blend of flavours.',
    specifications: specifications('Cohiba'),
    review: {
      name: 'sam sharma',
      quote: 'Let us Understand you better & give us the opportunity to keep improving your online experience. No doubt, we as social creatures are interested in knowing what other say before we make our buying decisions. Much like we would ask friends and family for recommendations.',
    },
  },
  {
    slug: 'arturo-feunte-cubanitos',
    name: 'Arturo Feunte Cubanitos',
    brand: 'Arturo Fuente',
    sku: 'CCC002',
    image: '/images/products/arturo-fuente-cubanitos.png',
    detailHeading: 'Short format, full character.',
    description: 'Cubanito’s from Arturo Fuente are handmade using aged Dominican tobaccos with a Cameroon wrapper. Enjoy this flavorful cigar when you’re short on time or when it’s too cold outside. The Fuente Cubanitos is one of the best cigarillos on the market!',
    specifications: specifications('Arturo Fuente'),
  },
  {
    slug: 'arturo-fuente-don-carlos-belicoso',
    name: 'Arturo Fuente Don Carlos Belicoso',
    brand: 'Arturo Fuente',
    sku: 'CCC006',
    image: '/images/products/arturo-fuente-don-carlos.png',
    detailHeading: 'Cameroon distinction.',
    description: 'There aren’t many cigar brands using high-quality Cameroon wrappers today. It tends to be quite expensive, rough in appearance, and temperamental during the fermentation process. But the Fuente family doesn’t seem to mind, and there was no better expression of Cameroon wrapper put to market in 2015 than that of the Don Carlos Belicoso. Its wrapper-to-filler ratios resulted in a perfect combination of the Cameroon cover leaf’s sweet-and-sour properties along with the Dominican binder and filler, which gave the cigar a zesty, nutty quality full of shaved almonds and candied orange peel. The brand was named after Carlos Fuente Sr., patriarch of the Fuente family. The factory, Tabacalera A. Fuente y Cia., is the largest family-owned cigar-making operation in the premium cigar business. Fuente Sr. recently turned 80 years old, and the Don Carlos is said to be blended to his personal taste. The combination of Cameroon and Dominican tobacco has been its hallmark since the brand debuted 30 years ago. The portfolio currently has seven sizes, including a slightly larger torpedo, but there’s something about the precise dimensions, ratios, and combustion rate of the Belicoso that makes it stand out',
    specifications: specifications('Arturo Fuente'),
  },
  {
    slug: 'bolivar-petit-coronas',
    name: 'Bolivar Petit Coronas',
    brand: 'Bolivar',
    sku: 'CCC009',
    image: '/images/products/bolivar-petit-coronas.png',
    detailHeading: 'A full-flavoured powerhouse.',
    description: 'The Bolivar Petit Coronas is another full-flavoured powerhouse from Bolivar Cigars. The Mareva vitola measures at 129mm by a 42 ring gauge – delivering around 30-45 minutes of smoking time. Making it ideal for those of you on the hunt for a quick smoke. This full-bodied Cuban cigar is filled with nut and spice notes – with a leathery finish.',
    specifications: specifications('Bolivar'),
  },
  {
    slug: 'cohiba-siglo-ii',
    name: 'Cohiba Siglo II',
    brand: 'Cohiba',
    sku: 'CCC015',
    image: '/images/products/cohiba-siglo-ii.png',
    detailHeading: 'A classic Cuban introduction.',
    description: 'The Cohiba Siglo II is a glorious Cuban cigar. Its release came in 1994 along with 6 other cigars – all to commemorate the 500th year anniversary of Colombus’ discovery of Cuba. This smoke comes in a Mareva format – making it the identical size to the Montecristo No.4. It measures at 129mm with a 42 ring gauge. It’s a great cigar for both beginners and experienced aficionados alike – many consider it the perfect introduction to Cohiba cigars. This cigar somewhat stands out from the Cohiba crowd, as it provides a silky, oily woodiness in the wrapper. Whilst still including the sweet creaminess and notes of bean that the rest of the Siglo series hold.',
    specifications: specifications('Cohiba'),
  },
  ...mosiProductDetails,
];

export const productsBySlug = Object.fromEntries(products.map((product) => [product.slug, product]));

export const patronNotice = [
  'The pictures and packing are subject to change without notice. We try to update them on a regular basis from our partners /suppliers. Hence Cigar Connoisseur Club and its staff and affiliates will not take any liability for any misprint or any incorrect information.',
  'We will accept your complains and will strive to rectify the mistakes immediately.',
  'Please note orders shipped outside of South Africa may attract vat, duties and local taxes upon arrival to the destination country. To understand the local additional taxes and duties, you will have to contact the local destination customs/authorities for more information.',
];

const arturo858Related = [
  {
    name: 'Arturo Feunte 8-5-8',
    brand: 'Arturo Fuente',
    image: '/images/products/arturo-fuente-858.png',
    href: '/product-details/arturo-feunte-8-5-8',
  },
  {
    name: 'Arturo Feunte Cubanitos',
    brand: 'Arturo Fuente',
    image: '/images/products/arturo-fuente-cubanitos.png',
    href: '/product-details/arturo-feunte-cubanitos',
  },
  {
    name: 'Arturo Feunte Opus X Perfecxion No.2',
    brand: 'Arturo Fuente',
    image: '/images/products/arturo-fuente-opus-x-perfecxion-no2.png',
    href: 'https://cigarconnoisseurclub.com/product-details/arturo-feunte-opus-x-perfecxion-no-2',
  },
  {
    name: 'Arturo Fuente Best Seller',
    brand: 'Arturo Fuente',
    image: '/images/products/arturo-fuente-best-seller.png',
    href: 'https://cigarconnoisseurclub.com/product-details/arturo-fuente-best-seller',
  },
];

export function getRelatedProducts(currentSlug) {
  if (currentSlug === 'arturo-feunte-8-5-8') return arturo858Related;

  return products
    .filter((product) => product.slug !== currentSlug)
    .slice(0, 4)
    .map((product) => ({
      name: product.name,
      brand: product.brand,
      image: product.image,
      href: `/product-details/${product.slug}`,
    }));
}
