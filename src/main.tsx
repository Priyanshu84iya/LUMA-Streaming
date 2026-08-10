import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove the inline PWA splash screen once React has hydrated
function removeSplash() {
  const splash = document.getElementById('pwa-splash');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => splash.remove(), 450);
  }
}

const rootEl = document.getElementById('root')!;
const root = createRoot(rootEl);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Remove splash after first paint
requestAnimationFrame(() => {
  requestAnimationFrame(removeSplash);
});
