import { useEffect, useMemo, useState } from "react";
import { Film, Tv, Sparkles, Filter } from "lucide-react";
import type { ContentItem } from "@/types";
import { fetchHomeRows } from "@/lib/contentService";
import { ContentCardGrid } from "@/components/ContentCard";
import { GridSkeleton } from "@/components/Skeletons";

export function BrowsePage() {
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState<string>("All");
  const [activeType, setActiveType] = useState<string>("All");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rows = await fetchHomeRows();
        const items = rows.flatMap((r) => r.items);
        // Deduplicate by id
        const seen = new Set<string>();
        const unique = items.filter((i) => {
          if (seen.has(i.id)) return false;
          seen.add(i.id);
          return true;
        });
        setAllItems(unique);
      } catch {
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => i.genres.forEach((g) => set.add(g)));
    return ["All", ...Array.from(set).sort()];
  }, [allItems]);

  const types = [
    { label: "All", value: "All", icon: Filter },
    { label: "Movies", value: "movie", icon: Film },
    { label: "TV Shows", value: "tv", icon: Tv },
    { label: "Anime", value: "anime", icon: Sparkles },
  ];

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (activeType !== "All" && item.mediaType !== activeType) return false;
      if (activeGenre !== "All" && !item.genres.includes(activeGenre)) return false;
      return true;
    });
  }, [allItems, activeGenre, activeType]);

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Browse</h1>

      {/* Type filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                activeType === t.value ? "bg-primary text-white" : "bg-surface-2 text-muted hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Genre filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeGenre === g ? "bg-accent text-black" : "bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <GridSkeleton count={18} />
      ) : filtered.length > 0 ? (
        <>
          <p className="text-sm text-muted mb-4">{filtered.length} title{filtered.length !== 1 ? "s" : ""}</p>
          <ContentCardGrid items={filtered} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Filter className="w-12 h-12 text-muted mb-4 opacity-50" />
          <p className="text-muted">No titles match your filters.</p>
        </div>
      )}
    </div>
  );
}
