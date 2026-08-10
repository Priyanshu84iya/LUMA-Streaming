import { RefreshCw, X } from 'lucide-react';
import { usePWAContext } from '@/hooks/usePWA';

export function PWAUpdateBanner() {
  const { updateAvailable, applyUpdate, dismissUpdate } = usePWAContext();

  if (!updateAvailable) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] animate-slide-in-right"
      role="alert"
      aria-live="polite"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 border-b border-primary/30"
        style={{
          background: 'linear-gradient(90deg, #1a0a0b 0%, #1c0d0e 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Left: icon + text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">LUMA Update Ready</p>
            <p className="text-xs text-muted truncate">A new version is available — reload to apply.</p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={applyUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors btn-interactive"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Update
          </button>
          <button
            onClick={dismissUpdate}
            className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss update notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
