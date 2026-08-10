import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import type { ContentItem, WatchLaterEntry } from "@/types";
import { useStore } from "@/store/AppStore";
import { ContentCardGrid } from "@/components/ContentCard";
import { GridSkeleton } from "@/components/Skeletons";

export function WatchLaterPage() {
  const { watchLater } = useStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mapped: ContentItem[] = watchLater.map((w: WatchLaterEntry) => ({
      id: w.content_id,
      title: w.title,
      poster: w.poster || "",
      backdrop: w.backdrop || w.poster || "",
      mediaType: (w.media_type as ContentItem["mediaType"]) || "movie",
      genres: [],
      isMovie: w.media_type === "movie",
    }));
    setItems(mapped);
    setLoading(false);
  }, [watchLater]);

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen animate-page-enter">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="w-7 h-7 text-accent fill-accent animate-pop" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Watch Later Queue</h1>
      </div>

      {loading ? (
        <GridSkeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bookmark className="w-12 h-12 text-muted mb-4 opacity-40 animate-pulse" />
          <p className="text-muted text-sm font-semibold">No saved items. Use the bookmark button on any title to save it for later viewing.</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-bold text-muted mb-4">{items.length} title{items.length !== 1 ? "s" : ""} in queue</p>
          <ContentCardGrid items={items} />
        </>
      )}
    </div>
  );
}
