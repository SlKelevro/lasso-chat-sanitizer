import { ChatgptHook, ChatgptPromptHandler } from "./chatgpt";
import type { PlatformPromptHandler, PlatformType } from "@/lib/platforms/common/types.ts";

export function hooks() {
  return [new ChatgptHook()];
}

export function promptHandlers() {
  return [new ChatgptPromptHandler()];
}

export function platformPromptHandler(platform: PlatformType): PlatformPromptHandler | null {
  const handlers = promptHandlers();
  const filtered = handlers.filter((handler) => handler.platformName() === platform);

  return filtered[0] ?? null;
}
