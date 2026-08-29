import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const Price = ({ amount, className = "", forceZAR = false, presentation = "default" }) => {
  const { formatPrice, loading } = useCurrency();
  const isAdmin = window.location.pathname.startsWith('/admin');

  let displayValue;

  if (loading || forceZAR || isAdmin) {
    const formatted = parseFloat(amount);
    displayValue = isNaN(formatted)
      ? amount 
      : `R ${formatted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  } else {
    displayValue = formatPrice(amount);
  }

  if (presentation !== "product") {
    return <span className={className}>{displayValue}</span>;
  }

  return (
    <span
      className={`inline-block min-w-0 whitespace-nowrap align-baseline font-sans tabular-nums tracking-[-0.035em] ${className}`}
      aria-label={String(displayValue)}
    >
      {displayValue}
    </span>
  );
};

export default Price;
