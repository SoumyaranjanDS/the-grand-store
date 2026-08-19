/**
 * GS Shipping & Courier Engine
 * Simulates shipping options, rates, and landed costs based on vendor profiles and destinations.
 */

const Vendor = require('../models/Vendor');

const isSouthAfrica = (country) => {
  if (!country) return false;
  const c = country.toLowerCase();
  return c === 'south africa' || c === 'za' || c === 'rsa';
};

const getShippingQuotes = async (vendorId, customerAddress, shipmentItemsSubtotal, totalWeightKg) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    const originCountry = vendor?.shippingProfile?.pickupAddress?.country || 'South Africa';
    const destCountry = customerAddress.country || 'South Africa';

    const originSA = isSouthAfrica(originCountry);
    const destSA = isSouthAfrica(destCountry);

    let quotes = [];
    let isInternational = false;
    let estimatedDuties = 0;
    let estimatedTaxes = 0;
    let customsFees = 0;

    // SIMULATED COURIER API LOGIC

    // 1. DOMESTIC SA
    if (originSA && destSA) {
      // Check if vendor has free shipping threshold
      const freeThreshold = vendor?.shippingProfile?.freeDeliveryThreshold;
      let standardCost = 150;
      let expressCost = 250;

      // Simple mock zone check
      if (vendor?.shippingProfile?.shippingZones?.length > 0) {
        const zone = vendor.shippingProfile.shippingZones.find(z => 
          z.name.toLowerCase().includes(customerAddress.city.toLowerCase())
        );
        if (zone) {
          standardCost = zone.rate;
          expressCost = standardCost + 100;
        }
      }

      if (freeThreshold && shipmentItemsSubtotal >= freeThreshold) {
        standardCost = 0;
      }

      quotes.push({
        courierName: 'GS Domestic Logistics',
        serviceLevel: 'Standard',
        cost: standardCost,
        estimatedDays: '2-4 business days'
      });
      
      if (standardCost > 0) {
        quotes.push({
          courierName: 'GS Domestic Express',
          serviceLevel: 'Express',
          cost: expressCost,
          estimatedDays: '1-2 business days'
        });
      }
    } 
    // 2. EXPORT (SA -> Intl)
    else if (originSA && !destSA) {
      isInternational = true;
      // Mock DHL/Fedex rates
      let baseRate = 1800; // R1800 flat rate mock
      if (totalWeightKg > 10) baseRate += 500;
      
      quotes.push({
        courierName: 'DHL Express',
        serviceLevel: 'International Express',
        cost: baseRate,
        estimatedDays: '5-8 business days'
      });

      // Mock Duties/Taxes (DAP by default, but we can quote landed cost)
      // Usually duties are 10-20% on alcohol, plus destination VAT
      estimatedDuties = parseFloat((shipmentItemsSubtotal * 0.15).toFixed(2));
      estimatedTaxes = parseFloat((shipmentItemsSubtotal * 0.20).toFixed(2));
      customsFees = 250; 
    } 
    // 3. IMPORT (Intl -> SA) or CROSS-BORDER
    else {
      isInternational = true;
      let baseRate = 2500;
      quotes.push({
        courierName: 'Global Logistics',
        serviceLevel: 'International Priority',
        cost: baseRate,
        estimatedDays: '7-14 business days'
      });
      estimatedDuties = parseFloat((shipmentItemsSubtotal * 0.20).toFixed(2));
      estimatedTaxes = parseFloat((shipmentItemsSubtotal * 0.15).toFixed(2)); // SA VAT is 15% on imports
      customsFees = 300;
    }

    return {
      originCountry,
      destCountry,
      isInternational,
      quotes,
      landedCostEstimates: isInternational ? {
        estimatedDuties,
        estimatedTaxes,
        customsFees,
        totalImportCharges: estimatedDuties + estimatedTaxes + customsFees
      } : null
    };

  } catch (error) {
    console.error("Shipping Engine Error:", error);
    throw error;
  }
};

module.exports = { getShippingQuotes };
