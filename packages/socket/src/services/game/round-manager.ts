// oxlint-disable typescript/no-unnecessary-condition
import { EVENTS, MEDIA_TYPES, NO_TIME_LIMIT } from "@questly/common/constants"
import type {
  Answer,
  GameResult,
  Player,
  Question,
  QuestionResult,
  Quiz,
} from "@questly/common/types/game"
import type { Server, Socket } from "@questly/common/types/game/socket"
import {
  type AnswerFeedback,
  type Status,
  STATUS,
  type StatusDataMap,
} from "@questly/common/types/game/status"
import { CooldownTimer } from "@questly/socket/services/game/cooldown-timer"
import { PlayerManager } from "@questly/socket/services/game/player-manager"
import {
  checkTolerance,
  evaluateFormula,
  randomizeVariables,
} from "@questly/socket/utils/calculated"
import { orderToPoint, timeToPoint } from "@questly/socket/utils/game"
import sleep from "@questly/socket/utils/sleep"
import { nanoid } from "nanoid"

type BroadcastFn = <T extends Status>(
  _status: T,
  _data: StatusDataMap[T],
) => void
type SendFn = <T extends Status>(
  _target: string,
  _status: T,
  _data: StatusDataMap[T],
) => void

export interface RoundManagerOptions {
  quiz: Quiz
  players: PlayerManager
  cooldown: CooldownTimer
  io: Server
  gameId: string
  getManagerId: () => string
  broadcast: BroadcastFn
  send: SendFn
  onNewQuestion: () => void
  onGameFinished: (_result: GameResult) => void
}

interface CalculatedPlayerData {
  correctAnswer: number
  variables: Record<string, number>
}

export class RoundManager {
  private readonly opts: RoundManagerOptions
  private started = false
  private currentQuestion = 0
  private playersAnswers: Answer[] = []
  private startTime = 0
  private leaderboard: Player[] = []
  private tempOldLeaderboard: Player[] | null = null
  private questionsHistory: QuestionResult[] = []
  private calculatedData = new Map<string, CalculatedPlayerData>()

  constructor(opts: RoundManagerOptions) {
    this.opts = opts
  }

  isStarted(): boolean {
    return this.started
  }

  getReconnectInfo() {
    return {
      current: this.currentQuestion + 1,
      total: this.opts.quiz.questions.length,
    }
  }

  async start(socket: Socket): Promise<void> {
    if (this.opts.getManagerId() !== socket.id) {
      return
    }

    if (this.started) {
      return
    }

    if (this.opts.players.count() === 0) {
      socket.emit(EVENTS.GAME.ERROR_MESSAGE, "errors:game.noPlayersConnected")

      return
    }

    this.started = true

    this.opts.broadcast(STATUS.SHOW_START, {
      time: 3,
      subject: this.opts.quiz.subject,
    })

    await sleep(3)

    this.opts.io.to(this.opts.gameId).emit(EVENTS.GAME.START_COOLDOWN)
    await this.opts.cooldown.start(3)

    void this.newQuestion()
  }

