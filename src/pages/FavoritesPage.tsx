import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { ContentItem, FavoriteEntry } from "@/types";
import { useStore } from "@/store/AppStore";
import { ContentCardGrid } from "@/components/ContentCard";
import { GridSkeleton } from "@/components/Skeletons";

export function FavoritesPage() {
  const { favorites } = useStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mapped: ContentItem[] = favorites.map((f: FavoriteEntry) => ({
      id: f.content_id,
      title: f.title,
      poster: f.poster || "",
      backdrop: f.backdrop || f.poster || "",
      mediaType: (f.media_type as ContentItem["mediaType"]) || "movie",
      genres: [],
      isMovie: f.media_type === "movie",
    }));
    setItems(mapped);
    setLoading(false);
  }, [favorites]);

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen animate-page-enter">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-7 h-7 text-primary fill-primary animate-pop" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Your Favorites</h1>
      </div>

      {loading ? (
        <GridSkeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="w-12 h-12 text-muted mb-4 opacity-40 animate-pulse" />
          <p className="text-muted text-sm font-semibold">No favorites saved yet. Tap the favorite button on any movie or series to save it here.</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-bold text-muted mb-4">{items.length} saved title{items.length !== 1 ? "s" : ""}</p>
          <ContentCardGrid items={items} />
        </>
      )}
    </div>
  );
}
