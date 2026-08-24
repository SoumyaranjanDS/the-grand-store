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
    let vendor = null;
    if (vendorId && /^[0-9a-fA-F]{24}$/.test(vendorId.toString())) {
      vendor = await Vendor.findById(vendorId);
    }
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
        courierName: 'Courier Guy',
        serviceLevel: 'Home Delivery',
        cost: standardCost, // What customer sees
        estimatedDays: '2-4 business days',
        legs: [
          {
            courierName: 'Courier Guy Primary',
            origin: originCountry,
            destination: destCountry,
            cost: standardCost > 0 ? standardCost * 0.6 : 80 // Internal commercial cost
          },
          {
            courierName: 'Local Courier Guy Partner',
            origin: 'Local Hub',
            destination: customerAddress.city || 'Customer',
            cost: standardCost > 0 ? standardCost * 0.2 : 30 // Internal commercial cost
          }
        ]
      });
      
      if (standardCost > 0) {
        quotes.push({
          courierName: 'PostNet',
          serviceLevel: 'PostNet to PostNet',
          cost: expressCost,
          estimatedDays: '1-3 business days',
          legs: [
            {
              courierName: 'PostNet Express',
              origin: originCountry,
              destination: customerAddress.city || 'Customer',
              cost: expressCost * 0.8
            }
          ]
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
        estimatedDays: '5-8 business days',
        legs: [
          {
            courierName: 'Local Courier',
            origin: originCountry,
            destination: 'SA Export Hub',
            cost: 200
          },
          {
            courierName: 'DHL International',
            origin: 'SA Export Hub',
            destination: `${destCountry} Import Hub`,
            cost: baseRate * 0.6
          },
          {
            courierName: 'DHL Local Partner',
            origin: `${destCountry} Import Hub`,
            destination: customerAddress.city || destCountry,
            cost: baseRate * 0.15
          }
        ]
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
        courierName: 'DHL Express',
        serviceLevel: 'International Priority',
        cost: baseRate,
        estimatedDays: '7-14 business days',
        legs: [
          {
            courierName: 'Global Logistics',
            origin: originCountry,
            destination: 'SA Import Hub',
            cost: baseRate * 0.65
          },
          {
            courierName: 'GS Domestic Logistics',
            origin: 'SA Import Hub',
            destination: customerAddress.city || 'Customer',
            cost: baseRate * 0.15
          }
        ]
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
