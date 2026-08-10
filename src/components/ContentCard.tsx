import { useState } from "react";
import { Play, Plus, Check, Star, Tv, Film, Bookmark } from "lucide-react";
import type { ContentItem } from "@/types";
import { setCachedContent } from "@/lib/contentService";
import { useStore } from "@/store/AppStore";
import { useRouter } from "@/store/Router";

interface ContentCardProps {
  item: ContentItem;
  index?: number;
}

export function ContentCard({ item, index = 0 }: ContentCardProps) {
  const { navigate } = useRouter();
  const { favoriteIds, watchLaterIds, toggleFavorite, toggleWatchLater } = useStore();
  const [imgError, setImgError] = useState(false);
  const [favAnim, setFavAnim] = useState(false);
  const [laterAnim, setLaterAnim] = useState(false);

  const isFav = favoriteIds.has(item.id);
  const isLater = watchLaterIds.has(item.id);

  const handleDetailsClick = () => {
    setCachedContent(item);
    navigate("details", { id: item.id });
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCachedContent(item);
    navigate("watch", { id: item.id }, item.isMovie ? {} : undefined);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavAnim(true);
    setTimeout(() => setFavAnim(false), 350);
    toggleFavorite({
      content_id: item.id,
      title: item.title,
      poster: item.poster || null,
      backdrop: item.backdrop || item.poster || null,
      media_type: item.mediaType,
    });
  };

  const handleLaterToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLaterAnim(true);
    setTimeout(() => setLaterAnim(false), 350);
    toggleWatchLater({
      content_id: item.id,
      title: item.title,
      poster: item.poster || null,
      backdrop: item.backdrop || item.poster || null,
      media_type: item.mediaType,
    });
  };

  return (
    <div
      className="content-card group relative flex-shrink-0 cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
      onClick={handleDetailsClick}
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-surface-2 border border-border/40 group-hover:border-primary/50 transition-colors">
        {!imgError && item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-2 to-surface text-muted p-2">
            {item.mediaType === "tv" ? <Tv className="w-8 h-8 mb-2 opacity-60" /> : <Film className="w-8 h-8 mb-2 opacity-60" />}
            <span className="text-xs text-center font-medium line-clamp-2 px-1 text-text">{item.title}</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/75 backdrop-blur-md text-white uppercase tracking-wider shadow">
            {item.mediaType === "tv" ? "TV" : item.mediaType === "anime" ? "Anime" : "Movie"}
          </span>
        </div>

        {/* Rating badge */}
        {item.rating ? (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md z-10 shadow">
            <Star className="w-2.5 h-2.5 fill-accent text-accent" />
            <span className="text-[10px] font-bold text-white">{item.rating.toFixed(1)}</span>
          </div>
        ) : null}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
          <h3 className="text-sm font-bold text-white line-clamp-2 mb-0.5 drop-shadow">{item.title}</h3>
          {item.genres && item.genres.length > 0 && (
            <p className="text-[11px] text-muted line-clamp-1 mb-2.5">{item.genres.slice(0, 3).join(" • ")}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayClick}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-white text-black text-xs font-bold btn-interactive hover:bg-white/90 shadow"
            >
              <Play className="w-3 h-3 fill-black ml-0.5" /> Watch
            </button>
            <button
              onClick={handleFavToggle}
              className={`p-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 btn-interactive hover:bg-white/20 transition ${favAnim ? "animate-pop" : ""}`}
              title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              {isFav ? <Check className="w-3.5 h-3.5 text-primary" /> : <Plus className="w-3.5 h-3.5 text-white" />}
            </button>
            <button
              onClick={handleLaterToggle}
              className={`p-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 btn-interactive hover:bg-white/20 transition ${laterAnim ? "animate-pop" : ""}`}
              title={isLater ? "Remove from watch later" : "Add to watch later"}
            >
              {isLater ? <Check className="w-3.5 h-3.5 text-accent" /> : <Bookmark className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentCardGrid({ items }: { items: ContentItem[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 animate-page-enter">
      {items.map((item, i) => (
        <ContentCard key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}
