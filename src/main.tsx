import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// HashRouter rather than BrowserRouter: the same build has to work from a
// GitHub Pages subpath and from Capacitor's file:// origin, neither of which
// can serve an SPA fallback for arbitrary paths.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
