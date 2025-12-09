import type { PLATFORMS } from "@/lib/platforms/common/constants.ts";

export interface PlatformHook {
  platformName(): PlatformType;
  supports(location: Location): boolean;
  install(): void;
}

export interface PlatformPromptProcessor {
  platformName(): PlatformType;
  parsePrompt(requestBody: string): string;
  findSanitizableTokens(requestBody: string): string[];
  updatePrompt(requestBody: string, tokens: string[]): string;
  restoreLastPrompt(doc: Document, sanitizeTokens: string[], submit?: boolean): Promise<void>;
}

export type PlatformType = (typeof PLATFORMS)[keyof typeof PLATFORMS];

export type StoredPlatformData = {
  lastRequest: string;
};