  async newQuestion(): Promise<void> {
    if (!this.started) {
      return
    }

    const question = this.opts.quiz.questions[this.currentQuestion]
    const qType = question.type ?? (question.solutions.length > 1 ? "multiple" : "single")
    const isCalculated = qType === "calculated"
    const isDotmocracy = qType === "dotmocracy"
    const isGrid2x2 = qType === "grid2x2"

    this.calculatedData.clear()
    this.opts.onNewQuestion()

    this.opts.io.to(this.opts.gameId).emit(EVENTS.GAME.UPDATE_QUESTION, {
      current: this.currentQuestion + 1,
      total: this.opts.quiz.questions.length,
    })

    this.opts.broadcast(STATUS.SHOW_PREPARED, {
      totalAnswers: (isCalculated || isDotmocracy || isGrid2x2) ? 0 : question.answers.length,
      questionNumber: this.currentQuestion + 1,
      type: qType,
    })

    await sleep(2)

    if (!this.started) {
      return
    }

    const imageMedia =
      question.media?.type === MEDIA_TYPES.IMAGE ? question.media : undefined

    this.opts.broadcast(STATUS.SHOW_QUESTION, {
      question: question.question,
      media: imageMedia,
      cooldown: question.cooldown,
    })

    await sleep(question.cooldown)

    if (!this.started) {
      return
    }

    this.startTime = Date.now()

    if (isCalculated) {
      // Send individualised SELECT_ANSWER to each player with their own variables
      const players = this.opts.players.getAll()
      const vars = question.calculatedVariables ?? []
      const formula = question.formula ?? ""

      for (const player of players) {
        const variables = randomizeVariables(vars)
        const correctAnswer = evaluateFormula(formula, variables)
        this.calculatedData.set(player.id, { correctAnswer, variables })

        this.opts.send(player.id, STATUS.SELECT_ANSWER, {
          question: question.question,
          answers: [],
          media: question.media,
          time: question.time,
          totalPlayer: players.length,
          type: "calculated",
          playerVariables: variables,
        })
      }

      // Manager sees the template without variables
      this.opts.send(this.opts.getManagerId(), STATUS.SELECT_ANSWER, {
        question: question.question,
        answers: [],
        media: question.media,
        time: question.time,
        totalPlayer: players.length,
        type: "calculated",
      })
    } else if (isDotmocracy) {
      this.opts.broadcast(STATUS.SELECT_ANSWER, {
        question: question.question,
        answers: question.answers,
        media: question.media,
        time: question.time,
        totalPlayer: this.opts.players.count(),
        type: qType,
        dotType: question.dotType ?? "single",
      })
    } else {
      this.opts.broadcast(STATUS.SELECT_ANSWER, {
        question: question.question,
        answers: question.answers,
        media: question.media,
        time: question.time,
        totalPlayer: this.opts.players.count(),
        type: qType,
        gridXLabel: question.gridXLabel,
        gridYLabel: question.gridYLabel,
      })
    }

    await this.opts.cooldown.start(question.time)

    if (!this.started) {
      return
    }

    this.showResults(question)
  }

  private showResults(question: Question): void {
    const currentPlayers = this.opts.players.getAll()

    const oldLeaderboard = (() => {
      if (this.leaderboard.length === 0) {
        return currentPlayers.map((p) => ({ ...p }))
      }

      return this.leaderboard.map((p) => ({ ...p }))
    })()

    const totalType = this.playersAnswers.reduce(
      (acc: Record<number, number>, { answerId }) => {
        if (typeof answerId === "string") return acc
        const ids = Array.isArray(answerId) ? answerId : [answerId]
        ids.forEach((id) => {
          acc[id] = (acc[id] || 0) + 1
        })

        return acc
      },
      {},
    )

    const qType = question.type ?? (question.solutions.length > 1 ? "multiple" : "single")
    const isCalculated = qType === "calculated"
    const isDotmocracy = qType === "dotmocracy"
    const isGrid2x2 = qType === "grid2x2"

    const toleranceBase = question.toleranceBase ?? 5
    const tolerancePartial = question.tolerancePartial ?? 15

    // Track calculated summary for the manager
    const calcSummary = { full: 0, partial: 0, wrong: 0 }

    const sortedPlayers = currentPlayers
      .map((player) => {
        const playerAnswer = this.playersAnswers.find(
          (a) => a.playerId === player.id,
        )

        let isCorrect = false
        let isPartial = false
        let earnedPoints = 0

        if (isDotmocracy || qType === "wordcloud" || isGrid2x2) {
          isCorrect = !!playerAnswer
          earnedPoints = playerAnswer ? 100 : 0
        } else if (isCalculated) {
          const stored = this.calculatedData.get(player.id)
          const rawText = typeof playerAnswer?.answerId === "string" ? playerAnswer.answerId : null
          const playerNum = rawText !== null ? parseFloat(rawText) : NaN

          if (stored && !isNaN(playerNum)) {
            const tier = checkTolerance(
              playerNum,
              stored.correctAnswer,
              toleranceBase,
              tolerancePartial,
            )
            if (tier === "full") {
              isCorrect = true
              earnedPoints = Math.round(playerAnswer?.points ?? 0)
              calcSummary.full++
            } else if (tier === "partial") {
              isPartial = true
              earnedPoints = Math.round((playerAnswer?.points ?? 0) * 0.5)
              calcSummary.partial++
            } else {
              calcSummary.wrong++
            }
          } else {
            calcSummary.wrong++
          }
        } else {
          isCorrect = (() => {
            if (!playerAnswer) return false
            if (qType === "wordcloud") return true
            const { answerId } = playerAnswer
            if (typeof answerId === "string") {
              return (question.textSolutions ?? []).some(
                (s) => s.toLowerCase().trim() === answerId.toLowerCase().trim(),
              )
            }
            if (Array.isArray(answerId)) {
              const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b)
              return JSON.stringify(sorted(answerId)) === JSON.stringify(sorted(question.solutions))
            }
            return question.solutions.includes(answerId)
          })()
          earnedPoints = playerAnswer && isCorrect ? Math.round(playerAnswer.points) : 0
        }

        player.points += earnedPoints
        // Streak: full correct maintains, partial or wrong breaks
        player.streak = isCorrect ? player.streak + 1 : 0

        return {
          ...player,
          lastCorrect: isCorrect,
          lastPartial: isPartial,
          lastPoints: earnedPoints,
        }
      })
      .sort((a, b) => b.points - a.points)

