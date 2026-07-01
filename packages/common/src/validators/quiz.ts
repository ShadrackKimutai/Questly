import { MEDIA_TYPES } from "@questly/common/constants"
import { z } from "zod"

export const questionMediaValidator = z.object({
  type: z
    .enum([MEDIA_TYPES.IMAGE, MEDIA_TYPES.VIDEO, MEDIA_TYPES.AUDIO])
    .optional(),
  url: z.url("errors:quiz.invalidMediaUrl"),
})

const calculatedVariableValidator = z.object({
  name: z.string().min(1, "errors:quiz.variableNameEmpty").max(16),
  min: z.number(),
  max: z.number(),
  decimals: z.number().int().min(0).max(6),
})

const questionValidator = z.object({
  question: z.string().min(1, "errors:quiz.questionEmpty"),
  media: questionMediaValidator.optional(),
  answers: z.array(z.string().min(1, "errors:quiz.answerEmpty")).default([]),
  solutions: z
    .union([z.number().int().min(0), z.array(z.number().int().min(0)).min(0)])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .default([]),
  textSolutions: z.array(z.string().min(1, "errors:quiz.answerEmpty")).optional(),
  cooldown: z.number().int().min(3).max(15),
  time: z.number().int().min(-1),
  type: z.enum(["single", "multiple", "truefalse", "shortanswer", "wordcloud", "calculated", "dotmocracy", "grid2x2"]).optional(),
  calculatedVariables: z.array(calculatedVariableValidator).optional(),
  formula: z.string().optional(),
  toleranceBase: z.number().min(0).max(100).optional(),
  tolerancePartial: z.number().min(0).max(100).optional(),
  answerDecimals: z.number().int().min(0).max(6).optional(),
  dotType: z.enum(["single", "multiple"]).optional(),
  gridXLabel: z.string().optional(),
  gridYLabel: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "calculated") {
    if (!data.formula || data.formula.trim().length === 0) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.noFormula", path: ["formula"] })
    }
    if (!data.calculatedVariables || data.calculatedVariables.length === 0) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.noVariables", path: ["calculatedVariables"] })
    } else {
      data.calculatedVariables.forEach((v, i) => {
        if (v.min >= v.max) {
          ctx.addIssue({ code: "custom", message: "errors:quiz.variableMinMax", path: ["calculatedVariables", i, "max"] })
        }
      })
    }
  } else if (data.type === "dotmocracy") {
    if (data.answers.length < 2) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.tooFewAnswers", path: ["answers"] })
    }
  } else if (data.type === "grid2x2") {
    if (data.answers.length < 1) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.tooFewAnswers", path: ["answers"] })
    }
    if (data.answers.length > 6) {
      ctx.addIssue({ code: "custom", message: "errors:quiz.tooManyAnswers", path: ["answers"] })
    }
  } else if (data.type === "shortanswer") {
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
