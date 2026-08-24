import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import WishlistProvider from './WishlistProvider.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <LocationProvider>
          <AuthProvider>
            <CurrencyProvider>
              <ProductProvider>
                <WishlistProvider>
                  <App />
                </WishlistProvider>
              </ProductProvider>
            </CurrencyProvider>
          </AuthProvider>
        </LocationProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
