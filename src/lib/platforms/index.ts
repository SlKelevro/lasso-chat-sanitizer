import { ChatgptHook, ChatgptPromptProcessor } from "./chatgpt";
import type { PlatformPromptProcessor, PlatformType } from "@/lib/platforms/common/types.ts";

export function hooks() {
  return [new ChatgptHook()];
}

export function detectPlatform(location: Location): PlatformType | never {
  for (const hook of hooks()) {
    if (hook.supports(location)) {
      return hook.platformName();
    }
  }

  throw new Error("Unsupported platform");
}

export function promptProcessors() {
  return [new ChatgptPromptProcessor()];
}

export function platformPromptProcessor(platform: PlatformType): PlatformPromptProcessor | null {
  return promptProcessors().find((processor) => processor.platformName() === platform) || null;
}
