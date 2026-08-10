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
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-md animate-fade-in-up"
      role="banner"
      aria-label="Install LUMA app"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border/60 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #14141c 0%, #1c1c28 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Glow accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, #e50914, transparent)',
          }}
        />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-sm font-bold text-white">Install LUMA</h3>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors -mr-1 -mt-1"
                  aria-label="Dismiss install prompt"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Get the full app experience — faster loads, offline support &amp; no browser UI.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { icon: Zap, text: 'Faster' },
                  { icon: Smartphone, text: 'Standalone' },
                  { icon: Monitor, text: 'Desktop App' },
                ].map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {text}
                  </span>
                ))}
              </div>

              <button
                onClick={handleInstall}
                disabled={installing || installed}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all btn-interactive disabled:opacity-70"
              >
                {installing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Installing…
                  </>
                ) : installed ? (
                  <>✓ Installed!</>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Add to Home Screen
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
