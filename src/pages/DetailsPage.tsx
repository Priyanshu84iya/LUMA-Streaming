import { useEffect, useState } from "react";
import {
  Play,
  ArrowLeft,
  Star,
  Plus,
  Check,
  Bookmark,
  Calendar,
  Clock,
  Tv,
  Film,
  Globe,
  FilmIcon,
  User,
  Users,
} from "lucide-react";
import type { ContentItem, Episode } from "@/types";
import { fetchContentDetails, fetchSeasonEpisodes, setCachedContent } from "@/lib/contentService";
import { useStore } from "@/store/AppStore";
import { useRouter } from "@/store/Router";
import { DetailsSkeleton } from "@/components/Skeletons";

export function DetailsPage() {
  const { route, navigate } = useRouter();
  const id = route.params.id;
  const { favoriteIds, watchLaterIds, toggleFavorite, toggleWatchLater, continueWatching } = useStore();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState(0);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
  const [epsLoading, setEpsLoading] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchContentDetails(id);
        setContent(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load content details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load episodes for active season when content is a TV series
  useEffect(() => {
    if (!content || content.isMovie) return;
    const season = content.seasons?.[activeSeason];
    const seasonId = season?.id || `s${activeSeason + 1}`;

    (async () => {
      setEpsLoading(true);
      try {
        const eps = await fetchSeasonEpisodes(seasonId, content.id);
        if (eps.length > 0) {
          setSeasonEpisodes(eps);
        } else {
          setSeasonEpisodes(content.episodes?.filter((e) => e.season === (activeSeason + 1)) || []);
        }
      } catch {
        setSeasonEpisodes(content.episodes?.filter((e) => e.season === (activeSeason + 1)) || []);
      } finally {
        setEpsLoading(false);
      }
    })();
  }, [content, activeSeason]);

  if (loading) return <DetailsSkeleton />;

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] px-4 text-center animate-page-enter">
        <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-3xl">⚠️</div>
        <p className="text-xl font-bold mb-2 text-white">Unable to load content details</p>
        <p className="text-muted text-sm mb-6 max-w-md">{error || "Content not found."}</p>
        <button
          onClick={() => navigate("home")}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold btn-interactive shadow-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isFav = favoriteIds.has(content.id);
  const isLater = watchLaterIds.has(content.id);
  const resumeEntry = continueWatching.find((cw) => cw.content_id === content.id);
  const backdropImage = content.backdrop || content.poster;
  const posterImage = content.poster || content.backdrop;

  return (
    <div className="pb-20 animate-page-enter">
      {/* Backdrop Section (1. Title, 2. Poster, 3. Backdrop) */}
      <div className="relative h-[42vh] md:h-[60vh] w-full bg-gradient-to-b from-surface-2 to-surface overflow-hidden">
        {backdropImage && !backdropError ? (
          <img
            src={backdropImage}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-1000 scale-105"
            referrerPolicy="no-referrer"
            onError={() => setBackdropError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-surface-2 via-surface to-bg text-muted">
            <Film className="w-16 h-16 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 hero-gradient" />
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80 btn-interactive transition border border-white/10 z-20 shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Main Details Body */}
      <div className="px-4 md:px-12 -mt-24 md:-mt-36 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster Card */}
          <div className="w-36 sm:w-44 md:w-56 flex-shrink-0 mx-auto md:mx-0">
            <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-border/60 bg-surface-2">
              {posterImage && !posterError ? (
                <img
                  src={posterImage}
                  alt={content.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setPosterError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-2 text-muted p-2">
                  <Film className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs text-center line-clamp-3 font-semibold">{content.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Core Info Panel */}
          <div className="flex-1 space-y-4 text-left">
            {/* Title & Type Badge */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-primary text-white uppercase tracking-wider shadow">
                  {content.isMovie ? "Movie" : content.mediaType === "anime" ? "Anime" : "Series"}
                </span>
                {content.imdbId && (
                  <span className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent text-xs font-bold font-mono">
                    IMDb: {content.imdbId}
                  </span>
                )}
                {content.maturityRating && (
                  <span className="px-2 py-0.5 rounded border border-border bg-surface-2 text-xs font-bold text-muted">
                    {content.maturityRating}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {content.title}
              </h1>
            </div>

            {/* Quick Metadata Row (Rating, Year, Runtime, Language) */}
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold text-muted bg-surface-2/40 p-3 rounded-xl border border-white/5 backdrop-blur-md">
              {content.rating && (
                <span className="flex items-center gap-1 text-white font-bold">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  {content.rating.toFixed(1)} / 10
                </span>
              )}
              {content.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" /> {content.year}
                </span>
              )}
              {content.runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" /> {content.runtime}
                </span>
              )}
              {content.languages && content.languages.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" /> {content.languages.join(", ")}
                </span>
              )}
            </div>

            {/* Genres */}
            {content.genres && content.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-semibold text-text shadow-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Plot / Description */}
            {content.description && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Plot Overview</h3>
                <p className="text-sm md:text-base text-text/90 leading-relaxed max-w-3xl font-normal">
                  {content.description}
                </p>
              </div>
            )}

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs md:text-sm">
              {content.director && (
                <div className="flex items-start gap-2 text-muted">
                  <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-text block">Director</span>
                    <span>{content.director}</span>
                  </div>
                </div>
              )}

              {content.cast && content.cast.length > 0 && (
                <div className="flex items-start gap-2 text-muted">
                  <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-text block">Cast</span>
                    <span>{content.cast.slice(0, 5).join(", ")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Main Action Buttons (Play / Favorite / Watch Later) */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => {
                  setCachedContent(content);
                  if (resumeEntry?.episode_id) {
                    navigate("watch", { id: content.id }, { ep: resumeEntry.episode_id });
                  } else {
                    navigate("watch", { id: content.id });
                  }
                }}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary text-white font-extrabold btn-interactive hover:bg-primary-hover shadow-xl shadow-primary/30"
              >
                <Play className="w-5 h-5 fill-white ml-0.5" />
                {resumeEntry ? "Resume Playback" : "Play Content"}
              </button>

              <button
                onClick={() =>
                  toggleFavorite({
                    content_id: content.id,
                    title: content.title,
                    poster: content.poster || null,
                    backdrop: content.backdrop || content.poster || null,
                    media_type: content.mediaType,
                  })
                }
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border text-xs md:text-sm font-bold btn-interactive transition shadow-md ${
                  isFav
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-surface-2 border-border text-white hover:bg-border"
                }`}
              >
                {isFav ? <Check className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4" />}
                {isFav ? "In Favorites" : "Add Favorite"}
              </button>

              <button
                onClick={() =>
                  toggleWatchLater({
                    content_id: content.id,
                    title: content.title,
                    poster: content.poster || null,
                    backdrop: content.backdrop || content.poster || null,
                    media_type: content.mediaType,
                  })
                }
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border text-xs md:text-sm font-bold btn-interactive transition shadow-md ${
                  isLater
                    ? "bg-accent/20 border-accent text-accent"
                    : "bg-surface-2 border-border text-white hover:bg-border"
                }`}
              >
                {isLater ? <Check className="w-4 h-4 text-accent" /> : <Bookmark className="w-4 h-4" />}
                {isLater ? "Watch Later Saved" : "Save For Later"}
              </button>
            </div>
          </div>
        </div>

        {/* Seasons & Episodes Section for Series */}
        {!content.isMovie && (
          <div className="mt-12 pt-8 border-t border-border/40">
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-4 flex items-center gap-2">
              <Tv className="w-6 h-6 text-primary" /> Seasons & Episodes
            </h2>

            {content.seasons && content.seasons.length > 0 ? (
              <div className="flex items-center gap-2.5 mb-6 overflow-x-auto no-scrollbar py-1">
                {content.seasons.map((season, i) => (
                  <button
                    key={season.id || i}
                    onClick={() => setActiveSeason(i)}
                    className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap btn-interactive shadow transition-all ${
                      activeSeason === i
                        ? "bg-primary text-white shadow-primary/30"
                        : "bg-surface-2 text-muted hover:text-white border border-border/50"
                    }`}
                  >
                    {season.label || `Season ${season.seasonNumber || i + 1}`}
                  </button>
                ))}
              </div>
            ) : null}

            {epsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl skeleton" />
                ))}
              </div>
            ) : seasonEpisodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seasonEpisodes.map((ep) => {
                  const epResume = continueWatching.find(
                    (cw) => cw.content_id === content.id && cw.episode_id === ep.id
                  );
                  const progress =
                    epResume && epResume.duration > 0 ? (epResume.position / epResume.duration) * 100 : 0;
                  return (
                    <div
                      key={ep.id}
                      onClick={() => {
                        setCachedContent(content);
                        navigate("watch", { id: content.id }, { ep: ep.id });
                      }}
                      className="episode-card flex items-center gap-4 p-3 rounded-xl bg-surface-2/40 border border-border/40 hover:border-primary/50 cursor-pointer transition group shadow-md"
                    >
                      <div className="relative w-28 md:w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                        {ep.poster || content.backdrop || content.poster ? (
                          <img
                            src={ep.poster || content.backdrop || content.poster || ""}
                            alt={ep.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-2 text-muted">
                            <Film className="w-6 h-6 opacity-40" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                          </div>
                        </div>
                        {progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm md:text-base text-white group-hover:text-primary transition-colors line-clamp-1">
                          E{ep.episode}. {ep.title}
                        </p>
                        {ep.runtime && <p className="text-xs text-muted font-medium mt-1">{ep.runtime}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-surface-2/30 border border-border/40 text-center text-muted">
                <p className="text-sm font-semibold">No episodes listed for this season.</p>
              </div>
            )}
          </div>
        )}

        {/* Movie Play Button */}
        {content.isMovie && (
          <div className="mt-12 pt-8 border-t border-border/40 flex justify-start">
            <button
              onClick={() => {
                setCachedContent(content);
                navigate("watch", { id: content.id });
              }}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-surface-2 border border-border hover:border-primary text-white font-extrabold btn-interactive shadow-xl group"
            >
              <Play className="w-6 h-6 fill-white group-hover:fill-primary transition-colors" />
              <span>Watch Full Movie Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
