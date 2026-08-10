import { Github, Linkedin, Instagram, Globe, Code2, ExternalLink, Sparkles } from "lucide-react";

const socials = [
  {
    label: "GitHub",
    handle: "@Priyanshu84iya",
    url: "https://github.com/Priyanshu84iya",
    icon: Github,
    color: "from-gray-700 to-gray-900",
    border: "border-gray-600/40 hover:border-gray-400/60",
    iconColor: "text-white",
  },
  {
    label: "LinkedIn",
    handle: "priyanshu-chaurasiya",
    url: "https://www.linkedin.com/in/priyanshu-chaurasiya-8986a833b/",
    icon: Linkedin,
    color: "from-[#0a66c2] to-[#084d94]",
    border: "border-blue-500/40 hover:border-blue-400/60",
    iconColor: "text-white",
  },
  {
    label: "Instagram",
    handle: "@priyansh.u26",
    url: "https://www.instagram.com/priyansh.u26",
    icon: Instagram,
    color: "from-[#f09433] via-[#e6683c] to-[#bc1888]",
    border: "border-pink-500/40 hover:border-pink-400/60",
    iconColor: "text-white",
  },
  {
    label: "Google Developer",
    handle: "g.dev/priyanshu26",
    url: "https://g.dev/priyanshu26",
    icon: Globe,
    color: "from-[#4285f4] to-[#34a853]",
    border: "border-green-500/40 hover:border-green-400/60",
    iconColor: "text-white",
  },
];

const techStack = [
  "React", "TypeScript", "Vite", "Tailwind CSS",
  "Supabase", "OMDb API", "Lucide Icons",
];

export function AboutPage() {
  return (
    <div className="px-4 md:px-12 py-8 pb-24 min-h-screen animate-page-enter">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          About <span className="text-primary">LUMA</span>
        </h1>
        <p className="text-muted text-sm md:text-base max-w-xl">
          A premium streaming discovery platform built with passion and modern web technology.
        </p>
      </div>

      {/* App info card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 md:p-8 mb-8 shadow-xl">
        {/* Decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Logo */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">LUMA</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                v2.0
              </span>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed max-w-xl">
              LUMA is a premium streaming discovery app that aggregates content from multiple sources including
              OMDb, Cloudstream, NetMirror, and Cineby — giving you a unified, beautiful interface to explore,
              watch, and manage your favourite movies, series, and anime.
            </p>
          </div>
        </div>

        {/* Tech stack */}
        <div className="relative z-10 mt-6 pt-6 border-t border-border/40">
          <p className="text-xs text-muted font-semibold uppercase tracking-widest mb-3">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full bg-surface-2 border border-border/60 text-xs font-semibold text-text/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Developer section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-extrabold text-white">Developer</h2>
        </div>

        {/* Developer card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 md:p-8 mb-8 shadow-xl">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5 mb-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent via-primary to-primary/60 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl font-black text-white select-none">P</span>
            </div>

            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1">Priyanshu Chaurasiya</h3>
              <p className="text-primary font-semibold text-sm mb-3">Developer</p>
              <p className="text-muted text-sm leading-relaxed max-w-lg">
                Passionate developer who loves building sleek, modern web experiences. Creator and maintainer of LUMA —
                an open streaming discovery platform designed to feel as premium as the content it serves.
              </p>
            </div>
          </div>

          {/* Social links grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-4 p-4 rounded-xl border ${social.border} bg-surface-2/50 hover:bg-surface-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
                >
                  {/* Icon badge */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${social.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">{social.label}</p>
                    <p className="text-sm font-bold text-white truncate">{social.handle}</p>
                  </div>

                  <ExternalLink className="w-4 h-4 text-muted/50 group-hover:text-muted transition-colors flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted/50 text-center font-medium">
        LUMA is an independent, open-source project. Not affiliated with any streaming service.
      </p>
    </div>
  );
}
