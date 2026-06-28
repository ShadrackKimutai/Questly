import { EXAMPLE_QUIZ } from "@questly/common/constants"
import type {
  GameResult,
  GameResultMeta,
  QuizWithId,
} from "@questly/common/types/game"
import { quizValidator } from "@questly/common/validators/quiz"
import { normalizeFilename } from "@questly/socket/utils/game"
import fs from "fs"
import { resolve } from "path"

interface GameConfig {
  managerPassword: string
}

const inContainerPath = process.env.CONFIG_PATH

const getPath = (path = "") =>
  inContainerPath
    ? resolve(inContainerPath, path)
    : resolve(process.cwd(), "../../config", path)

export const initConfig = () => {
  const isConfigFolderExists = fs.existsSync(getPath())

  if (!isConfigFolderExists) {
    fs.mkdirSync(getPath())
  }

  const isGameConfigExists = fs.existsSync(getPath("game.json"))

  if (!isGameConfigExists) {
    fs.writeFileSync(
      getPath("game.json"),
      JSON.stringify(
        {
          managerPassword: "PASSWORD",
        },
        null,
        2,
      ),
    )
  }

  const isQuizExists = fs.existsSync(getPath("quiz"))

  if (!isQuizExists) {
    fs.mkdirSync(getPath("quiz"))

    fs.writeFileSync(
      getPath("quiz/example.json"),
      JSON.stringify(EXAMPLE_QUIZ, null, 2),
    )
  }
}

export const getGameConfig = (): GameConfig => {
  const isExists = fs.existsSync(getPath("game.json"))

  if (!isExists) {
    throw new Error("Game config not found")
  }

  try {
    const config = fs.readFileSync(getPath("game.json"), "utf-8")

    return JSON.parse(config) as GameConfig
  } catch (error) {
    console.error("Failed to read game config:", error)
  }

  return {} as GameConfig
}

export const getQuizMeta = () =>
  getQuiz().map(({ id, subject }) => ({ id, subject }))

export const getQuizById = (id: string) => {
  const filePath = getPath(`quiz/${id}.json`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Quiz "${id}" not found`)
  }

  const data = fs.readFileSync(filePath, "utf-8")
  const result = quizValidator.safeParse(JSON.parse(data))

  if (!result.success) {
    throw new Error(`Invalid quiz "${id}"`)
  }

  return { id, ...result.data }
}

export const getQuiz = () => {
  const isExists = fs.existsSync(getPath("quiz"))

  if (!isExists) {
    return []
  }

  try {
    const files = fs
      .readdirSync(getPath("quiz"))
      .filter((file) => file.endsWith(".json"))

    const quiz: QuizWithId[] = files.flatMap((file) => {
      const data = fs.readFileSync(getPath(`quiz/${file}`), "utf-8")
      const id = file.replace(".json", "")
      const result = quizValidator.safeParse(JSON.parse(data))

      if (!result.success) {
        console.warn(`Invalid quiz config "${file}":`, result.error.issues)

        return []
      }

      return [{ id, ...result.data }]
    })

    return quiz
  } catch (error) {
    console.error("Failed to read quiz config:", error)

    return []
  }
}

export const updateQuiz = (id: string, data: unknown): { id: string } => {
  const result = quizValidator.safeParse(data)

  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }

  const oldPath = getPath(`quiz/${id}.json`)

  if (!fs.existsSync(oldPath)) {
    throw new Error(`Quiz "${id}" not found`)
  }

  fs.writeFileSync(oldPath, JSON.stringify(result.data, null, 2))

  return { id }
}

export const deleteQuiz = (id: string): void => {
  const filePath = getPath(`quiz/${id}.json`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Quiz "${id}" not found`)
  }

  fs.unlinkSync(filePath)
}

export const saveResult = (data: GameResult): void => {
  try {
    const resultsPath = getPath("results")

    if (!fs.existsSync(resultsPath)) {
      fs.mkdirSync(resultsPath)
    }

    fs.writeFileSync(
      getPath(`results/${data.id}.json`),
      JSON.stringify(data, null, 2),
    )

    console.log(`Saved result for "${data.subject}"`)
  } catch (error) {
    console.error("Failed to save result:", error)
  }
}

export const getResultsMeta = (): GameResultMeta[] => {
  const resultsPath = getPath("results")

  if (!fs.existsSync(resultsPath)) {
    return []
  }

  const readMeta = (file: string): GameResultMeta | null => {
    try {
      const data = fs.readFileSync(getPath(`results/${file}`), "utf-8")
      const result = JSON.parse(data) as GameResult

      return {
        id: result.id,
        subject: result.subject,
        date: result.date,
        playerCount: result.players.length,
      }
    } catch {
      return null
    }
  }

  try {
    return fs
      .readdirSync(resultsPath)
      .filter((file) => file.endsWith(".json"))
      .map(readMeta)
      .filter((meta): meta is GameResultMeta => meta !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
}

export const getResultById = (id: string): GameResult => {
  const filePath = getPath(`results/${id}.json`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Result "${id}" not found`)
  }

  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as GameResult
}

export const deleteResult = (id: string): void => {
  const filePath = getPath(`results/${id}.json`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Result "${id}" not found`)
  }

  fs.unlinkSync(filePath)
}

export const saveQuiz = (data: unknown): { id: string } => {
  const result = quizValidator.safeParse(data)

  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }

  const id = normalizeFilename(result.data.subject)
  const filePath = getPath(`quiz/${id}.json`)

  fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2))

  return { id }
}
