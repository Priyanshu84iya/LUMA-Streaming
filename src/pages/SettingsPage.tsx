import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Volume2, Subtitles, Play, Zap, Palette, RotateCcw } from "lucide-react";
import { useStore } from "@/store/AppStore";
import { defaultSettings } from "@/lib/userData";
import { useRouter } from "@/store/Router";

export function SettingsPage() {
  const { settings, setSettings } = useStore();
  const { navigate } = useRouter();

  const qualities = [
    { label: "Auto", value: 0 },
    { label: "360p", value: 360 },
    { label: "480p", value: 480 },
    { label: "720p", value: 720 },
    { label: "1080p", value: 1080 },
  ];

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-7 h-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-extrabold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Playback */}
        <section>
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Playback</h2>
          <div className="space-y-1 bg-surface-2/50 rounded-xl border border-border overflow-hidden">
            <ToggleRow
              icon={Play}
              label="Autoplay"
              description="Automatically start playing the next episode"
              value={settings.autoplay}
              onChange={(v) => setSettings({ autoplay: v })}
            />
            <div className="border-t border-border" />
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-muted" />
                <div>
                  <p className="font-medium text-sm">Default Quality</p>
                  <p className="text-xs text-muted">Preferred video resolution</p>
                </div>
              </div>
              <select
                value={settings.defaultQuality}
                onChange={(e) => setSettings({ defaultQuality: parseInt(e.target.value) })}
                className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
              >
                {qualities.map((q) => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Audio & Subtitles */}
        <section>
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Audio & Subtitles</h2>
          <div className="space-y-1 bg-surface-2/50 rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-5 h-5 text-muted" />
                <div>
                  <p className="font-medium text-sm">Volume</p>
                  <p className="text-xs text-muted">Default playback volume</p>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) => setSettings({ volume: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="border-t border-border" />
            <ToggleRow
              icon={Subtitles}
              label="Subtitles"
              description="Enable subtitles by default"
              value={settings.subtitlesEnabled}
              onChange={(v) => setSettings({ subtitlesEnabled: v })}
            />
            <div className="border-t border-border" />
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Subtitles className="w-5 h-5 text-muted" />
                <div>
                  <p className="font-medium text-sm">Subtitle Language</p>
                  <p className="text-xs text-muted">Preferred subtitle language</p>
                </div>
              </div>
              <select
                value={settings.subtitleLanguage}
                onChange={(e) => setSettings({ subtitleLanguage: e.target.value })}
                className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="ml">Malayalam</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Appearance</h2>
          <div className="space-y-1 bg-surface-2/50 rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted" />
                <div>
                  <p className="font-medium text-sm">Theme</p>
                  <p className="text-xs text-muted">Interface color scheme</p>
                </div>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ theme: e.target.value as "dark" | "midnight" })}
                className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
              >
                <option value="dark">Dark</option>
                <option value="midnight">Midnight</option>
              </select>
            </div>
            <div className="border-t border-border" />
            <ToggleRow
              icon={RotateCcw}
              label="Reduce Motion"
              description="Minimize animations and transitions"
              value={settings.reduceMotion}
              onChange={(v) => setSettings({ reduceMotion: v })}
            />
          </div>
        </section>

        {/* Reset */}
        <section>
          <button
            onClick={() => {
              setSettings(defaultSettings);
            }}
            className="w-full px-4 py-3.5 rounded-xl bg-surface-2 border border-border text-muted hover:text-white hover:border-primary transition text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </section>

        {/* Extension Manager link */}
        <section>
          <button
            onClick={() => navigate("extensions")}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-primary/10 border border-primary/30 text-white hover:bg-primary/20 transition"
          >
            <span className="font-medium text-sm">Extension Manager</span>
            <span className="text-xs text-muted">Manage data source →</span>
          </button>
        </section>
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: typeof Play;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted" />
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition ${value ? "bg-primary" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-6" : ""}`}
        />
      </button>
    </div>
  );
}
