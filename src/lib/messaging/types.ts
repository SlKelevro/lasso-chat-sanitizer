import type { PlatformType } from "@/lib/platforms/common/types.ts";
import { MESSAGE_TYPES, SOURCE_TYPES } from "./constants.ts";

export type PayloadMap = {
  [MESSAGE_TYPES.PROCESS_PROMPT]: { content: string };
  [MESSAGE_TYPES.PROMPT_TOKENS]: { tokens: string[] };
  [MESSAGE_TYPES.PROMPT_PROCESSING_RESULT]: PromptProcessingResult;
};

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];
export type SourceType = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];

export interface ProtocolMessage<T extends MessageType = MessageType> {
  type: T;
  payload: PayloadMap[T];
}

export type WithPlatformType<T> = T & { platformType: PlatformType };
export type WithRequestId<T> = T & { requestId: string };
export type WithSource<T> = T & { source: SourceType };

export type PromptAllowed = {
  result: "allowed";
  content: string;
};

export type PromptRejected = {
  result: "rejected";
  tokens: string[];
};

export type PromptProcessingResult = PromptAllowed | PromptRejected;
