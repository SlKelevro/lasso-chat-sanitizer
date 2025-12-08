export const MESSAGE_TYPES = {
  PROCESS_PROMPT: "process-prompt",
  PROMPT_PROCESSING_RESULT: "prompt-processing-result",
  PROMPT_TOKENS: "prompt-tokens",
} as const;

export const SOURCE_TYPES = {
  REQUEST_HANDLER: "lasso-request-handler",
  EXTENSION: "lasso-extension",
  HOOK_LOADER: "lasso-ext-hook-loader",
  WORKER: "lasso-ext-worker",
} as const;
