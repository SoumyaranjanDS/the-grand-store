/**
 * GS Tax Engine
 * Determines VAT/Tax treatment based on origin, destination, and product classification.
 */

const calculateTax = (originCountry, destinationCountry, subtotal) => {
  const isSouthAfrica = (country) => {
    if (!country) return false;
    const c = country.toLowerCase();
    return c === 'south africa' || c === 'za' || c === 'rsa';
  };

  const originSA = isSouthAfrica(originCountry);
  const destSA = isSouthAfrica(destinationCountry);

  let vatPct = 0;
  let taxType = 'None';

  if (originSA && destSA) {
    // DOMESTIC
    vatPct = 15;
    taxType = 'Standard VAT';
  } else if (originSA && !destSA) {
    // EXPORT
    vatPct = 0; // Zero-rated for export
    taxType = 'Zero-rated Export';
  } else if (!originSA && destSA) {
    // IMPORT TO SA (VAT handled differently, often at customs)
    vatPct = 0; 
    taxType = 'Imported (Customs VAT Applies)';
  } else {
    // CROSS-BORDER (Intl to Intl)
    vatPct = 0;
    taxType = 'Cross-Border (No SA VAT)';
  }

  const vatAmount = parseFloat(((subtotal * vatPct) / 100).toFixed(2));

  return {
    vatPct,
    vatAmount,
    taxType
  };
};

module.exports = { calculateTax };
