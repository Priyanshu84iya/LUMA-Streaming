import { lazy, Suspense } from "react";
import { MobileBottomBar, Sidebar } from "@/components/Navigation";
import { HomePage } from "@/pages/HomePage";
import { StoreProvider, useStore } from "@/store/AppStore";
import { RouterProvider, useRouter } from "@/store/Router";
import { PWAProvider } from "@/hooks/usePWA";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { PWAUpdateBanner } from "@/components/PWAUpdateBanner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Analytics } from "@vercel/analytics/react";
import { AshnaWidget } from "@/components/AshnaWidget";

// Lazy-load pages for code-splitting
const SearchPage = lazy(() => import("@/pages/SearchPage").then(m => ({ default: m.SearchPage })));
const BrowsePage = lazy(() => import("@/pages/BrowsePage").then(m => ({ default: m.BrowsePage })));
const DetailsPage = lazy(() => import("@/pages/DetailsPage").then(m => ({ default: m.DetailsPage })));
const WatchPage = lazy(() => import("@/pages/WatchPage").then(m => ({ default: m.WatchPage })));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage").then(m => ({ default: m.FavoritesPage })));
const HistoryPage = lazy(() => import("@/pages/HistoryPage").then(m => ({ default: m.HistoryPage })));
const WatchLaterPage = lazy(() => import("@/pages/WatchLaterPage").then(m => ({ default: m.WatchLaterPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ExtensionsPage = lazy(() => import("@/pages/ExtensionsPage").then(m => ({ default: m.ExtensionsPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const CopyrightPage = lazy(() => import("@/pages/CopyrightPage").then(m => ({ default: m.CopyrightPage })));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

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

  return (
    <Suspense fallback={<PageSpinner />}>
      {(() => {
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
      })()}
    </Suspense>
  );
}

function Layout() {
  const { route } = useRouter();
  const isWatchPage = route.path === "watch";

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* PWA system banners */}
      <PWAUpdateBanner />
      <OfflineBanner />

      {!isWatchPage && <Sidebar />}
      <div className={`md:ml-64 ${!isWatchPage ? "pt-14 md:pt-0" : ""}`}>
        <PageRouter />
      </div>
      {!isWatchPage && <MobileBottomBar />}

      {/* PWA install prompt (floats above bottom nav) */}
      <PWAInstallBanner />
      <AshnaWidget />
    </div>
  );
}

function App() {
  return (
    <PWAProvider>
      <RouterProvider>
        <StoreProvider>
          <Layout />
          <Analytics />
        </StoreProvider>
      </RouterProvider>
    </PWAProvider>
  );
}

export default App;
