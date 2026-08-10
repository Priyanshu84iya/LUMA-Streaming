import { useState } from "react";
import {
  Home,
  Search,
  Heart,
  Clock,
  Bookmark,
  User,
  Settings,
  Puzzle,
  Menu,
  X,
  Clapperboard,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useRouter, type Route } from "@/store/Router";

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { path: "home", label: "Home", icon: Home },
  { path: "search", label: "Search", icon: Search },
  { path: "favorites", label: "Favorites", icon: Heart },
  { path: "history", label: "Watch History", icon: Clock },
  { path: "watchlater", label: "Watch Later", icon: Bookmark },
  { path: "profile", label: "Profile", icon: User },
  { path: "settings", label: "Settings", icon: Settings },
  { path: "extensions", label: "Extensions", icon: Puzzle },
  { path: "about", label: "About", icon: Info },
  { path: "copyright", label: "Copyright", icon: ShieldCheck },
];

const isActive = (route: Route, path: string) => {
  if (path === "home") return route.path === "home" || route.path === "browse" || route.path === "details" || route.path === "watch";
  return route.path === path;
};

export function Sidebar() {
  const { route, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-lg border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-white btn-interactive">
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={() => navigate("home")} className="flex items-center gap-2 btn-interactive">
            <Clapperboard className="w-6 h-6 text-primary" />
            <span className="font-extrabold text-lg tracking-tight text-white">LUMA</span>
          </button>
          <button onClick={() => navigate("search")} className="p-2 -mr-2 text-white btn-interactive">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-border animate-slide-in-left p-4 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                <button onClick={() => { navigate("home"); setMobileOpen(false); }} className="flex items-center gap-2">
                  <Clapperboard className="w-7 h-7 text-primary" />
                  <span className="font-extrabold text-lg tracking-tight text-white">LUMA</span>
                </button>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-white btn-interactive">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(route, item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold btn-interactive transition ${
                        active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted hover:text-white hover:bg-surface-2"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-2 border-t border-border/40 text-center">
              <p className="text-xs text-muted font-medium">LUMA Normalized Catalog v2.0</p>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-surface border-r border-border/60 z-40 shadow-xl">
        <button onClick={() => navigate("home")} className="flex items-center gap-3 px-6 h-16 border-b border-border/40 btn-interactive">
          <Clapperboard className="w-8 h-8 text-primary" />
          <span className="font-extrabold text-xl tracking-tight text-white">LUMA</span>
        </button>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(route, item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold btn-interactive transition ${
                  active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted hover:text-white hover:bg-surface-2"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/40">
          <p className="text-xs text-muted font-medium">NetMirror • Cloudstream • Cineby • OMDb</p>
          <p className="text-xs text-muted/60 font-medium mt-1">© 2026 Priyanshu Chaurasiya</p>
        </div>
      </aside>
    </>
  );
}

export function MobileBottomBar() {
  const { route, navigate } = useRouter();
  const mobileItems: NavItem[] = [
    { path: "home", label: "Home", icon: Home },
    { path: "search", label: "Search", icon: Search },
    { path: "favorites", label: "Favorites", icon: Heart },
    { path: "watchlater", label: "Later", icon: Bookmark },
    { path: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-lg border-t border-border/60">
      <div className="flex items-center justify-around h-14">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(route, item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 btn-interactive ${active ? "text-primary font-bold" : "text-muted"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
