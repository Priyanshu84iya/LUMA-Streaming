import { useEffect, useState } from "react";
import { Clock, Trash2, Play } from "lucide-react";
import type { WatchHistoryEntry } from "@/types";
import { clearWatchHistory } from "@/lib/userData";
import { useStore } from "@/store/AppStore";
import { useRouter } from "@/store/Router";
import { GridSkeleton } from "@/components/Skeletons";

export function HistoryPage() {
  const { navigate } = useRouter();
  const { watchHistory, refreshLists } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [watchHistory]);

  const handleClear = async () => {
    await clearWatchHistory();
    await refreshLists();
  };

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen animate-page-enter">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-7 h-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Watch History</h1>
        </div>
        {watchHistory.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border/50 text-xs font-bold text-muted hover:text-white hover:border-primary btn-interactive transition shadow"
          >
            <Trash2 className="w-4 h-4 text-primary" /> Clear History
          </button>
        )}
      </div>

      {loading ? (
        <GridSkeleton />
      ) : watchHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Clock className="w-12 h-12 text-muted mb-4 opacity-40 animate-pulse" />
          <p className="text-muted text-sm font-semibold">No watch history recorded yet. Play any title to keep track of your watch progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchHistory.map((entry: WatchHistoryEntry) => {
            const progress = entry.duration > 0 ? (entry.position / entry.duration) * 100 : 0;
            return (
              <div
                key={entry.id}
                onClick={() =>
                  navigate(
                    "watch",
                    { id: entry.content_id },
                    entry.episode_id ? { ep: entry.episode_id } : undefined
                  )
                }
                className="episode-card flex items-center gap-4 p-3.5 rounded-xl bg-surface-2/40 border border-border/40 hover:border-primary/50 cursor-pointer transition group shadow"
              >
                <div className="relative w-28 md:w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                  {entry.backdrop || entry.poster ? (
                    <img
                      src={entry.backdrop || entry.poster || ""}
                      alt={entry.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-2 text-muted">
                      <Play className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                  {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm md:text-base text-white group-hover:text-primary transition-colors line-clamp-1">
                    {entry.title}
                  </p>
                  {entry.season && entry.episode && (
                    <p className="text-xs text-muted font-medium mt-0.5">
                      Season {entry.season} • Episode {entry.episode}
                    </p>
                  )}
                  <p className="text-xs text-muted font-medium mt-1">
                    {Math.floor(progress)}% watched • {new Date(entry.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
