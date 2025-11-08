import { google } from "@ai-sdk/google";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": google("models/gemini-1.5-pro-latest"),
        "chat-model-reasoning": wrapLanguageModel({
          model: google("models/gemini-2.5-flash-preview-04-17"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": google("models/gemini-2.5-flash-preview-04-17"),
        "artifact-model": google("models/gemini-1.5-pro-latest"),
      },
    });
