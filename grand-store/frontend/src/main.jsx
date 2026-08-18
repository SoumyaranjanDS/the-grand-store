import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import WishlistProvider from './WishlistProvider.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
