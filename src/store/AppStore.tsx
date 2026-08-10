import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ContinueWatchingEntry,
  FavoriteEntry,
  UserSettings,
  WatchHistoryEntry,
  WatchLaterEntry,
} from "@/types";
import {
  defaultSettings,
  getContinueWatching,
  getFavorites,
  getWatchHistory,
  getWatchLater,
  loadSettings,
  saveSettings,
  upsertContinueWatching,
  upsertWatchHistory,
  addFavorite,
  removeFavorite,
  addWatchLater,
  removeWatchLater,
} from "@/lib/userData";

interface AppStore {
  settings: UserSettings;
  setSettings: (s: Partial<UserSettings>) => void;
  continueWatching: ContinueWatchingEntry[];
  watchHistory: WatchHistoryEntry[];
  favorites: FavoriteEntry[];
  watchLater: WatchLaterEntry[];
  favoriteIds: Set<string>;
  watchLaterIds: Set<string>;
  toggleFavorite: (item: {
    content_id: string;
    title: string;
    poster: string | null;
    backdrop: string | null;
    media_type: string;
  }) => void;
  toggleWatchLater: (item: {
    content_id: string;
    title: string;
    poster: string | null;
    backdrop: string | null;
    media_type: string;
  }) => void;
  recordProgress: (entry: {
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
    completed?: boolean;
  }) => void;
  refreshLists: () => Promise<void>;
  loaded: boolean;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<UserSettings>(defaultSettings);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingEntry[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [watchLater, setWatchLater] = useState<WatchLaterEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshLists = useCallback(async () => {
    const [cw, wh, fav, wl] = await Promise.all([
      getContinueWatching(),
      getWatchHistory(),
      getFavorites(),
      getWatchLater(),
    ]);
    setContinueWatching(cw);
    setWatchHistory(wh);
    setFavorites(fav);
    setWatchLater(wl);
  }, []);

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setSettingsState(s);
      await refreshLists();
      setLoaded(true);
    })();
  }, [refreshLists]);

  const setSettings = useCallback((s: Partial<UserSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...s };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    (item: {
      content_id: string;
      title: string;
      poster: string | null;
      backdrop: string | null;
      media_type: string;
    }) => {
      setFavorites((prev) => {
        if (prev.some((f) => f.content_id === item.content_id)) {
          removeFavorite(item.content_id);
          return prev.filter((f) => f.content_id !== item.content_id);
        }
        addFavorite(item);
        return [{ ...item, id: "temp", added_at: new Date().toISOString() }, ...prev];
      });
    },
    []
  );

  const toggleWatchLater = useCallback(
    (item: {
      content_id: string;
      title: string;
      poster: string | null;
      backdrop: string | null;
      media_type: string;
    }) => {
      setWatchLater((prev) => {
        if (prev.some((w) => w.content_id === item.content_id)) {
          removeWatchLater(item.content_id);
          return prev.filter((w) => w.content_id !== item.content_id);
        }
        addWatchLater(item);
        return [{ ...item, id: "temp", added_at: new Date().toISOString() }, ...prev];
      });
    },
    []
  );

  const recordProgress = useCallback(
    (entry: {
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
      completed?: boolean;
    }) => {
      upsertContinueWatching(entry);
      upsertWatchHistory({ ...entry, completed: entry.completed || false });
      setContinueWatching((prev) => {
        const filtered = prev.filter(
          (p) => !(p.content_id === entry.content_id && p.episode_id === entry.episode_id)
        );
        return [{ ...entry, id: "temp", updated_at: new Date().toISOString() }, ...filtered].slice(0, 20);
      });
    },
    []
  );

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.content_id)),
    [favorites]
  );
  const watchLaterIds = useMemo(
    () => new Set(watchLater.map((w) => w.content_id)),
    [watchLater]
  );

  const value: AppStore = {
    settings,
    setSettings,
    continueWatching,
    watchHistory,
    favorites,
    watchLater,
    favoriteIds,
    watchLaterIds,
    toggleFavorite,
    toggleWatchLater,
    recordProgress,
    refreshLists,
    loaded,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
