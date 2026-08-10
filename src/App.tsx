import { MobileBottomBar, Sidebar } from "@/components/Navigation";
import { HomePage } from "@/pages/HomePage";
import { SearchPage } from "@/pages/SearchPage";
import { BrowsePage } from "@/pages/BrowsePage";
import { DetailsPage } from "@/pages/DetailsPage";
import { WatchPage } from "@/pages/WatchPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { WatchLaterPage } from "@/pages/WatchLaterPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ExtensionsPage } from "@/pages/ExtensionsPage";
import { AboutPage } from "@/pages/AboutPage";
import { CopyrightPage } from "@/pages/CopyrightPage";
import { StoreProvider, useStore } from "@/store/AppStore";
import { RouterProvider, useRouter } from "@/store/Router";

function PageRouter() {
  const { route } = useRouter();
  const { loaded } = useStore();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  switch (route.path) {
    case "home":
      return <HomePage />;
    case "search":
      return <SearchPage />;
    case "browse":
      return <BrowsePage />;
    case "details":
      return <DetailsPage />;
    case "watch":
      return <WatchPage />;
    case "favorites":
      return <FavoritesPage />;
    case "history":
      return <HistoryPage />;
    case "watchlater":
      return <WatchLaterPage />;
    case "profile":
      return <ProfilePage />;
    case "settings":
      return <SettingsPage />;
    case "extensions":
      return <ExtensionsPage />;
    case "about":
      return <AboutPage />;
    case "copyright":
      return <CopyrightPage />;
    default:
      return <HomePage />;
  }
}

function Layout() {
  const { route } = useRouter();
  const isWatchPage = route.path === "watch";

  return (
    <div className="min-h-screen bg-bg text-text">
      {!isWatchPage && <Sidebar />}
      <div className={`md:ml-64 ${!isWatchPage ? "pt-14 md:pt-0" : ""}`}>
        <PageRouter />
      </div>
      {!isWatchPage && <MobileBottomBar />}
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <StoreProvider>
        <Layout />
      </StoreProvider>
    </RouterProvider>
  );
}

export default App;
