// Internal content model for the streaming platform

export type MediaType = "movie" | "tv" | "anime";

export interface ContentItem {
  id: string;
  title: string;
  originalTitle?: string;
  poster?: string | null;
  backdrop?: string | null;
  mediaType: MediaType;
  genres: string[];
  year?: string;
  released?: string;
  runtime?: string;
  description?: string;
  cast?: string[];
  director?: string;
  writer?: string;
  production?: string;
  languages?: string[];
  country?: string;
  maturityRating?: string;
  rating?: number | null;
  imdbId?: string | null;
  imdbRating?: number | null;
  tmdbId?: string | null;
  source?: string;
  sourceId?: string | null;
  isMovie: boolean;
  seasons?: Season[];
  episodes?: Episode[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  label: string;
}

export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  runtime?: string;
  poster?: string;
}

export interface VideoSource {
  url: string;
  label: string;
  quality: number;
  type: string;
}

export interface VideoSubtitle {
  url: string;
  label: string;
}

export interface VideoLinks {
  sources: VideoSource[];
  subtitles: VideoSubtitle[];
}

export interface ContentRow {
  name: string;
  items: ContentItem[];
}

export interface ExtensionManifest {
  name: string;
  description: string;
  manifestVersion: number;
  pluginLists: string[];
  iconUrl?: string;
}

export interface ExtensionPlugin {
  iconUrl: string;
  name: string;
  internalName: string;
  description: string;
  version: number;
  language: string;
  authors: string[];
  tvTypes: string[];
  url: string;
  repositoryUrl: string;
  status: number;
  apiVersion: number;
  fileHash: string;
  fileSize: number;
  jarUrl?: string;
  jarFileSize?: number;
  jarHash?: string;
}

export interface ExtensionRepo {
  id: string;
  sourceUrl: string;
  manifest: ExtensionManifest;
  plugins: ExtensionPlugin[];
  enabled: boolean;
}

export interface UserSettings {
  autoplay: boolean;
  defaultQuality: number; // 0 = auto, else 360/480/720/1080
  subtitlesEnabled: boolean;
  subtitleLanguage: string;
  volume: number;
  theme: "dark" | "midnight";
  reduceMotion: boolean;
  preferredCategories: string[];
}

export interface WatchHistoryEntry {
  id: string;
  content_id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
  media_type: string;
  season: number | null;
  episode: number | null;
  episode_id: string | null;
  duration: number;
  position: number;
  completed: boolean;
  updated_at: string;
}

export interface ContinueWatchingEntry {
  id: string;
  content_id: string;
  episode_id: string | null;
  title: string;
  poster: string | null;
  backdrop: string | null;
  media_type: string;
  season: number | null;
  episode: number | null;
  position: number;
  duration: number;
  updated_at: string;
}

export interface FavoriteEntry {
  id: string;
  content_id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
  media_type: string;
  added_at: string;
}

export interface WatchLaterEntry {
  id: string;
  content_id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
  media_type: string;
  added_at: string;
}

export interface ExtensionState {
  id: number;
  name: string | null;
  connected: boolean;
  last_sync: string | null;
  library_count: number;
  status: string;
  updated_at: string;
  raw_manifest: Record<string, unknown> | null;
}