    this.opts.players.replace(sortedPlayers)

    sortedPlayers.forEach((player, index) => {
      const rank = index + 1
      const aheadPlayer = sortedPlayers[index - 1]

      const playerAnswer = this.playersAnswers.find((a) => a.playerId === player.id)
      const answerId = playerAnswer?.answerId ?? null

      let answerFeedback: AnswerFeedback

      if (isDotmocracy) {
        let playerVotes: number[]
        try {
          playerVotes = typeof answerId === "string" ? (JSON.parse(answerId) as number[]) : question.answers.map(() => 0)
        } catch {
          playerVotes = question.answers.map(() => 0)
        }
        answerFeedback = {
          type: "dotmocracy",
          votes: playerVotes,
          options: question.answers,
        }
      } else if (isCalculated) {
        const stored = this.calculatedData.get(player.id)
        const rawText = typeof answerId === "string" ? answerId : null
        const playerNum = rawText !== null ? parseFloat(rawText) : null
        const stored2 = this.calculatedData.get(player.id)

        let resultTier: "full" | "partial" | "wrong" = "wrong"
        if (stored2 && playerNum !== null && !isNaN(playerNum)) {
          resultTier = checkTolerance(playerNum, stored2.correctAnswer, toleranceBase, tolerancePartial)
        }

        answerFeedback = {
          type: "calculated",
          playerAnswer: playerNum !== null && !isNaN(playerNum!) ? playerNum : null,
          correctAnswer: stored?.correctAnswer ?? 0,
          playerVariables: stored?.variables ?? {},
          resultTier,
        }
      } else if (isGrid2x2) {
        let placements: ({ x: number; y: number } | null)[]
        try {
          placements = typeof answerId === "string" ? (JSON.parse(answerId) as ({ x: number; y: number } | null)[]) : question.answers.map(() => null)
        } catch {
          placements = question.answers.map(() => null)
        }
        answerFeedback = {
          type: "grid2x2",
          items: question.answers.map((label, i) => ({
            label,
            x: placements[i]?.x ?? null,
            y: placements[i]?.y ?? null,
          })),
        }
      } else if (qType === "wordcloud") {
        answerFeedback = {
          type: "wordcloud",
          playerText: typeof answerId === "string" ? answerId : null,
        }
      } else if (qType === "shortanswer") {
        answerFeedback = {
          type: "shortanswer",
          playerText: typeof answerId === "string" ? answerId : null,
          correctOptions: question.textSolutions ?? [],
        }
      } else {
        answerFeedback = {
          type: "choice",
          items: question.answers.map((text, i) => {
            const selectedIds = Array.isArray(answerId)
              ? answerId
              : typeof answerId === "number"
                ? [answerId]
                : []
            return {
              text,
              selectedByPlayer: selectedIds.includes(i),
              isCorrect: question.solutions.includes(i),
            }
          }),
        }
      }

      const isPartial = (player as typeof player & { lastPartial?: boolean }).lastPartial ?? false

      this.opts.send(player.id, STATUS.SHOW_RESULT, {
        correct: player.lastCorrect,
        partial: isPartial || undefined,
        message: isDotmocracy
          ? "game:dotmocracy.voteRecorded"
          : isGrid2x2
            ? "game:grid2x2.placementRecorded"
            : player.lastCorrect
              ? "game:correct"
              : isPartial
                ? "game:partial"
                : "game:wrong",
        points: player.lastPoints,
        myPoints: player.points,
        rank,
        aheadOfMe: aheadPlayer ? aheadPlayer.username : null,
        answerFeedback,
      })
    })

