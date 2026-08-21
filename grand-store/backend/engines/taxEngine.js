/**
 * GS Tax Engine
 * Determines VAT/Tax treatment based on origin, destination, and product classification.
 */

const calculateTax = (originCountry, destinationCountry, subtotal, platformVatPct = 15) => {
  const isSouthAfrica = (country) => {
    if (!country) return false;
    const c = country.toLowerCase();
    return c === 'south africa' || c === 'za' || c === 'rsa';
  };
  // UNIVERSAL VAT
  // Applied to all products regardless of origin or destination
  let vatPct = platformVatPct;
  let taxType = 'Standard Universal VAT';

  const vatAmount = parseFloat(((subtotal * vatPct) / 100).toFixed(2));

  return {
    vatPct,
    vatAmount,
    taxType
  };
};

module.exports = { calculateTax };
