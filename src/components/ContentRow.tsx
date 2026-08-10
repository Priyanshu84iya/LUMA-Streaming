import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentItem } from "@/types";
import { ContentCard } from "@/components/ContentCard";

interface ContentRowProps {
  name: string;
  items: ContentItem[];
}

export function ContentRow({ name, items }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons);
    return () => el.removeEventListener("scroll", updateScrollButtons);
  }, [items]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === "left" ? -el.clientWidth * 0.75 : el.clientWidth * 0.75;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="group/row relative py-4">
      <div className="flex items-center justify-between mb-3 px-4 md:px-12">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          {name}
        </h2>
      </div>
      <div className="relative">
        {canLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-10 md:w-14 flex items-center justify-center bg-gradient-to-r from-bg via-bg/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-all duration-300 btn-interactive"
            aria-label="Scroll left"
          >
            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:scale-110 transition-transform">
              <ChevronLeft className="w-6 h-6 text-white ml-0.5" />
            </div>
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar px-4 md:px-12 scroll-smooth py-2"
        >
          {items.map((item, i) => (
            <div key={item.id} className="w-36 sm:w-40 md:w-48 flex-shrink-0">
              <ContentCard item={item} index={i} />
            </div>
          ))}
        </div>
        {canRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-10 md:w-14 flex items-center justify-center bg-gradient-to-l from-bg via-bg/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-all duration-300 btn-interactive"
            aria-label="Scroll right"
          >
            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:scale-110 transition-transform">
              <ChevronRight className="w-6 h-6 text-white mr-0.5" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
