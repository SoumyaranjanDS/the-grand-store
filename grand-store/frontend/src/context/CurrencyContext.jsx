import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('ZAR'); // Default is ZAR
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initCurrency = async () => {
      try {
        // 1. Fetch Exchange Rates
        const ratesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/config/currency-rates`);
        if (ratesRes.data && ratesRes.data.rates) {
          setRates(ratesRes.data.rates);
        }

        // 2. Determine User Location/Currency
        const savedCurrency = localStorage.getItem('userCurrency');
        if (savedCurrency) {
          setCurrency(savedCurrency);
        } else {
          // IP Geolocation API to get currency code
          const ipRes = await axios.get('https://ipapi.co/currency/').catch(() => null);
          if (ipRes && ipRes.data && typeof ipRes.data === 'string' && ratesRes.data?.rates[ipRes.data]) {
            setCurrency(ipRes.data);
            localStorage.setItem('userCurrency', ipRes.data);
          }
        }
      } catch (error) {
        console.error('Error initializing currency context:', error);
      } finally {
        setLoading(false);
      }
    };

    initCurrency();
  }, []);

  const changeCurrency = (newCurrency) => {
    if (rates && rates[newCurrency]) {
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
      return `${CURRENCY_SYMBOLS['ZAR'] || 'R'} ${num.toFixed(2)}`;
    }

    // Convert: ZAR -> USD -> Target Currency
    // Since rates are based in USD (1 USD = X ZAR, 1 USD = Y GBP)
    const rateZarToUsd = 1 / rates['ZAR'];
    const amountInUsd = num * rateZarToUsd;
    const amountInTarget = amountInUsd * rates[currency];

    const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
    return `${symbol}${amountInTarget.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      rates,
      loading,
      changeCurrency,
      formatPrice: convertAndFormat,
      availableCurrencies: rates ? Object.keys(rates) : ['ZAR']
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
