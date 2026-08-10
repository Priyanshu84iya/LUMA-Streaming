import { supabase } from "@/lib/supabase";
import type {
  ContinueWatchingEntry,
  ExtensionState,
  FavoriteEntry,
  UserSettings,
  WatchHistoryEntry,
  WatchLaterEntry,
} from "@/types";

const SETTINGS_ID = 1;
const EXTENSION_ID = 1;

const STORAGE_KEYS = {
  SETTINGS: "stream_user_settings",
  CONTINUE: "stream_continue_watching",
  HISTORY: "stream_watch_history",
  FAVORITES: "stream_favorites",
  WATCH_LATER: "stream_watch_later",
};

export const defaultSettings: UserSettings = {
  autoplay: true,
  defaultQuality: 0,
  subtitlesEnabled: false,
  subtitleLanguage: "en",
  volume: 1,
  theme: "dark",
  reduceMotion: false,
  preferredCategories: [],
};

// Safe local storage helpers
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore local storage errors
  }
}

/* ---------- Settings ---------- */

export async function loadSettings(): Promise<UserSettings> {
  const local = getLocal<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  try {
    const { data } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("id", SETTINGS_ID)
      .maybeSingle();
    if (data?.settings) {
      const merged = { ...defaultSettings, ...local, ...(data.settings as Record<string, unknown>) } as UserSettings;
      setLocal(STORAGE_KEYS.SETTINGS, merged);
      return merged;
    }
  } catch {
    // fallback to local
  }
  return local;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  setLocal(STORAGE_KEYS.SETTINGS, settings);
  try {
    await supabase
      .from("user_settings")
      .upsert(
        { id: SETTINGS_ID, settings: settings as unknown as Record<string, unknown>, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
  } catch {
    // silent fallback
  }
}

/* ---------- Continue Watching ---------- */

export async function getContinueWatching(): Promise<ContinueWatchingEntry[]> {
  const local = getLocal<ContinueWatchingEntry[]>(STORAGE_KEYS.CONTINUE, []);
  try {
    const { data, error } = await supabase
      .from("continue_watching")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20);
    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.CONTINUE, data as ContinueWatchingEntry[]);
      return data as ContinueWatchingEntry[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function upsertContinueWatching(entry: {
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
}): Promise<void> {
  const local = getLocal<ContinueWatchingEntry[]>(STORAGE_KEYS.CONTINUE, []);
  const newItem: ContinueWatchingEntry = {
    id: `cw-${entry.content_id}-${entry.episode_id || "m"}`,
    ...entry,
    updated_at: new Date().toISOString(),
  };
  const filtered = local.filter(
    (item) => !(item.content_id === entry.content_id && item.episode_id === entry.episode_id)
  );
  const next = [newItem, ...filtered].slice(0, 20);
  setLocal(STORAGE_KEYS.CONTINUE, next);

  try {
    await supabase.from("continue_watching").upsert(
      { ...entry, updated_at: new Date().toISOString() },
      { onConflict: "content_id,episode_id" }
    );
  } catch {
    // silent fallback
  }
}

export async function removeContinueWatching(contentId: string, episodeId: string | null): Promise<void> {
  const local = getLocal<ContinueWatchingEntry[]>(STORAGE_KEYS.CONTINUE, []);
  const next = local.filter(
    (item) => !(item.content_id === contentId && (!episodeId || item.episode_id === episodeId))
  );
  setLocal(STORAGE_KEYS.CONTINUE, next);

  try {
    let q = supabase.from("continue_watching").delete().eq("content_id", contentId);
    if (episodeId) q = q.eq("episode_id", episodeId);
    await q;
  } catch {
    // silent fallback
  }
}

/* ---------- Watch History ---------- */

export async function getWatchHistory(): Promise<WatchHistoryEntry[]> {
  const local = getLocal<WatchHistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
  try {
    const { data, error } = await supabase
      .from("watch_history")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.HISTORY, data as WatchHistoryEntry[]);
      return data as WatchHistoryEntry[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function upsertWatchHistory(entry: {
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
}): Promise<void> {
  const local = getLocal<WatchHistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
  const newItem: WatchHistoryEntry = {
    id: `wh-${entry.content_id}-${entry.episode_id || "m"}`,
    ...entry,
    updated_at: new Date().toISOString(),
  };
  const filtered = local.filter(
    (item) => !(item.content_id === entry.content_id && item.episode_id === entry.episode_id)
  );
  const next = [newItem, ...filtered].slice(0, 50);
  setLocal(STORAGE_KEYS.HISTORY, next);

  try {
    await supabase.from("watch_history").upsert(
      { ...entry, updated_at: new Date().toISOString() },
      { onConflict: "content_id,episode_id" }
    );
  } catch {
    // silent fallback
  }
}

export async function clearWatchHistory(): Promise<void> {
  setLocal(STORAGE_KEYS.HISTORY, []);
  try {
    await supabase.from("watch_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch {
    // silent fallback
  }
}

/* ---------- Favorites ---------- */

export async function getFavorites(): Promise<FavoriteEntry[]> {
  const local = getLocal<FavoriteEntry[]>(STORAGE_KEYS.FAVORITES, []);
  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .order("added_at", { ascending: false });
    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.FAVORITES, data as FavoriteEntry[]);
      return data as FavoriteEntry[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function addFavorite(item: {
  content_id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
  media_type: string;
}): Promise<void> {
  const local = getLocal<FavoriteEntry[]>(STORAGE_KEYS.FAVORITES, []);
  if (!local.some((f) => f.content_id === item.content_id)) {
    const newItem: FavoriteEntry = {
      id: `fav-${item.content_id}`,
      ...item,
      added_at: new Date().toISOString(),
    };
    setLocal(STORAGE_KEYS.FAVORITES, [newItem, ...local]);
  }

  try {
    await supabase
      .from("favorites")
      .upsert({ ...item, added_at: new Date().toISOString() }, { onConflict: "content_id" });
  } catch {
    // silent fallback
  }
}

export async function removeFavorite(contentId: string): Promise<void> {
  const local = getLocal<FavoriteEntry[]>(STORAGE_KEYS.FAVORITES, []);
  setLocal(
    STORAGE_KEYS.FAVORITES,
    local.filter((f) => f.content_id !== contentId)
  );

  try {
    await supabase.from("favorites").delete().eq("content_id", contentId);
  } catch {
    // silent fallback
  }
}

export async function isFavorite(contentId: string): Promise<boolean> {
  const local = getLocal<FavoriteEntry[]>(STORAGE_KEYS.FAVORITES, []);
  return local.some((f) => f.content_id === contentId);
}

/* ---------- Watch Later ---------- */

export async function getWatchLater(): Promise<WatchLaterEntry[]> {
  const local = getLocal<WatchLaterEntry[]>(STORAGE_KEYS.WATCH_LATER, []);
  try {
    const { data, error } = await supabase
      .from("watch_later")
      .select("*")
      .order("added_at", { ascending: false });
    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.WATCH_LATER, data as WatchLaterEntry[]);
      return data as WatchLaterEntry[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function addWatchLater(item: {
  content_id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
  media_type: string;
}): Promise<void> {
  const local = getLocal<WatchLaterEntry[]>(STORAGE_KEYS.WATCH_LATER, []);
  if (!local.some((w) => w.content_id === item.content_id)) {
    const newItem: WatchLaterEntry = {
      id: `wl-${item.content_id}`,
      ...item,
      added_at: new Date().toISOString(),
    };
    setLocal(STORAGE_KEYS.WATCH_LATER, [newItem, ...local]);
  }

  try {
    await supabase
      .from("watch_later")
      .upsert({ ...item, added_at: new Date().toISOString() }, { onConflict: "content_id" });
  } catch {
    // silent fallback
  }
}

export async function removeWatchLater(contentId: string): Promise<void> {
  const local = getLocal<WatchLaterEntry[]>(STORAGE_KEYS.WATCH_LATER, []);
  setLocal(
    STORAGE_KEYS.WATCH_LATER,
    local.filter((w) => w.content_id !== contentId)
  );

  try {
    await supabase.from("watch_later").delete().eq("content_id", contentId);
  } catch {
    // silent fallback
  }
}

export async function isWatchLater(contentId: string): Promise<boolean> {
  const local = getLocal<WatchLaterEntry[]>(STORAGE_KEYS.WATCH_LATER, []);
  return local.some((w) => w.content_id === contentId);
}

/* ---------- Extension State ---------- */

export async function getExtensionState(): Promise<ExtensionState | null> {
  try {
    const { data } = await supabase
      .from("extension_state")
      .select("*")
      .eq("id", EXTENSION_ID)
      .maybeSingle();
    return data as ExtensionState | null;
  } catch {
    return null;
  }
}

export async function saveExtensionState(state: {
  name: string | null;
  connected: boolean;
  last_sync: string | null;
  library_count: number;
  status: string;
  raw_manifest?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await supabase.from("extension_state").upsert(
      {
        id: EXTENSION_ID,
        ...state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch {
    // silent
  }
}
