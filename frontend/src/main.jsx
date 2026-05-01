import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import store from './store';
import './index.css'
import App from './App.jsx'
import './i18n';

// Sync localStorage auth data → sessionStorage so all pages that
// read sessionStorage directly still work after a page refresh or new tab.
const lsToken = localStorage.getItem('token');
const lsUser  = localStorage.getItem('user');
if (lsToken && !sessionStorage.getItem('token')) {
  sessionStorage.setItem('token', lsToken);
}
if (lsUser && !sessionStorage.getItem('user')) {
  sessionStorage.setItem('user', lsUser);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            },
          }}
        />
      </HelmetProvider>
    </Provider>
  </StrictMode>,
)
