import { useState } from 'react';
import { Download, X, Smartphone, Monitor, Zap } from 'lucide-react';
import { usePWAContext } from '@/hooks/usePWA';

export function PWAInstallBanner() {
  const { canInstall, promptInstall, isStandalone } = usePWAContext();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Don't show if already installed, dismissed, or can't install
  if (isStandalone || dismissed || !canInstall) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const outcome = await promptInstall();
    setInstalling(false);
    if (outcome === 'accepted') {
      setInstalled(true);
      setTimeout(() => setDismissed(true), 2000);
    }
  };

  return (
    <div
      className="fixed z-50 animate-fade-in-up left-3 right-3 bottom-16 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[calc(100vw-2rem)] md:bottom-6 max-w-md pointer-events-auto"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="banner"
      aria-label="Install LUMA app"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border/60 shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar"
        style={{
          background: 'linear-gradient(135deg, #14141c 0%, #1c1c28 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Glow accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, #e50914, transparent)',
          }}
        />

        <div className="p-3.5 sm:p-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-sm font-bold text-white truncate pr-2">Install LUMA</h3>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors -mr-1 -mt-1 flex-shrink-0"
                  aria-label="Dismiss install prompt"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted mb-2.5 sm:mb-3 leading-relaxed break-words">
                Get the full app experience — faster loads, offline support &amp; no browser UI.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2.5 sm:mb-3">
                {[
                  { icon: Zap, text: 'Faster' },
                  { icon: Smartphone, text: 'Standalone' },
                  { icon: Monitor, text: 'Desktop App' },
                ].map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                    {text}
                  </span>
                ))}
              </div>

              <button
                onClick={handleInstall}
                disabled={installing || installed}
                className="w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl transition-all btn-interactive disabled:opacity-70"
              >
                {installing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                    Installing…
                  </>
                ) : installed ? (
                  <>✓ Installed!</>
                ) : (
                  <>
                    <Download className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Add to Home Screen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
