import { EVENTS } from "@questly/common/constants"
import type { CommonStatusDataMap } from "@questly/common/types/game/status"
import { useEvent } from "@questly/web/features/game/contexts/socket-context"
import { SFX } from "@questly/web/features/game/utils/constants"
import clsx from "clsx"
import { useState } from "react"
import useSound from "use-sound"

interface Props {
  data: CommonStatusDataMap["SHOW_START"]
}

const Start = ({ data: { time, subject } }: Props) => {
  const [showTitle, setShowTitle] = useState(true)
  const [cooldown, setCooldown] = useState(time)

  const [sfxBoump] = useSound(SFX.BOUMP_SOUND, {
    volume: 0.2,
  })

  useEvent(EVENTS.GAME.START_COOLDOWN, () => {
    sfxBoump()
    setShowTitle(false)
  })

  useEvent(EVENTS.GAME.COOLDOWN, (sec) => {
    sfxBoump()
    setCooldown(sec)
  })

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6">
      {showTitle ? (
        <h2 className="anim-show text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {subject}
        </h2>
      ) : (
        <div className="relative flex items-center justify-center">
          <div
            className={clsx(
              "anim-show anim-pulse-glow gradient-primary aspect-square h-32 rounded-3xl shadow-2xl shadow-orange-900/50 transition-all md:h-60",
            )}
            // dynamic rotation can't be expressed as a static Tailwind class
            style={{ transform: `rotate(${45 * (time - cooldown)}deg)` }}
          />
          <span className="absolute text-6xl font-extrabold text-white drop-shadow-lg md:text-8xl">
            {cooldown}
          </span>
        </div>
      )}
    </section>
  )
}

export default Start
