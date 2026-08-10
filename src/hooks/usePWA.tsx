import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAState {
  /** Is the app running in standalone/PWA mode? */
  isStandalone: boolean;
  /** Is a new SW update available? */
  updateAvailable: boolean;
  /** Is the browser online? */
  isOnline: boolean;
  /** Can we show the install prompt? */
  canInstall: boolean;
  /** Trigger the native install dialog */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** Apply the pending SW update and reload */
  applyUpdate: () => void;
  /** Dismiss the update banner */
  dismissUpdate: () => void;
  /** SW version string */
  swVersion: string | null;
}

// ---------------------------------------------------------------
// usePWA hook
// ---------------------------------------------------------------
export function usePWA(): PWAState {
  const [isStandalone] = useState<boolean>(
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
  );

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [swVersion, setSwVersion] = useState<string | null>(null);

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  // ----- Online / Offline -----
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ----- Install prompt -----
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setCanInstall(false);
      deferredPromptRef.current = null;
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ----- Service Worker registration & update detection -----
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        console.log('[PWA] SW registered:', registration.scope);

        // Check for updates on page load
        registration.update().catch(console.warn);

        // Detect if there's already a waiting worker (user refreshed quickly)
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          setUpdateAvailable(true);
        }

        // Detect new waiting worker (update downloaded in background)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              setUpdateAvailable(true);
            }
          });
        });

        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SW_UPDATED') {
            setSwVersion(event.data.version ?? null);
          }
          if (event.data?.type === 'SW_VERSION') {
            setSwVersion(event.data.version ?? null);
          }
        });

        // Handle controller change (SW took control → reload once)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        // Ask the active SW for its version
        if (registration.active) {
          registration.active.postMessage({ type: 'CHECK_VERSION' });
        }

        // Periodically check for SW updates (every 60 seconds when online)
        const interval = setInterval(() => {
          if (navigator.onLine) registration.update().catch(console.warn);
        }, 60_000);

        return () => clearInterval(interval);
      } catch (err) {
        console.error('[PWA] SW registration failed:', err);
      }
    };

    registerSW();
  }, []);

  // ----- Actions -----
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPromptRef.current) return 'unavailable';
    try {
      await deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      deferredPromptRef.current = null;
      setCanInstall(false);
      return outcome;
    } catch {
      return 'unavailable';
    }
  }, []);

  const applyUpdate = useCallback(() => {
    const worker = waitingWorkerRef.current;
    if (worker) {
      worker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    setUpdateAvailable(false);
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    isStandalone,
    updateAvailable,
    isOnline,
    canInstall,
    promptInstall,
    applyUpdate,
    dismissUpdate,
    swVersion,
  };
}

// ---------------------------------------------------------------
// Context (so child components can access PWA state without prop-drilling)
// ---------------------------------------------------------------
import { createContext, useContext, type ReactNode } from 'react';

const PWAContext = createContext<PWAState | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const pwa = usePWA();
  return <PWAContext.Provider value={pwa}>{children}</PWAContext.Provider>;
}

export function usePWAContext(): PWAState {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error('usePWAContext must be used within PWAProvider');
  return ctx;
}
