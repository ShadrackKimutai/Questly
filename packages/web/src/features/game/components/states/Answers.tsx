import { EVENTS, MEDIA_TYPES, NO_TIME_LIMIT } from "@razzia/common/constants"
import type { QuestionMediaType } from "@razzia/common/types/game"
import type { CommonStatusDataMap } from "@razzia/common/types/game/status"
import QuestionMedia from "@razzia/web/components/QuestionMedia"
import AnswerButton from "@razzia/web/features/game/components/AnswerButton"
import {
  useEvent,
  useSocket,
} from "@razzia/web/features/game/contexts/socket-context"
import { usePlayerStore } from "@razzia/web/features/game/stores/player"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
  SFX,
} from "@razzia/web/features/game/utils/constants"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import useSound from "use-sound"

interface Props {
  data: CommonStatusDataMap["SELECT_ANSWER"]
}

const Answers = ({
  data: { question, answers, media, time, totalPlayer, type },
}: Props) => {
  const { socket } = useSocket()
  const { player, gameId } = usePlayerStore()
  const isMultiple = type === "multiple"

  const [cooldown, setCooldown] = useState(time)
  const [totalAnswer, setTotalAnswer] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<number[]>([])
  const { t } = useTranslation()

  const [sfxPop] = useSound(SFX.ANSWERS.SOUND, { volume: 0.1 })
  const [playMusic, { stop: stopMusic }] = useSound(SFX.ANSWERS.MUSIC, {
    volume: 0.2,
    interrupt: true,
    loop: true,
  })

  const handleSelect = (key: number) => () => {
    if (!player || !gameId || submitted) return

    if (isMultiple) {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      )
    } else {
      setSelectedKeys((prev) => (prev[0] === key ? [] : [key]))
    }

    sfxPop()
  }

  const handleSubmit = () => {
    if (!player || !gameId || submitted || selectedKeys.length === 0) return

    if (isMultiple) {
      socket.emit(EVENTS.PLAYER.SELECTED_ANSWERS, {
        gameId,
        data: { answerKeys: selectedKeys },
      })
    } else {
      socket.emit(EVENTS.PLAYER.SELECTED_ANSWER, {
        gameId,
        data: { answerKey: selectedKeys[0] },
      })
    }

    setSubmitted(true)
  }

  useEffect(() => {
    const disabledMusicMedia = [
      MEDIA_TYPES.AUDIO,
      MEDIA_TYPES.VIDEO,
    ] as QuestionMediaType[]

    if (disabledMusicMedia.includes(media?.type)) return

    playMusic()

    return () => {
      stopMusic()
    }
    // oxlint-disable-next-line
  }, [playMusic])

  useEvent(EVENTS.GAME.COOLDOWN, (sec) => {
    setCooldown(sec)
  })

  useEvent(EVENTS.GAME.PLAYER_ANSWER, (count) => {
    setTotalAnswer(count)
    sfxPop()
  })

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>

        {isMultiple && (
          <p className="rounded-lg bg-black/30 px-4 py-1.5 text-sm font-semibold text-white drop-shadow">
            {t("game:selectAllThatApply")}
          </p>
        )}

        <QuestionMedia media={media} alt={question} />
      </div>

      <div>
        <div className="mx-auto mb-4 flex w-full max-w-7xl justify-between gap-1 px-2 text-lg font-bold text-white md:text-xl">
          {time !== NO_TIME_LIMIT && (
            <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 text-lg font-bold">
              <span className="translate-y-1 text-sm">{t("game:hud.time")}</span>
              <span>{cooldown}</span>
            </div>
          )}
          <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 text-lg font-bold">
            <span className="translate-y-1 text-sm">{t("game:hud.answers")}</span>
            <span>{totalAnswer}/{totalPlayer}</span>
          </div>
        </div>

        <div className="mx-auto mb-2 grid w-full max-w-7xl grid-cols-2 gap-1 px-2 text-lg font-bold text-white md:text-xl">
          {answers.map((answer, key) => {
            const isSelected = selectedKeys.includes(key)

            return (
              <AnswerButton
                key={key}
                className={clsx(
                  ANSWERS_COLORS[key],
                  submitted && "opacity-60 cursor-not-allowed",
                )}
                label={ANSWERS_LABELS[key]}
                selected={isSelected}
                showRadio={!isMultiple}
                showCheckbox={isMultiple}
                onClick={handleSelect(key)}
                disabled={submitted}
              >
                {answer}
              </AnswerButton>
            )
          })}
        </div>

        <div className="mx-auto mb-4 w-full max-w-7xl px-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted || selectedKeys.length === 0}
            className="bg-primary w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-opacity disabled:opacity-40"
          >
            {t("game:submitAnswer")}
            {isMultiple && selectedKeys.length > 0 && ` (${selectedKeys.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Answers
