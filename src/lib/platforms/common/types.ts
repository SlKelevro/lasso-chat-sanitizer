import type { PLATFORMS } from "@/lib/platforms/common/constants.ts";

export interface PlatformHook {
  platformName(): PlatformType;
  supports(location: Location): boolean;
  install(): void;
}

type PlatformRequestBody = Record<string, unknown>;

export interface PlatformPromptHandler<T extends PlatformRequestBody = PlatformRequestBody> {
  platformName(): PlatformType;
  findSanitizableTokens(content: string | T): string[];
  updateContent(content: string | T, tokens: string[]): string;
}

export type PlatformType = (typeof PLATFORMS)[keyof typeof PLATFORMS];
