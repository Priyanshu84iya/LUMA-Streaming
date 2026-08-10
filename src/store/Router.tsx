import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Route {
  path: string; // e.g. "home", "search", "watch", "details", "favorites", etc.
  params: Record<string, string>;
  query: Record<string, string>;
}

interface RouterContext {
  route: Route;
  navigate: (path: string, params?: Record<string, string>, query?: Record<string, string>) => void;
}

const RouterCtx = createContext<RouterContext | null>(null);

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || "/";
  const [pathPart, queryPart] = hash.split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const path = segments[0] || "home";
  const params: Record<string, string> = {};
  // segments[1..] are key/value pairs
  for (let i = 1; i < segments.length; i += 2) {
    params[segments[i]] = decodeURIComponent(segments[i + 1] || "");
  }
  const query: Record<string, string> = {};
  if (queryPart) {
    for (const pair of queryPart.split("&")) {
      const [k, v] = pair.split("=");
      if (k) query[k] = decodeURIComponent(v || "");
    }
  }
  return { path, params, query };
}

function buildHash(path: string, params?: Record<string, string>, query?: Record<string, string>): string {
  let h = `/${path}`;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      h += `/${k}/${encodeURIComponent(v)}`;
    }
  }
  if (query && Object.keys(query).length) {
    h += "?" + Object.entries(query).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  }
  return h;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "/home";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback(
    (path: string, params?: Record<string, string>, query?: Record<string, string>) => {
      window.location.hash = buildHash(path, params, query);
    },
    []
  );

  return <RouterCtx.Provider value={{ route, navigate }}>{children}</RouterCtx.Provider>;
}

export function useRouter(): RouterContext {
  const ctx = useContext(RouterCtx);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}
