import { useEffect, useState, useCallback, useRef } from "react";
import { Play, Info, Star, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentItem, ContentRow } from "@/types";
import { fetchHomeRows, setCachedContent } from "@/lib/contentService";
import { useStore } from "@/store/AppStore";
import { useRouter } from "@/store/Router";
import { ContentRow as ContentRowComponent } from "@/components/ContentRow";
import { HeroSkeleton, RowSkeleton } from "@/components/Skeletons";

const SLIDE_INTERVAL = 6000; // ms between auto-slides
const MAX_HERO_ITEMS = 8;

export function HomePage() {
  const { navigate } = useRouter();
  const { continueWatching } = useStore();
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [heroItems, setHeroItems] = useState<ContentItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const heroPoolRef = useRef<ContentItem[]>([]);

  const hero = heroItems[activeIndex] ?? null;

  // â”€â”€ timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const restartTimer = useCallback((pool: ContentItem[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pool.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((cur) => {
        const next = (cur + 1) % pool.length;
        setPrevIndex(cur);
        setTimeout(() => setPrevIndex(null), 700);
        return next;
      });
    }, SLIDE_INTERVAL);
  }, []);

  // â”€â”€ data loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadContent = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchHomeRows(isRefresh);

      let finalRows = data;
      if (isRefresh && data.length > 2) {
        const [first, ...rest] = data;
        finalRows = [first, ...rest.sort(() => Math.random() - 0.5)];
      }
      setRows(finalRows);

      const allItems = finalRows
        .flatMap((r) => r.items)
        .filter((i) => i.poster || i.backdrop);
      const pool = allItems.sort(() => Math.random() - 0.5).slice(0, MAX_HERO_ITEMS);

      if (pool.length > 0) {
        pool.forEach((item) => setCachedContent(item));
        heroPoolRef.current = pool;
        setHeroItems(pool);
        setActiveIndex(0);
        setPrevIndex(null);
        restartTimer(pool);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load content");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restartTimer]);

  useEffect(() => {
    loadContent();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loadContent]);

  // â”€â”€ manual nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const goTo = (idx: number) => {
    const pool = heroPoolRef.current;
    if (!pool.length) return;
    const next = (idx + pool.length) % pool.length;
    setPrevIndex(activeIndex);
    setActiveIndex(next);
    setTimeout(() => setPrevIndex(null), 700);
    restartTimer(pool); // reset timer on manual nav
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-20 animate-page-enter">
        <HeroSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] px-4 text-center animate-page-enter">
        <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-3xl">ðŸ“¡</div>
        <p className="text-xl font-bold mb-2 text-white">Unable to load library catalog</p>
        <p className="text-muted text-sm mb-6 max-w-md">{error}</p>
        <button
          onClick={() => loadContent(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold btn-interactive shadow-lg shadow-primary/30"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Retry Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-page-enter">
      {/* â”€â”€ Auto-sliding Hero Banner â”€â”€ */}
      {hero && (
        <div
          className="relative h-[55vh] md:h-[82vh] w-full overflow-hidden"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {/* Slides â€” stack with crossfade */}
          {heroItems.map((item, i) => (
            <HeroSlide
              key={item.id}
              item={item}
              visible={i === activeIndex}
              exiting={i === prevIndex}
            />
          ))}

          {/* Gradients */}
          <div className="absolute inset-0 hero-gradient pointer-events-none z-10" />
          <div className="absolute inset-0 hero-gradient-left pointer-events-none z-10" />

          {/* Refresh button */}
          <div className="absolute top-4 right-4 md:top-8 md:right-12 z-30">
            <button
              onClick={() => loadContent(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-semibold hover:bg-black/70 btn-interactive transition shadow-lg"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Prev / Next arrows */}
          {heroItems.length > 1 && (
            <>
              <button
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/75 hover:scale-110 transition-all duration-200 shadow-xl"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/75 hover:scale-110 transition-all duration-200 shadow-xl"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Meta + CTA */}
          <div className="absolute bottom-16 md:bottom-28 left-4 md:left-12 right-4 md:right-12 max-w-2xl z-20">
            <div key={`hero-meta-${activeIndex}`} className="animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-primary text-white uppercase tracking-wider shadow-lg">
                  {hero.mediaType === "tv" ? "Series" : hero.mediaType === "anime" ? "Anime" : "Movie"}
                </span>
                {hero.rating ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    {hero.rating.toFixed(1)}
                  </span>
                ) : null}
                {hero.year && (
                  <span className="text-xs text-muted font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                    {hero.year}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-6xl font-extrabold mb-3 leading-tight tracking-tight text-white drop-shadow-lg line-clamp-2">
                {hero.title}
              </h1>
              {hero.genres && hero.genres.length > 0 && (
                <p className="text-sm md:text-base text-muted font-medium mb-5 drop-shadow">
                  {hero.genres.slice(0, 4).join(" â€¢ ")}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setCachedContent(hero); navigate("watch", { id: hero.id }, hero.isMovie ? {} : undefined); }}
                  className="flex items-center gap-2.5 px-6 md:px-8 py-3.5 rounded-xl bg-white text-black font-extrabold btn-interactive hover:bg-white/90 shadow-2xl"
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" /> Play Now
                </button>
                <button
                  onClick={() => { setCachedContent(hero); navigate("details", { id: hero.id }); }}
                  className="flex items-center gap-2.5 px-6 md:px-8 py-3.5 rounded-xl bg-white/15 backdrop-blur-md text-white font-bold btn-interactive hover:bg-white/25 border border-white/20 shadow-lg"
                >
                  <Info className="w-5 h-5" /> More Details
                </button>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          {heroItems.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {heroItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {i === activeIndex ? (
                    <span
                      className="block h-2 rounded-full bg-white/30 overflow-hidden"
                      style={{ width: 32 }}
                    >
                      <span
                        key={`prog-${activeIndex}`}
                        className="block h-full bg-white rounded-full"
                        style={{
                          animation: `heroProgress ${SLIDE_INTERVAL}ms linear forwards`,
                        }}
                      />
                    </span>
                  ) : (
                    <span
                      className="block w-2 h-2 rounded-full bg-white/40 hover:bg-white/70 transition-all duration-300"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="py-4 mt-2">
          <div className="flex items-center justify-between mb-3 px-4 md:px-12">
            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white">Continue Watching</h2>
          </div>
          <div className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar px-4 md:px-12">
            {continueWatching.map((cw) => {
              const progress = cw.duration > 0 ? (cw.position / cw.duration) * 100 : 0;
              return (
                <div
                  key={`${cw.content_id}-${cw.episode_id || "m"}`}
                  className="w-64 md:w-80 flex-shrink-0 cursor-pointer group content-card"
                  onClick={() =>
                    navigate(
                      "watch",
                      { id: cw.content_id },
                      cw.episode_id ? { ep: cw.episode_id } : undefined
                    )
                  }
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-2 border border-border/50 group-hover:border-primary/50 transition-colors">
                    {cw.backdrop || cw.poster ? (
                      <img
                        src={cw.backdrop || cw.poster || ""}
                        alt={cw.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-2 text-muted">
                        <Play className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-sm font-bold text-white line-clamp-1 drop-shadow">{cw.title}</p>
                      {cw.season && cw.episode && (
                        <p className="text-xs text-muted font-medium mt-0.5">S{cw.season} E{cw.episode}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Content rows */}
      {rows.map((row, i) => (
        <ContentRowComponent key={`${row.name}-${i}`} name={row.name} items={row.items} />
      ))}
    </div>
  );
}

// â”€â”€ Individual slide (crossfade) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HeroSlide({
  item,
  visible,
  exiting,
}: {
  item: ContentItem;
  visible: boolean;
  exiting: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
      style={{
        opacity: visible ? 1 : 0,
        zIndex: visible ? 2 : exiting ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {!imgError && (item.backdrop || item.poster) ? (
        <img
          src={item.backdrop || item.poster || ""}
          alt={item.title}
          className="w-full h-full object-cover"
          style={{
            transform: visible ? "scale(1.05)" : "scale(1)",
            transition: "transform 8s ease-out",
          }}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-surface-2 via-bg to-surface" />
      )}
    </div>
  );
}
