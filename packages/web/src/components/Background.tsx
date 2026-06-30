import logo from "@questly/web/assets/logo.svg"
import GithubIcon from "@questly/web/components/GithubIcon"
import type { PropsWithChildren } from "react"

const Background = ({ children }: PropsWithChildren) => (
  <section className="gradient-bg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
    {/* Floating gradient orbs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="anim-float absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-purple-600/25 blur-3xl" />
      <div className="anim-float-slow absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="anim-float absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-pink-500/15 blur-3xl" />
      <div className="anim-float-slow absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />

      {/* Subtle dot grid */}
      <div className="dot-grid absolute inset-0 opacity-[0.06]" />
    </div>

    <img src={logo} className="relative z-10 mb-10 h-16 drop-shadow-2xl" alt="logo" />
    {children}

    <a
      href="https://github.com/questly-co/Questly"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 text-sm font-semibold text-white/40 transition-colors hover:text-white/70"
    >
      <GithubIcon size={14} />
      {/* oxlint-disable-next-line no-undef */}
      Questly - v{__APP_VERSION__}
    </a>
  </section>
)

export default Background
