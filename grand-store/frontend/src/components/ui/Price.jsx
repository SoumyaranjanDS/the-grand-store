import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const Price = ({ amount, className = "" }) => {
  const { formatPrice, loading } = useCurrency();

  if (loading) {
    const formatted = parseFloat(amount);
    return <span className={className}>R{isNaN(formatted) ? amount : formatted.toFixed(2)}</span>;
  }

  return <span className={className}>{formatPrice(amount)}</span>;
};

export default Price;
