import { MEDIA_TYPES } from "@questly/common/constants"
import { z } from "zod"

export const questionMediaValidator = z.object({
  type: z
    .enum([MEDIA_TYPES.IMAGE, MEDIA_TYPES.VIDEO, MEDIA_TYPES.AUDIO])
    .optional(),
  url: z.url("errors:quiz.invalidMediaUrl"),
})

const questionValidator = z.object({
  question: z.string().min(1, "errors:quiz.questionEmpty"),
  media: questionMediaValidator.optional(),
  answers: z.array(z.string().min(1, "errors:quiz.answerEmpty")),
  solutions: z
    .union([z.number().int().min(0), z.array(z.number().int().min(0)).min(0)])
    .transform((v) => (Array.isArray(v) ? v : [v])),
  textSolutions: z.array(z.string().min(1, "errors:quiz.answerEmpty")).optional(),
  cooldown: z.number().int().min(3).max(15),
  time: z.number().int().min(-1),
  type: z.enum(["single", "multiple", "truefalse", "shortanswer", "wordcloud"]).optional(),
}).superRefine((data, ctx) => {
  if (data.type === "shortanswer") {
    if (!data.textSolutions || data.textSolutions.length === 0) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.noTextSolutions", path: ["textSolutions"] })
    }
  } else if (data.type !== "wordcloud") {
    if (data.answers.length < 2) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.tooFewAnswers", path: ["answers"] })
    }
    if (data.answers.length > 4) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.tooManyAnswers", path: ["answers"] })
    }
  }
})

export const quizValidator = z.object({
  subject: z.string().min(1, "errors:quiz.subjectEmpty"),
  questions: z.array(questionValidator).min(1, "errors:quiz.noQuestions"),
})

export type QuizValidated = z.infer<typeof quizValidator>
