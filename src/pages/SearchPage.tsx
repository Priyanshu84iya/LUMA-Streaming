import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { ContentItem } from "@/types";
import { searchContent } from "@/lib/contentService";
import { ContentCardGrid } from "@/components/ContentCard";
import { GridSkeleton } from "@/components/Skeletons";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchContent(query);
        setResults(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen animate-page-enter">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-white">Search Library</h1>

      <div className="relative max-w-2xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows, anime, genres, actors..."
          autoFocus
          className="w-full pl-12 pr-12 py-4 rounded-xl bg-surface-2 border border-border text-white placeholder:text-muted focus:border-primary transition outline-none shadow-lg"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white btn-interactive">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {loading && <GridSkeleton />}

      {error && (
        <div className="text-center py-12">
          <p className="text-muted text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-base">No titles matched "{query}"</p>
        </div>
      )}

      {!loading && !error && !query && (
        <div className="text-center py-24">
          <Search className="w-12 h-12 text-muted mx-auto mb-4 opacity-40 animate-pulse" />
          <p className="text-muted text-sm font-semibold">Start typing to search titles across NetMirror, Cloudstream, Cineby, and OMDb</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <p className="text-sm font-bold text-muted mb-4">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          <ContentCardGrid items={results} />
        </>
      )}
    </div>
  );
}
