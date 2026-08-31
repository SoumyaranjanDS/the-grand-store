import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
import { useGeoLocation } from './LocationContext';

const CurrencyContext = createContext();

export const useCurrency = () => {
  return useContext(CurrencyContext);
};

// Common currency symbols map
const CURRENCY_SYMBOLS = {
  ZAR: 'R',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$'
};

const formatCurrencyAmount = (amount, currencyCode) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `${CURRENCY_SYMBOLS[currencyCode] || currencyCode} ${formatted}`;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('ZAR'); // Default is ZAR
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency: geoCurrency, isLoading: geoLoading } = useGeoLocation();

  useEffect(() => {
    const initCurrency = async () => {
      try {
        // 1. Fetch Exchange Rates
        const ratesRes = await api.get(`/config/currency-rates`);
        if (ratesRes.data && ratesRes.data.rates) {
          setRates(ratesRes.data.rates);
        }
      } catch (error) {
        console.error('Error initializing currency context:', error);
      } finally {
        setLoading(false);
      }
    };

    initCurrency();
  }, []);

  useEffect(() => {
    if (!geoLoading && rates) {
      const savedCurrency = localStorage.getItem('userCurrency');
      if (savedCurrency && (savedCurrency === 'ZAR' || rates[savedCurrency])) {
        setCurrency(savedCurrency);
      } else if (geoCurrency && (geoCurrency === 'ZAR' || rates[geoCurrency])) {
        setCurrency(geoCurrency);
        localStorage.setItem('userCurrency', geoCurrency);
      }
    }
  }, [geoLoading, geoCurrency, rates]);

  const changeCurrency = (newCurrency) => {
    if (newCurrency === 'ZAR' || rates?.[newCurrency]) {
      setCurrency(newCurrency);
      localStorage.setItem('userCurrency', newCurrency);
    }
  };

  const convertAndFormat = (amountInZar) => {
    if (!amountInZar && amountInZar !== 0) return '';
    const numericStr = String(amountInZar).replace(/[^0-9.]/g, '');
    const num = parseFloat(numericStr);
    if (isNaN(num)) return amountInZar;

    // If no rates loaded or viewing in base currency, just return ZAR formatted
    if (!rates || currency === 'ZAR') {
      return formatCurrencyAmount(num, 'ZAR');
    }

    // Convert: ZAR -> USD -> Target Currency
    // Since rates are based in USD (1 USD = X ZAR, 1 USD = Y GBP)
    const rateZarToUsd = 1 / rates['ZAR'];
    const amountInUsd = num * rateZarToUsd;
    const amountInTarget = amountInUsd * rates[currency];

    return formatCurrencyAmount(amountInTarget, currency);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      rates,
      loading,
      changeCurrency,
      formatPrice: convertAndFormat,
      availableCurrencies: rates
        ? Array.from(new Set(['ZAR', ...Object.keys(rates)])).sort()
        : ['ZAR']
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