    const wordResponses: Record<string, number> | undefined =
      qType === "wordcloud"
        ? this.playersAnswers.reduce<Record<string, number>>((acc, { answerId }) => {
            if (typeof answerId === "string" && answerId.trim()) {
              const key = answerId.trim().toLowerCase()
              acc[key] = (acc[key] ?? 0) + 1
            }
            return acc
          }, {})
        : undefined

    const dotVotes: Record<number, number> | undefined = isDotmocracy
      ? this.playersAnswers.reduce<Record<number, number>>((acc, { answerId }) => {
          if (typeof answerId !== "string") return acc
          try {
            const votes = JSON.parse(answerId) as number[]
            votes.forEach((count, i) => {
              acc[i] = (acc[i] ?? 0) + count
            })
          } catch {
            // ignore malformed
          }
          return acc
        }, {})
      : undefined

    const gridPlacements: { itemIndex: number; x: number; y: number }[] | undefined = isGrid2x2
      ? this.playersAnswers.reduce<{ itemIndex: number; x: number; y: number }[]>((acc, { answerId }) => {
          if (typeof answerId !== "string") return acc
          try {
            const placements = JSON.parse(answerId) as ({ x: number; y: number } | null)[]
            placements.forEach((p, itemIndex) => {
              if (p) acc.push({ itemIndex, x: p.x, y: p.y })
            })
          } catch {
            // ignore malformed
          }
          return acc
        }, [])
      : undefined

    this.opts.send(this.opts.getManagerId(), STATUS.SHOW_RESPONSES, {
      ...question,
      responses: totalType,
      type: qType,
      wordResponses,
      calculatedSummary: isCalculated ? calcSummary : undefined,
      dotVotes,
      gridPlacements,
    })

    this.questionsHistory.push({
      ...question,
      playerAnswers: currentPlayers.map((player) => ({
        playerName: player.username,
        answerId:
          this.playersAnswers.find((a) => a.playerId === player.id)?.answerId ??
          null,
      })),
    })

