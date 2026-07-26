import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SiteSettingsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
