// oxlint-disable typescript/no-unnecessary-condition
import { EVENTS, MEDIA_TYPES, NO_TIME_LIMIT } from "@questly/common/constants"
import type {
  Answer,
  GameResult,
  Player,
  Question,
  QuestionResult,
  Quizz,
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
  quizz: Quizz
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

export class RoundManager {
  private readonly opts: RoundManagerOptions
  private started = false
  private currentQuestion = 0
  private playersAnswers: Answer[] = []
  private startTime = 0
  private leaderboard: Player[] = []
  private tempOldLeaderboard: Player[] | null = null
  private questionsHistory: QuestionResult[] = []

  constructor(opts: RoundManagerOptions) {
    this.opts = opts
  }

  isStarted(): boolean {
    return this.started
  }

  getReconnectInfo() {
    return {
      current: this.currentQuestion + 1,
      total: this.opts.quizz.questions.length,
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
      subject: this.opts.quizz.subject,
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

    const question = this.opts.quizz.questions[this.currentQuestion]

    this.opts.onNewQuestion()

    this.opts.io.to(this.opts.gameId).emit(EVENTS.GAME.UPDATE_QUESTION, {
      current: this.currentQuestion + 1,
      total: this.opts.quizz.questions.length,
    })

    this.opts.broadcast(STATUS.SHOW_PREPARED, {
      totalAnswers: question.answers.length,
      questionNumber: this.currentQuestion + 1,
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

    this.opts.broadcast(STATUS.SELECT_ANSWER, {
      question: question.question,
      answers: question.answers,
      media: question.media,
      time: question.time,
      totalPlayer: this.opts.players.count(),
      type: question.type ?? (question.solutions.length > 1 ? "multiple" : "single"),
    })

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

    const sortedPlayers = currentPlayers
      .map((player) => {
        const playerAnswer = this.playersAnswers.find(
          (a) => a.playerId === player.id,
        )

        const isCorrect = (() => {
          if (!playerAnswer) return false
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

        const points =
          playerAnswer && isCorrect ? Math.round(playerAnswer.points) : 0

        player.points += points
        player.streak = isCorrect ? player.streak + 1 : 0

        return { ...player, lastCorrect: isCorrect, lastPoints: points }
      })
      .sort((a, b) => b.points - a.points)

    this.opts.players.replace(sortedPlayers)

    const qType = question.type ?? (question.solutions.length > 1 ? "multiple" : "single")

    sortedPlayers.forEach((player, index) => {
      const rank = index + 1
      const aheadPlayer = sortedPlayers[index - 1]

      const playerAnswer = this.playersAnswers.find((a) => a.playerId === player.id)
      const answerId = playerAnswer?.answerId ?? null

      const answerFeedback: AnswerFeedback = qType === "shortanswer"
        ? {
            type: "shortanswer",
            playerText: typeof answerId === "string" ? answerId : null,
            correctOptions: question.textSolutions ?? [],
          }
        : {
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

      this.opts.send(player.id, STATUS.SHOW_RESULT, {
        correct: player.lastCorrect,
        message: player.lastCorrect ? "game:correct" : "game:wrong",
        points: player.lastPoints,
        myPoints: player.points,
        rank,
        aheadOfMe: aheadPlayer ? aheadPlayer.username : null,
        answerFeedback,
      })
    })

    this.opts.send(this.opts.getManagerId(), STATUS.SHOW_RESPONSES, {
      ...question,
      responses: totalType,
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

    const question = this.opts.quizz.questions[this.currentQuestion]

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
    const question = this.opts.quizz.questions[this.currentQuestion]

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
    const question = this.opts.quizz.questions[this.currentQuestion]

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

    if (!this.opts.quizz.questions[this.currentQuestion + 1]) {
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
      this.currentQuestion + 1 === this.opts.quizz.questions.length

    if (isLastRound) {
      this.started = false

      const top = this.leaderboard.slice(0, 3)

      const result: GameResult = {
        id: `${Date.now()}-${nanoid(8)}`,
        subject: this.opts.quizz.subject,
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
        subject: this.opts.quizz.subject,
        top,
        resultId: result.id,
      })

      this.leaderboard.forEach((player, index) => {
        this.opts.send(player.id, STATUS.FINISHED, {
          subject: this.opts.quizz.subject,
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