    this.leaderboard = sortedPlayers
    this.tempOldLeaderboard = oldLeaderboard
    this.playersAnswers = []
  }

  selectAnswers(socket: Socket, answerIds: number[]): void {
    const player = this.opts.players.findById(socket.id)

    if (!player) {
      return
    }

    if (this.playersAnswers.find((a) => a.playerId === socket.id)) {
      return
    }

    const question = this.opts.quiz.questions[this.currentQuestion]

    const points = (() => {
      if (question.time === NO_TIME_LIMIT) {
        return orderToPoint(
          this.playersAnswers.length,
          this.opts.players.count(),
        )
      }

      return timeToPoint(this.startTime, question.time)
    })()

    this.playersAnswers.push({
      playerId: player.id,
      answerId: answerIds,
      points,
    })

    this.opts.send(socket.id, STATUS.WAIT, {
      text: "game:waitingForAnswers",
    })

    socket
      .to(this.opts.gameId)
      .emit(EVENTS.GAME.PLAYER_ANSWER, this.playersAnswers.length)
    this.opts.players.broadcastCount()

    if (this.playersAnswers.length === this.opts.players.count()) {
      this.opts.cooldown.abort()
    }
  }

  selectAnswer(socket: Socket, answerId: number): void {
    const player = this.opts.players.findById(socket.id)
    const question = this.opts.quiz.questions[this.currentQuestion]

    if (!player) {
      return
    }

    if (this.playersAnswers.find((a) => a.playerId === socket.id)) {
      return
    }

    const points = (() => {
      if (question.time === NO_TIME_LIMIT) {
        return orderToPoint(
          this.playersAnswers.length,
          this.opts.players.count(),
        )
      }

      return timeToPoint(this.startTime, question.time)
    })()

    this.playersAnswers.push({
      playerId: player.id,
      answerId,
      points,
    })

    this.opts.send(socket.id, STATUS.WAIT, {
      text: "game:waitingForAnswers",
    })

    socket
      .to(this.opts.gameId)
      .emit(EVENTS.GAME.PLAYER_ANSWER, this.playersAnswers.length)
    this.opts.players.broadcastCount()

    if (this.playersAnswers.length === this.opts.players.count()) {
      this.opts.cooldown.abort()
    }
  }

  textAnswer(socket: Socket, answerText: string): void {
    const player = this.opts.players.findById(socket.id)
    const question = this.opts.quiz.questions[this.currentQuestion]

    if (!player) return
    if (this.playersAnswers.find((a) => a.playerId === socket.id)) return

    const points = (() => {
      if (question.time === NO_TIME_LIMIT) {
        return orderToPoint(this.playersAnswers.length, this.opts.players.count())
      }
      return timeToPoint(this.startTime, question.time)
    })()

    this.playersAnswers.push({ playerId: player.id, answerId: answerText, points })

    this.opts.send(socket.id, STATUS.WAIT, { text: "game:waitingForAnswers" })
    socket.to(this.opts.gameId).emit(EVENTS.GAME.PLAYER_ANSWER, this.playersAnswers.length)
    this.opts.players.broadcastCount()

    if (this.playersAnswers.length === this.opts.players.count()) {
      this.opts.cooldown.abort()
    }
  }

  nextQuestion(socket: Socket): void {
    if (!this.started) {
      return
    }

    if (socket.id !== this.opts.getManagerId()) {
      return
    }

    if (!this.opts.quiz.questions[this.currentQuestion + 1]) {
      return
    }

    this.currentQuestion += 1
    void this.newQuestion()
  }

  abortQuestion(socket: Socket): void {
    if (!this.started) {
      return
    }

    if (socket.id !== this.opts.getManagerId()) {
      return
    }

    this.opts.cooldown.abort()
  }

  showLeaderboard(): void {
    const isLastRound =
      this.currentQuestion + 1 === this.opts.quiz.questions.length

    if (isLastRound) {
      this.started = false

      const top = this.leaderboard.slice(0, 3)

      const result: GameResult = {
        id: `${Date.now()}-${nanoid(8)}`,
        subject: this.opts.quiz.subject,
        date: new Date().toISOString(),
        players: this.leaderboard.map((player, index) => ({
          username: player.username,
          points: player.points,
          rank: index + 1,
        })),
        questions: this.questionsHistory,
      }

      this.opts.onGameFinished(result)

      this.opts.send(this.opts.getManagerId(), STATUS.FINISHED, {
        subject: this.opts.quiz.subject,
        top,
        resultId: result.id,
      })

      this.leaderboard.forEach((player, index) => {
        this.opts.send(player.id, STATUS.FINISHED, {
          subject: this.opts.quiz.subject,
          top,
          rank: index + 1,
        })
      })

      return
    }

    const oldLeaderboard = this.tempOldLeaderboard ?? this.leaderboard

    this.opts.send(this.opts.getManagerId(), STATUS.SHOW_LEADERBOARD, {
      oldLeaderboard: oldLeaderboard.slice(0, 5),
      leaderboard: this.leaderboard.slice(0, 5),
    })

    this.tempOldLeaderboard = null
  }
}
