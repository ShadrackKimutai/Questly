import { EVENTS, MEDIA_TYPES, NO_TIME_LIMIT } from "@questly/common/constants"
import type { QuestionMediaType } from "@questly/common/types/game"
import type { CommonStatusDataMap } from "@questly/common/types/game/status"
import QuestionMedia from "@questly/web/components/QuestionMedia"
import AnswerButton from "@questly/web/features/game/components/AnswerButton"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { usePlayerStore } from "@questly/web/features/game/stores/player"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
  SFX,
} from "@questly/web/features/game/utils/constants"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import useSound from "use-sound"

interface Props {
  data: CommonStatusDataMap["SELECT_ANSWER"]
}

const Answers = ({
  data: { question, answers, media, time, totalPlayer, type, playerVariables },
}: Props) => {
  const { socket } = useSocket()
  const { player, gameId } = usePlayerStore()
  const isMultiple = type === "multiple"
  const isShortAnswer = type === "shortanswer"
  const isWordCloud = type === "wordcloud"
  const isCalculated = type === "calculated"

  const renderedQuestion =
    isCalculated && playerVariables
      ? question.replace(/\{(\w+)\}/g, (_, name) =>
          name in playerVariables ? String(playerVariables[name]) : `{${name}}`,
        )
      : question

  const shouldShuffle = type === "single" || type === "multiple"
  const [shuffleOrder] = useState<number[]>(() => {
    const order = answers.map((_, i) => i)
    if (!shouldShuffle) return order
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
  })

  const [cooldown, setCooldown] = useState(time)
  const [totalAnswer, setTotalAnswer] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<number[]>([])
  const [textInput, setTextInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (player) {
      const { setPendingQuestion } = usePlayerStore.getState()
      setPendingQuestion(question)
    }
    // oxlint-disable-next-line
  }, [])

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
    if (!player || !gameId || submitted) return

    if (isCalculated) {
      if (!textInput.trim()) return
      const numVal = parseFloat(textInput)
      if (isNaN(numVal)) return
      socket.emit(EVENTS.PLAYER.TEXT_ANSWER, {
        gameId,
        data: { answerText: textInput.trim() },
      })
    } else if (isShortAnswer || isWordCloud) {
      if (!textInput.trim()) return
      socket.emit(EVENTS.PLAYER.TEXT_ANSWER, {
        gameId,
        data: { answerText: textInput.trim() },
      })
    } else if (isMultiple) {
      if (selectedKeys.length === 0) return
      socket.emit(EVENTS.PLAYER.SELECTED_ANSWERS, {
        gameId,
        data: { answerKeys: selectedKeys },
      })
    } else {
      if (selectedKeys.length === 0) return
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto inline-flex min-h-0 w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-4 py-4">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {renderedQuestion}
        </h2>

        {isCalculated && playerVariables && Object.keys(playerVariables).length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(playerVariables).map(([name, val]) => (
              <span
                key={name}
                className="rounded-xl bg-white/15 px-4 py-1.5 font-mono text-lg font-bold text-white backdrop-blur-sm drop-shadow"
              >
                {name} = {val}
              </span>
            ))}
          </div>
        )}

        {isWordCloud && (
          <p className="rounded-lg bg-black/30 px-4 py-1.5 text-sm font-semibold text-white drop-shadow">
            {t("game:wordcloudHint")}
          </p>
        )}

        {isMultiple && (
          <p className="rounded-lg bg-black/30 px-4 py-1.5 text-sm font-semibold text-white drop-shadow">
            {t("game:selectAllThatApply")}
          </p>
        )}

        <QuestionMedia media={media} alt={question} />
      </div>

      <div className="shrink-0">
        <div className="mx-auto mb-2 flex w-full max-w-7xl justify-between gap-1 px-2 text-base font-bold text-white md:text-xl">
          {time !== NO_TIME_LIMIT && (
            <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 py-1 font-bold">
              <span className="text-xs">{t("game:hud.time")}</span>
              <span>{cooldown}</span>
            </div>
          )}
          <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 py-1 font-bold">
            <span className="text-xs">{t("game:hud.answers")}</span>
            <span>{totalAnswer}/{totalPlayer}</span>
          </div>
        </div>

        {isCalculated && player ? (
          <div className="mx-auto mb-3 w-full max-w-7xl px-2">
            <div className="mb-2 flex gap-2">
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={submitted}
                placeholder={t("game:calculated.hint")}
                className="flex-1 rounded-2xl bg-white/20 px-4 py-3 text-base font-semibold text-white placeholder-white/60 outline-none backdrop-blur-sm focus:bg-white/30 disabled:opacity-60"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitted || !textInput.trim()}
              className="bg-primary w-full rounded-2xl py-3 text-base font-bold text-white shadow-lg transition-opacity disabled:opacity-40 md:py-4 md:text-lg"
            >
              {t("game:submitAnswer")}
            </button>
          </div>
        ) : isCalculated ? (
          <div className="mx-auto mb-3 w-full max-w-7xl px-2">
            <div className="flex items-center justify-center rounded-2xl bg-black/30 py-6 font-semibold text-white/80">
              {t("game:waitingForAnswers")}
            </div>
          </div>
        ) : (isShortAnswer || isWordCloud) && player ? (
          <div className="mx-auto mb-3 w-full max-w-7xl px-2">
            <div className="mb-2 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={submitted}
                placeholder={t(isWordCloud ? "game:typeYourWord" : "game:typeYourAnswer")}
                className="flex-1 rounded-2xl bg-white/20 px-4 py-3 text-base font-semibold text-white placeholder-white/60 outline-none backdrop-blur-sm focus:bg-white/30 disabled:opacity-60"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitted || !textInput.trim()}
              className="bg-primary w-full rounded-2xl py-3 text-base font-bold text-white shadow-lg transition-opacity disabled:opacity-40 md:py-4 md:text-lg"
            >
              {t("game:submitAnswer")}
            </button>
          </div>
        ) : (isShortAnswer || isWordCloud) ? (
          <div className="mx-auto mb-3 w-full max-w-7xl px-2">
            <div className="flex items-center justify-center rounded-2xl bg-black/30 py-6 font-semibold text-white/80">
              {t("game:waitingForAnswers")}
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-2 grid w-full max-w-7xl grid-cols-2 gap-1 px-2 font-bold text-white">
              {shuffleOrder.map((originalKey, displayKey) => {
                const isSelected = selectedKeys.includes(originalKey)

                return (
                  <AnswerButton
                    key={originalKey}
                    className={clsx(
                      ANSWERS_COLORS[displayKey],
                      submitted && "opacity-60 cursor-not-allowed",
                    )}
                    label={ANSWERS_LABELS[displayKey]}
                    selected={isSelected}
                    showRadio={!isMultiple}
                    showCheckbox={isMultiple}
                    onClick={handleSelect(originalKey)}
                    disabled={submitted}
                  >
                    {answers[originalKey]}
                  </AnswerButton>
                )
              })}
            </div>

            <div className="mx-auto mb-3 w-full max-w-7xl px-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitted || selectedKeys.length === 0}
                className="bg-primary w-full rounded-2xl py-3 text-base font-bold text-white shadow-lg transition-opacity disabled:opacity-40 md:py-4 md:text-lg"
              >
                {t("game:submitAnswer")}
                {isMultiple && selectedKeys.length > 0 && ` (${selectedKeys.length})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Answers
