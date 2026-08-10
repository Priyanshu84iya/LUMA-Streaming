import { useEffect, useState } from "react";
import { User, Heart, Clock, Bookmark, Settings, Puzzle, Edit2, Check, Play } from "lucide-react";
import { useStore } from "@/store/AppStore";
import { useRouter } from "@/store/Router";

export function ProfilePage() {
  const { navigate } = useRouter();
  const { favorites, watchHistory, watchLater, continueWatching } = useStore();
  const [profileName, setProfileName] = useState("Viewer");
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("profile_name");
    if (saved) setProfileName(saved);
  }, []);

  const saveName = () => {
    const name = tempName.trim() || "Viewer";
    setProfileName(name);
    localStorage.setItem("profile_name", name);
    setEditing(false);
  };

  const stats = [
    { label: "Favorites", value: favorites.length, icon: Heart, color: "text-primary" },
    { label: "Watch History", value: watchHistory.length, icon: Clock, color: "text-accent" },
    { label: "Watch Later", value: watchLater.length, icon: Bookmark, color: "text-blue-400" },
    { label: "Continue Watching", value: continueWatching.length, icon: Play, color: "text-green-400" },
  ];

  const menuItems = [
    { label: "Settings", icon: Settings, path: "settings" },
    { label: "Extension Manager", icon: Puzzle, path: "extensions" },
    { label: "Favorites", icon: Heart, path: "favorites" },
    { label: "Watch History", icon: Clock, path: "history" },
    { label: "Watch Later", icon: Bookmark, path: "watchlater" },
  ];

  return (
    <div className="px-4 md:px-12 py-6 pb-20 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-8">Profile</h1>

      {/* Profile header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
          <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              autoFocus
              maxLength={24}
              className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-white text-center outline-none focus:border-primary"
            />
            <button onClick={saveName} className="p-2 rounded-lg bg-primary text-white">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold">{profileName}</h2>
            <button onClick={() => { setTempName(profileName); setEditing(true); }} className="text-muted hover:text-white">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className="text-sm text-muted mt-1">Local profile</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-surface-2 border border-border rounded-xl p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Menu */}
      <div className="space-y-2 max-w-2xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-surface-2/50 hover:bg-surface-2 transition text-left"
            >
              <Icon className="w-5 h-5 text-muted" />
              <span className="font-medium flex-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

