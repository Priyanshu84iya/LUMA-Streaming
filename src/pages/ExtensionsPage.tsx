import { useEffect, useState } from "react";
import {
  Puzzle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe,
  Package,
  Calendar,
  Code,
  AlertCircle,
  Trash2,
  Database,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import type { ExtensionRepo } from "@/types";
import {
  fetchAllRepos,
  fetchHomeRows,
  pingExtension,
} from "@/lib/contentService";
import { getExtensionState, saveExtensionState } from "@/lib/userData";
import { useStore } from "@/store/AppStore";

export function ExtensionsPage() {
  const { refreshLists } = useStore();
  const [repos, setRepos] = useState<ExtensionRepo[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [libraryCount, setLibraryCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await loadState();
      await loadRepos();
      setLoading(false);
    })();
  }, []);

  const loadState = async () => {
    const state = await getExtensionState();
    if (state) {
      setConnected(state.connected);
      setLastSync(state.last_sync);
      setLibraryCount(state.library_count || 0);
    }
  };

  const loadRepos = async () => {
    try {
      const r = await fetchAllRepos();
      setRepos(r);
      // Auto-expand the first repo with plugins
      const firstWithPlugins = r.find((repo) => repo.plugins.length > 0);
      if (firstWithPlugins) setExpandedRepo(firstWithPlugins.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch extension data");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    setError(null);
    try {
      const ping = await pingExtension();
      if (!ping) {
        setError("Could not reach the streaming data source. The proxy may be unavailable.");
        setSyncing(false);
        return;
      }

      const rows = await fetchHomeRows();
      const count = rows.reduce((acc, r) => acc + r.items.length, 0);

      setConnected(true);
      setLibraryCount(count);
      const now = new Date().toISOString();
      setLastSync(now);
      const totalPlugins = repos.reduce((acc, r) => acc + r.plugins.length, 0);
      setSyncMsg(`Synced ${count} titles from ${rows.length} categories across ${repos.length} repos (${totalPlugins} plugins).`);

      const primaryManifest = repos[0]?.manifest;
      await saveExtensionState({
        name: primaryManifest?.name || "LUMA",
        connected: true,
        last_sync: now,
        library_count: count,
        status: "connected",
        raw_manifest: primaryManifest as unknown as Record<string, unknown> | null,
      });

      await refreshLists();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
      setConnected(false);
      await saveExtensionState({
        name: "LUMA",
        connected: false,
        last_sync: lastSync,
        library_count: libraryCount,
        status: "error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setConnected(false);
    setLibraryCount(0);
    setLastSync(null);
    await saveExtensionState({
      name: "LUMA",
      connected: false,
      last_sync: null,
      library_count: 0,
      status: "disconnected",
    });
  };

  const toggleRepo = (id: string) => {
    setExpandedRepo(expandedRepo === id ? null : id);
  };

  if (loading) {
    return (
      <div className="px-4 md:px-12 py-6 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalPlugins = repos.reduce((acc, r) => acc + r.plugins.length, 0);

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Puzzle className="w-7 h-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-extrabold">Extension Manager</h1>
      </div>

      {/* Connection Status Card */}
      <div className="bg-surface-2/50 rounded-2xl border border-border p-5 md:p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold mb-1">LUMA Data Layer</h2>
            <p className="text-sm text-muted">
              {repos.length} repositories • {totalPlugins} extensions installed
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            connected ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
          }`}>
            {connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatusCard icon={Database} label="Library Size" value={libraryCount > 0 ? `${libraryCount} titles` : "—"} />
          <StatusCard
            icon={Calendar}
            label="Last Sync"
            value={lastSync ? new Date(lastSync).toLocaleDateString() : "Never"}
          />
          <StatusCard icon={Layers} label="Repositories" value={`${repos.length}`} />
          <StatusCard icon={Package} label="Extensions" value={`${totalPlugins}`} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition disabled:opacity-50"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncing ? "Syncing..." : "Sync Library"}
          </button>
          {connected && (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border text-muted hover:text-white hover:border-red-500 transition"
            >
              <Trash2 className="w-4 h-4" /> Disconnect
            </button>
          )}
        </div>

        {syncMsg && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-400 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> {syncMsg}
          </div>
        )}
        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-400 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{error}</span>
          </div>
        )}
      </div>

      {/* Repositories */}
      <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Repositories</h2>
      <div className="space-y-3 mb-6">
        {repos.map((repo) => (
          <div key={repo.id} className="bg-surface-2/50 rounded-xl border border-border overflow-hidden">
            {/* Repo header */}
            <button
              onClick={() => toggleRepo(repo.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-surface-2 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 overflow-hidden flex items-center justify-center">
                {repo.manifest.iconUrl ? (
                  <img
                    src={repo.manifest.iconUrl}
                    alt={repo.manifest.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <Layers className="w-5 h-5 text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-sm">{repo.manifest.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    repo.plugins.length > 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    {repo.plugins.length > 0 ? `${repo.plugins.length} plugins` : "Offline"}
                  </span>
                </div>
                <p className="text-xs text-muted line-clamp-1">{repo.manifest.description}</p>
              </div>
              {expandedRepo === repo.id ? (
                <ChevronDown className="w-5 h-5 text-muted flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
              )}
            </button>

            {/* Plugin list */}
            {expandedRepo === repo.id && repo.plugins.length > 0 && (
              <div className="border-t border-border divide-y divide-border/50 max-h-[600px] overflow-y-auto">
                {repo.plugins.map((plugin) => (
                  <div key={plugin.internalName} className="flex items-start gap-3 p-3 hover:bg-surface-2/50 transition">
                    <div className="w-9 h-9 rounded-lg bg-surface flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={plugin.iconUrl}
                        alt={plugin.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{plugin.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary">v{plugin.version}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500/15 text-green-400">Active</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{plugin.description}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-muted">
                        <span className="flex items-center gap-0.5"><Code className="w-2.5 h-2.5" /> API v{plugin.apiVersion}</span>
                        <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> {plugin.language.toUpperCase()}</span>
                        <span className="flex items-center gap-0.5"><Package className="w-2.5 h-2.5" /> {(plugin.fileSize / 1024).toFixed(1)} KB</span>
                        <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> by {plugin.authors.join(", ")}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {plugin.tvTypes.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded-full bg-surface border border-border text-[10px] text-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data Source Info */}
      <div className="bg-surface-2/50 rounded-xl border border-border p-4">
        <h3 className="font-bold text-sm mb-3">Data Sources</h3>
        <p className="text-xs text-muted mb-3">The data source for LUMA is a collection of repositories that provide the content library and metadata for the app.</p>
        <p className="text-xs text-muted mb-3">Each repository contains one or more plugins that fetch content from various streaming services and provide metadata such as titles, descriptions, genres, and images.</p>
        <p className="text-xs text-muted mb-3">The data source is maintained by the community and can be updated by the app developer or the repository owners.</p>
        <p className="text-xs text-muted mb-3">If you are a user and want to report an issue with the content or metadata, please contact the repository owner or the app developer.</p>
        <p className="text-xs text-muted mb-3">This is the data source for LUMA. It provides the content library and metadata for the app.</p>
        <p className="text-xs text-muted mb-3">If you are the owner of this data source and want to update the content or metadata, please contact the app developer.</p>
        <p className="text-xs text-muted mb-3">If you are a developer and want to create your own data source for LUMA, please refer to the documentation.</p>
        <p className="text-xs text-muted mb-3">For more information about LUMA and its data sources, please visit the official website.</p>
        <p className="text-xs text-muted mb-3">Thank you for using LUMA!</p>
        {/* <div className="space-y-3">
          {repos.map((repo) => (
            <div key={repo.id} className="text-xs text-muted">
              <p className="font-semibold text-text">{repo.manifest.name}</p>
              <p className="break-all">{repo.sourceUrl}</p>
              {repo.manifest.pluginLists?.[0] && (
                <p className="break-all mt-0.5">Plugins: {repo.manifest.pluginLists[0]}</p>
              )}
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-muted" />
        <span className="text-xs text-muted">{label}</span>
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
