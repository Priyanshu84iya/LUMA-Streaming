import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWAContext } from '@/hooks/usePWA';

export function OfflineBanner() {
  const { isOnline } = usePWAContext();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Show offline banner
  if (!isOnline) {
    return (
      <div
        className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-[90] animate-fade-in-up"
        role="status"
        aria-live="assertive"
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-2xl border border-white/10"
          style={{ background: '#1c1c28', backdropFilter: 'blur(20px)' }}
        >
          <WifiOff className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-400">No internet connection</span>
          <span className="text-muted text-xs">• App shell cached</span>
        </div>
      </div>
    );
  }

  // Show reconnected toast
  if (showReconnected) {
    return (
      <div
        className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-[90] animate-fade-in-up"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-2xl border border-green-500/30"
          style={{ background: 'linear-gradient(135deg, #0f2a15, #14141c)', backdropFilter: 'blur(20px)' }}
        >
          <Wifi className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-green-400">Back online!</span>
        </div>
      </div>
    );
  }

  return null;
}
