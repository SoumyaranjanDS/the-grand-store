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

  const parts = String(displayValue).trim().match(/^([^\d+-]*)([-+]?\d.*)$/u);
  const currencyText = parts?.[1]?.trim() || "";
  const amountText = parts?.[2]?.trim() || displayValue;

  return (
    <span
      className={`inline-flex min-w-0 items-baseline gap-[0.16em] whitespace-nowrap align-baseline font-sans ${className}`}
      aria-label={String(displayValue)}
    >
      {currencyText && (
        <span className="text-[0.72em] font-semibold leading-none tracking-normal text-[#d8b76d]">
          {currencyText}
        </span>
      )}
      <span className="tabular-nums leading-none tracking-[-0.045em] text-[#e1bd70]">
        {amountText}
      </span>
    </span>
  );
};

export default Price;
