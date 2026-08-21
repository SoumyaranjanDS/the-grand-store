const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'layouts', 'Header.jsx');
let content = fs.readFileSync(file, 'utf8');

// Add import if missing
if (!content.includes('useCurrency')) {
  content = content.replace(
    "import { menuCategories } from '../data'",
    "import { menuCategories } from '../data'\nimport { useCurrency } from '../context/CurrencyContext'"
  );
}

// Add state if missing
if (!content.includes('changeCurrency')) {
  content = content.replace(
    "const headerRef = useRef(null)",
    "const headerRef = useRef(null)\n  const { currency, availableCurrencies, changeCurrency } = useCurrency();\n  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);"
  );
}

// Replace ZAR button
if (content.includes('>ZAR <')) {
  const replacement = `
            <div className="relative">
              <button 
                className="flex items-center gap-1 hover:text-gold transition-colors" 
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              >
                {currency} <ChevronDown size={13} />
              </button>
              {showCurrencyDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-panel border border-white-line rounded shadow-lg z-50 min-w-[80px]">
                  {availableCurrencies.map(c => (
                    <button 
                      key={c}
                      className="block w-full text-left px-4 py-2 hover:bg-gold/10 hover:text-gold transition-colors"
                      onClick={() => { changeCurrency(c); setShowCurrencyDropdown(false); }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>`;
            
  // Replace the exact line
  const oldLine = '<button className="flex items-center gap-1 hover:text-gold transition-colors" type="button">ZAR <ChevronDown size={13} /></button>';
  content = content.replace(oldLine, replacement);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Header updated");
