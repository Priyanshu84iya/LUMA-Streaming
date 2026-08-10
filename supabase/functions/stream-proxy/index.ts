import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 5 Build/TQ3A.230901.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/144.0.7559.132 Safari/537.36";

const BASE = "https://net27.cc";

const HEADERS: Record<string, string> = {
  Accept: "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
  "User-Agent": UA,
  Referer: `${BASE}/`,
  Origin: BASE,
  "X-Requested-With": "XMLHttpRequest",
};

interface CinebyItem {
  tmdbId: number;
  type: string;
  title: string;
  year?: string;
  poster?: string;
  backdrop?: string;
  rating?: number;
  overview?: string;
  subjectId?: string;
  detailPath?: string;
  source?: string;
}

interface CinebyHome {
  rails: { title: string; items: CinebyItem[] }[];
}

interface CinebySearch {
  ok: boolean;
  items: CinebyItem[];
  totalPages?: number;
}

interface CinebyEmbed {
  ok: boolean;
  tmdbId: number;
  title: string;
  year?: string;
  type: string;
  poster?: string;
  mp4?: string;
  resolution?: string;
  streams?: { url: string; resolution: number; size: number }[];
  captions?: { lang: string; name: string; url: string }[];
  fallbackHls?: string;
  error?: string;
  noSource?: boolean;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 429) {
    const retry = res.headers.get("retry-after");
    const wait = retry ? parseInt(retry, 10) * 1000 : 3000;
    await new Promise((r) => setTimeout(r, Math.min(wait, 5000)));
    const retryRes = await fetch(url, { headers: HEADERS });
    if (!retryRes.ok) throw new Error(`API returned ${retryRes.status}`);
    return retryRes.json();
  }
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

function handleHome() {
  return fetchJson(`${BASE}/api/catalog/aoneroom-home`);
}

function handleSearch(query: string) {
  return fetchJson(
    `${BASE}/api/catalog/search-hybrid?q=${encodeURIComponent(query)}`
  );
}

function handleTrending(window: string) {
  return fetchJson(`${BASE}/api/catalog/trending?window=${window}`);
}

function handleCurated(tab: string) {
  return fetchJson(`${BASE}/api/catalog/curated/${tab}`);
}

function handleEmbed(tmdbId: string, type: string, season: string, episode: string) {
  const se = season || "1";
  const ep = episode || "1";
  return fetchJson(
    `${BASE}/api/embed-tmdb/${tmdbId}?type=${type}&se=${se}&ep=${ep}`
  );
}

function handleOmdb(params: URLSearchParams) {
  const omdbApiKey = Deno.env.get("OMDB_API_KEY") || "38fabbda";
  const omdbUrl = new URL("https://www.omdbapi.com/");
  omdbUrl.searchParams.set("apikey", omdbApiKey);
  for (const [k, v] of params.entries()) {
    if (k !== "action") omdbUrl.searchParams.set(k, v);
  }
  return fetch(omdbUrl.toString()).then((res) => res.json());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "home";

    let result: unknown;

    switch (action) {
      case "home": {
        result = await handleHome();
        break;
      }
      case "search": {
        const query = url.searchParams.get("q") || "";
        result = await handleSearch(query);
        break;
      }
      case "trending": {
        const window = url.searchParams.get("window") || "week";
        result = await handleTrending(window);
        break;
      }
      case "curated": {
        const tab = url.searchParams.get("tab") || "trending";
        result = await handleCurated(tab);
        break;
      }
      case "embed": {
        const tmdbId = url.searchParams.get("id") || "";
        const type = url.searchParams.get("type") || "movie";
        const season = url.searchParams.get("se") || "1";
        const episode = url.searchParams.get("ep") || "1";
        result = await handleEmbed(tmdbId, type, season, episode);
        break;
      }
      case "omdb": {
        result = await handleOmdb(url.searchParams);
        break;
      }
      case "ping": {
        result = { ok: true };
        break;
      }
      default: {
        result = { error: "Unknown action" };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
