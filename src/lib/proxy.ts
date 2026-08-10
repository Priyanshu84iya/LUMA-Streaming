import { EDGE_FUNCTION_URL } from "./supabase";

const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export async function callProxy<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(EDGE_FUNCTION_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (anonKey) {
    headers["Authorization"] = `Bearer ${anonKey}`;
    headers["apikey"] = anonKey;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy request failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (data && typeof data === "object" && "error" in data) {
    throw new Error((data as any).error);
  }
  return data as T;
}
