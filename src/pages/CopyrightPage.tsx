import { ShieldCheck, AlertTriangle, ExternalLink, BookOpen, Code2, Database } from "lucide-react";

const apiSources = [
  {
    name: "OMDb API",
    url: "https://www.omdbapi.com/",
    description: "Movie and TV metadata including titles, ratings, posters, and descriptions.",
  },
  {
    name: "Cloudstream Extensions",
    url: "https://github.com/recloudstream/cloudstream",
    description: "Open-source streaming extensions for content discovery.",
  },
  {
    name: "NetMirror",
    url: "https://netmirror.app/",
    description: "Aggregated streaming link catalog and metadata.",
  },
  {
    name: "Cineby",
    url: "https://www.cineby.app/",
    description: "Supplementary streaming catalog and embed sources.",
  },
];

const openSourceLibs = [
  { name: "React", url: "https://react.dev/", license: "MIT" },
  { name: "TypeScript", url: "https://www.typescriptlang.org/", license: "Apache-2.0" },
  { name: "Vite", url: "https://vitejs.dev/", license: "MIT" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com/", license: "MIT" },
  { name: "Lucide React", url: "https://lucide.dev/", license: "ISC" },
  { name: "Supabase", url: "https://supabase.com/", license: "Apache-2.0" },
];

export function CopyrightPage() {
  const year = new Date().getFullYear();

  return (
    <div className="px-4 md:px-12 py-8 pb-24 min-h-screen animate-page-enter">
      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Copyright & Legal
          </h1>
        </div>
        <p className="text-muted text-sm md:text-base max-w-xl pl-0 md:pl-1">
          Important information about content ownership, data sources, and open-source licensing.
        </p>
      </div>

      {/* Copyright notice */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface p-6 md:p-8 mb-6 shadow-xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2">
            <span className="text-primary text-2xl font-black">©</span> Copyright Notice
          </h2>
          <p className="text-4xl md:text-5xl font-black text-white mt-4 mb-2 tracking-tight">
            {year}
          </p>
          <p className="text-xl md:text-2xl font-bold text-primary mb-4">Priyanshu Chaurasiya</p>
          <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl">
            The <strong className="text-white">LUMA</strong> application — including its source code, UI design,
            component architecture, and user experience — is the intellectual property of{" "}
            <strong className="text-white">Priyanshu Chaurasiya</strong>. All rights reserved.
          </p>
          <p className="text-muted/70 text-xs mt-4 font-medium">
            © 2024–{year} Priyanshu Chaurasiya. All rights reserved.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-accent/20 bg-surface p-6 md:p-8 mb-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white mb-3">Content Disclaimer</h2>
            <div className="space-y-3 text-sm text-muted leading-relaxed">
              <p>
                LUMA is a <strong className="text-white">personal, non-commercial project</strong> created for
                educational and demonstration purposes. It does not host, store, or distribute any media content.
              </p>
              <p>
                All movies, TV shows, anime, posters, ratings, and related metadata displayed within LUMA are
                sourced from <strong className="text-white">third-party public APIs and catalogs</strong>.
                Ownership of all such content belongs to their respective rights holders.
              </p>
              <p>
                LUMA is <strong className="text-white">not affiliated with, endorsed by, or sponsored by</strong> any
                streaming service, media company, or content provider referenced within the app.
              </p>
              <p>
                If you are a rights holder and believe your content is being displayed inappropriately, please contact
                the developer via the links on the{" "}
                <strong className="text-white">About</strong> page.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data sources */}
      <div className="rounded-2xl border border-border/60 bg-surface p-6 md:p-8 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-extrabold text-white">Data Sources</h2>
        </div>
        <div className="space-y-4">
          {apiSources.map((source) => (
            <div key={source.name} className="flex items-start gap-4 p-4 rounded-xl bg-surface-2/50 border border-border/40">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-white">{source.name}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label={`Visit ${source.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-muted leading-relaxed">{source.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open source */}
      <div className="rounded-2xl border border-border/60 bg-surface p-6 md:p-8 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Code2 className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-extrabold text-white">Open Source Libraries</h2>
        </div>
        <p className="text-sm text-muted mb-5 leading-relaxed">
          LUMA is built on the shoulders of great open-source projects. We gratefully acknowledge their authors
          and communities:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {openSourceLibs.map((lib) => (
            <a
              key={lib.name}
              href={lib.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3.5 rounded-xl bg-surface-2/50 border border-border/40 hover:border-border hover:bg-surface-2 transition-all duration-200"
            >
              <div>
                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{lib.name}</p>
                <p className="text-xs text-muted font-medium mt-0.5">{lib.license} License</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted/40 group-hover:text-muted transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-2xl border border-border/40 bg-surface/50 p-6 mb-6">
        <div className="flex items-start gap-4">
          <BookOpen className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-base font-extrabold text-white mb-2">Privacy & Local Storage</h2>
            <p className="text-sm text-muted leading-relaxed">
              LUMA stores your watch history, favorites, watch later list, and playback progress
              <strong className="text-white"> locally in your browser</strong> using localStorage. No personal data
              is transmitted to any external server by LUMA itself. Third-party APIs may have their own data
              practices — please refer to their respective privacy policies.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <p className="text-xs text-muted/50 text-center font-medium">
        Last updated: August 2026 — LUMA by Priyanshu Chaurasiya
      </p>
    </div>
  );
}
