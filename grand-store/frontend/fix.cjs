const fs = require('fs');
const lines = fs.readFileSync('src/styles.css', 'utf8').split('\n');

const replacement = `
.quick-actions {
  @apply absolute;
  top: 12px;
  right: 12px;
  z-index: 4;
  @apply flex flex-col;
  gap: 7px;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 200ms ease, transform 200ms ease;
}

.product-card:hover .quick-actions,
.quick-actions:focus-within {
  opacity: 1;
  transform: translateX(0);
}

.quick-actions .icon-button {
  width: 36px;
  height: 36px;
  color: #eee8dd;
  background: rgba(10, 9, 7, 0.78);
}

.product-info {
  min-height: 178px;
  padding: 19px 18px 17px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.product-category {
  overflow: hidden;
  margin: 0 0 8px;
  color: var(--color-gold);
  font-size: 10px;
  letter-spacing: 0.13em;
  text-overflow: ellipsis;
  @apply uppercase;
  white-space: nowrap;
}

.product-info h3 {
  height: 78px;
  @apply m-0;
  font-family: var(--serif);
  font-size: 24px;
  @apply font-medium;
  line-height: 1.08;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-origin {
  margin: 4px 0 15px;
  color: #777169;
  font-size: 12px;
}

.product-buy-row {
  @apply flex items-center justify-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  gap: 8px;
}

.product-buy-row strong {
  color: var(--color-gold-bright);
  font-family: 'Inter', 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: baseline;
}

.product-buy-row button {
  @apply inline-flex items-center p-0;
  gap: 7px;
  @apply border-0;
  color: #cbc4b9;
  background: transparent;
  font-size: 10px;
  @apply font-semibold;
  letter-spacing: 0.1em;
  @apply uppercase cursor-pointer;
  transition: color 160ms ease;
}
`.trim();

// Index 1288 is line 1289. We want to remove 18 lines (up to line 1306).
lines.splice(1288, 18, replacement);

fs.writeFileSync('src/styles.css', lines.join('\n'));
console.log('Fixed styles.css');
