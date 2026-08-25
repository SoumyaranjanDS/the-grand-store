import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const Price = ({ amount, className = "", forceZAR = false }) => {
  const { formatPrice, loading } = useCurrency();
  const isAdmin = window.location.pathname.startsWith('/admin');

  if (loading || forceZAR || isAdmin) {
    const formatted = parseFloat(amount);
    const displayValue = isNaN(formatted) 
      ? amount 
      : formatted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return <span className={className}>R{displayValue}</span>;
  }

  return <span className={className}>{formatPrice(amount)}</span>;
};

export default Price;
