import logo from "@questly/web/assets/logo.svg"
import GithubIcon from "@questly/web/components/GithubIcon"
import LanguageSwitcher from "@questly/web/components/LanguageSwitcher"
import { Link } from "@tanstack/react-router"
import {
  Languages,
  ListChecks,
  PenLine,
  Smartphone,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import { useTranslation } from "react-i18next"

const FEATURE_ICONS = [Zap, ListChecks, Smartphone, Languages]
const STEP_ICONS = [PenLine, Users, Trophy]

const Landing = () => {
  const { t } = useTranslation()

  const features = t("landing:features", { returnObjects: true }) as {
    title: string
    description: string
  }[]

  const steps = t("landing:steps", { returnObjects: true }) as {
    title: string
    description: string
  }[]

  return (
    <div className="gradient-bg relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="anim-float absolute -top-32 -left-32 h-125 w-125 rounded-full bg-purple-600/25 blur-3xl" />
        <div className="anim-float-slow absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="anim-float absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="anim-float-slow absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="dot-grid absolute inset-0 opacity-[0.06]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <img src={logo} className="h-9 drop-shadow-2xl" alt="Questly" />
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden text-sm font-semibold text-white/70 transition-colors hover:text-white sm:block"
          >
            {t("landing:joinGame")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 py-16 text-center md:py-24">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wide text-white/80 uppercase backdrop-blur-sm">
            {t("landing:badge")}
          </span>
          <h1 className="max-w-3xl text-4xl font-black text-white drop-shadow-lg md:text-6xl">
            {t("landing:heroTitle")}
          </h1>
          <p className="max-w-xl text-lg text-white/70 md:text-xl">
            {t("landing:heroSubtitle")}
          </p>
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/manager/login"
              className="gradient-primary rounded-xl px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:brightness-110 active:scale-95"
            >
              {t("landing:cta")}
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-lg font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:hidden"
            >
              {t("landing:joinGame")}
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 md:pb-24 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="gradient-primary flex size-11 items-center justify-center rounded-xl">
                  {Icon && <Icon className="size-5 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.description}</p>
              </div>
            )
          })}
        </section>

        {/* How it works */}
        <section className="pb-16 md:pb-24">
          <h2 className="mb-10 text-center text-3xl font-bold text-white md:text-4xl">
            {t("landing:howItWorksTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <div key={step.title} className="flex flex-col items-center gap-3 text-center">
                  <div className="relative flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    {Icon && <Icon className="size-7 text-white" />}
                    <span className="gradient-primary absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="max-w-64 text-sm text-white/60">{step.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/5 px-6 py-14 text-center backdrop-blur-sm mb-16">
          <h2 className="max-w-lg text-2xl font-bold text-white md:text-3xl">
            {t("landing:footerCtaTitle")}
          </h2>
          <Link
            to="/manager/login"
            className="gradient-primary rounded-xl px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:brightness-110 active:scale-95"
          >
            {t("landing:cta")}
          </Link>
        </section>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-2 pb-8">
        <a
          href="https://github.com/questly-co/Questly"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-white/40 transition-colors hover:text-white/70"
        >
          <GithubIcon size={14} />
          {/* oxlint-disable-next-line no-undef */}
          Questly - v{__APP_VERSION__}
        </a>
      </footer>
    </div>
  )
}

export default Landing
