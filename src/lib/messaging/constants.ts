export const MESSAGE_TYPES = {
  PROCESS_PROMPT: "process-prompt",
  PROMPT_PROCESSING_RESULT: "prompt-processing-result",
  TOKENS_REJECTED: "tokens-rejected",
} as const;

export const SOURCE_TYPES = {
  REQUEST_HANDLER: "lasso-request-handler",
  EXTENSION: "lasso-extension",
  HOOK_LISTENER: "lasso-ext-hook-listener",
  WORKER: "lasso-ext-worker",
} as const;
