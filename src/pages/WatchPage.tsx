import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Settings,
  Subtitles,
  Loader2,
  SkipBack,
  SkipForward,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { ContentItem, VideoLinks, VideoSource, VideoSubtitle } from "@/types";
import { fetchContentDetails, fetchVideoLinks } from "@/lib/contentService";
import { useStore } from "@/store/AppStore";
import { useRouter } from "@/store/Router";

function formatTime(s: number): string {
  if (!s || !isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function WatchPage() {
  const { route, navigate } = useRouter();
  const contentId = route.params.id;
  const episodeId = route.query.ep || null;
  const { recordProgress, settings, setSettings } = useStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [content, setContent] = useState<ContentItem | null>(null);
  const [currentSource, setCurrentSource] = useState<VideoSource | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<VideoSubtitle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(settings.volume);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubs, setShowSubs] = useState(false);
  const [qualities, setQualities] = useState<VideoSource[]>([]);
  const [subtitles, setSubtitles] = useState<VideoSubtitle[]>([]);
  const [buffering, setBuffering] = useState(false);

  // Load content metadata and video sources
  useEffect(() => {
    if (!contentId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const c = await fetchContentDetails(contentId);
        if (cancelled) return;
        setContent(c);

        let videoLinks: VideoLinks;
        try {
          videoLinks = await fetchVideoLinks(contentId, c.title);
        } catch {
          videoLinks = await fetchVideoLinks("demo", c.title);
        }

        if (cancelled) return;

        if (!videoLinks || videoLinks.sources.length === 0) {
          setError("No playable video sources available.");
          setLoading(false);
          return;
        }

        setQualities(videoLinks.sources);
        setSubtitles(videoLinks.subtitles || []);

        let chosen = videoLinks.sources[0];
        if (settings.defaultQuality > 0) {
          const match = videoLinks.sources.find((s) => s.quality === settings.defaultQuality);
          if (match) chosen = match;
        }
        setCurrentSource(chosen);

        if (settings.subtitlesEnabled && videoLinks.subtitles.length > 0) {
          const subMatch =
            videoLinks.subtitles.find((s) =>
              s.label.toLowerCase().includes(settings.subtitleLanguage)
            ) || videoLinks.subtitles[0];
          setCurrentSubtitle(subMatch);
        }
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load video player");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contentId, episodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load HLS or MP4 direct source
  useEffect(() => {
    if (!currentSource || !videoRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    const url = currentSource.url;

    if (url.includes(".m3u8") || currentSource.type === "hls") {
      import("hls.js")
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (data.fatal) {
                // Fallback to direct mp4 source
                const mp4Fallback = qualities.find((q) => q.type === "mp4");
                if (mp4Fallback && mp4Fallback.url !== url) {
                  setCurrentSource(mp4Fallback);
                }
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(() => {});
          } else {
            const mp4Fallback = qualities.find((q) => q.type === "mp4");
            if (mp4Fallback) setCurrentSource(mp4Fallback);
          }
        })
        .catch(() => {
          video.src = url;
          video.play().catch(() => {});
        });
    } else {
      video.src = url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSource, qualities]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setPosition(video.currentTime);
    const onDur = () => setDuration(video.duration || 0);
    const onVol = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDur);
    video.addEventListener("volumechange", onVol);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDur);
      video.removeEventListener("volumechange", onVol);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  // Record playback progress
  useEffect(() => {
    if (!content || !duration) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !playing) return;
      const pos = video.currentTime;
      const completed = duration > 0 && pos / duration > 0.95;
      recordProgress({
        content_id: content.id,
        episode_id: episodeId,
        title: content.title,
        poster: content.poster || null,
        backdrop: content.backdrop || content.poster || null,
        media_type: content.mediaType,
        season: content.episodes?.find((e) => e.id === episodeId)?.season || null,
        episode: content.episodes?.find((e) => e.id === episodeId)?.episode || null,
        position: Math.floor(pos),
        duration: Math.floor(duration),
        completed,
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [content, duration, playing, episodeId, recordProgress]);

  // Fullscreen state listener
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Controls auto-hide
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing && !showSettings && !showSubs) setShowControls(false);
    }, 3500);
  }, [playing, showSettings, showSubs]);

  useEffect(() => {
    resetControlsTimer();
  }, [playing, resetControlsTimer]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          video.muted = !video.muted;
          break;
        case "ArrowLeft":
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          break;
        case "ArrowUp":
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case "ArrowDown":
          video.volume = Math.max(0, video.volume - 0.1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.currentTime = val;
    setPosition(val);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    video.muted = vol === 0;
    setVolume(vol);
    setSettings({ volume: vol });
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration || 0);
  };

  const changeQuality = (source: VideoSource) => {
    const video = videoRef.current;
    const currentPos = video?.currentTime || 0;
    setCurrentSource(source);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentPos;
        videoRef.current.play();
      }
    }, 400);
    setShowSettings(false);
  };

  const toggleSubtitle = (sub: VideoSubtitle | null) => {
    setCurrentSubtitle(sub);
    setShowSubs(false);
    setSettings({ subtitlesEnabled: !!sub });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted font-semibold text-sm">Preparing stream playback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-4 text-center animate-page-enter">
        <AlertCircle className="w-14 h-14 text-primary mb-4" />
        <p className="text-2xl font-extrabold mb-2 text-white">Playback Interrupted</p>
        <p className="text-muted text-sm mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("details", { id: contentId })}
            className="px-6 py-2.5 rounded-xl bg-surface-2 border border-border text-white font-bold hover:bg-border btn-interactive"
          >
            Back to Details
          </button>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              setTimeout(() => window.location.reload(), 150);
            }}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold btn-interactive shadow-lg shadow-primary/30 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Playback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center group/player overflow-hidden"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
        onClick={togglePlay}
        playsInline
      >
        {currentSubtitle && (
          <track
            kind="subtitles"
            src={currentSubtitle.url}
            srcLang={currentSubtitle.label}
            label={currentSubtitle.label}
            default
          />
        )}
      </video>

      {/* Buffering Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <Loader2 className="w-14 h-14 text-primary animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center gap-4">
          <button
            onClick={() => navigate("details", { id: contentId })}
            className="text-white hover:text-primary btn-interactive transition p-1"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div className="min-w-0">
            <h1 className="text-white font-extrabold text-base md:text-xl line-clamp-1">
              {content?.title}
            </h1>
            {episodeId && (
              <p className="text-xs text-muted font-semibold">Playing Episode Stream</p>
            )}
          </div>
        </div>

        {/* Center Play Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={togglePlay}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-white/30 btn-interactive shadow-2xl transition border border-white/20"
          >
            {playing ? (
              <Pause className="w-8 h-8 text-white fill-white" />
            ) : (
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Playback Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs md:text-sm text-white font-mono w-12 text-right">
              {formatTime(position)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={position}
              onChange={onSeek}
              className="flex-1"
              style={{
                background: `linear-gradient(to right, #e50914 ${
                  (position / (duration || 1)) * 100
                }%, rgba(255,255,255,0.2) ${(position / (duration || 1)) * 100}%)`,
              }}
            />
            <span className="text-xs md:text-sm text-white font-mono w-12">{formatTime(duration)}</span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-5">
              <button onClick={togglePlay} className="text-white hover:text-primary btn-interactive transition p-1">
                {playing ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
              </button>
              <button onClick={() => skip(-10)} className="text-white hover:text-primary btn-interactive transition p-1">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={() => skip(10)} className="text-white hover:text-primary btn-interactive transition p-1">
                <SkipForward className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-primary btn-interactive transition p-1">
                  {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={onVolumeChange}
                  className="w-0 group-hover/vol:w-20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              {/* Subtitles Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubs(!showSubs);
                    setShowSettings(false);
                  }}
                  className={`p-1 btn-interactive transition ${
                    currentSubtitle ? "text-primary font-bold" : "text-white hover:text-primary"
                  }`}
                >
                  <Subtitles className="w-5 h-5" />
                </button>
                {showSubs && (
                  <div className="absolute bottom-12 right-0 w-48 bg-surface/95 backdrop-blur-xl rounded-xl border border-border p-2 shadow-2xl animate-scale-in">
                    <button
                      onClick={() => toggleSubtitle(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-surface-2 ${
                        !currentSubtitle ? "text-primary bg-primary/10" : "text-white"
                      }`}
                    >
                      Subtitles Off
                    </button>
                    {subtitles.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => toggleSubtitle(sub)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-surface-2 ${
                          currentSubtitle?.url === sub.url ? "text-primary bg-primary/10" : "text-white"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality Settings */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowSubs(false);
                  }}
                  className="text-white hover:text-primary btn-interactive transition p-1"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-12 right-0 w-48 bg-surface/95 backdrop-blur-xl rounded-xl border border-border p-2 shadow-2xl animate-scale-in">
                    <p className="px-3 py-1 text-[10px] text-muted font-extrabold uppercase tracking-wider">
                      Select Quality
                    </p>
                    {qualities.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => changeQuality(q)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-surface-2 ${
                          currentSource?.url === q.url ? "text-primary bg-primary/10" : "text-white"
                        }`}
                      >
                        {q.label || `${q.quality}p`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button onClick={toggleFullscreen} className="text-white hover:text-primary btn-interactive transition p-1">
                {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
