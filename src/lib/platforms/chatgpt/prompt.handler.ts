import type { PlatformPromptHandler, PlatformType } from "../common/types.ts";
import { EMAIL_PATTERN, PLATFORMS, SANITIZED_TOKEN } from "../common/constants.ts";
import type { ChatgptRequestBody } from "./types.ts";

export class ChatgptPromptHandler implements PlatformPromptHandler<ChatgptRequestBody> {
  platformName(): PlatformType {
    return PLATFORMS.CHATGPT;
  }

  findSanitizableTokens(content: string | ChatgptRequestBody): string[] {
    const request: ChatgptRequestBody = this.toRequestBody(content);
    if (!Array.isArray(request.messages)) {
      return [];
    }

    const text = request.messages
      .map((message) => {
        return (message.content?.parts ?? []).join(" ");
      })
      .join(" ");

    const matches = (text.match(EMAIL_PATTERN) || []).map((value) => value.toLowerCase());
    const uniqueTokens = new Set<string>(matches);

    return Array.from(uniqueTokens);
  }

  updateContent(content: string | ChatgptRequestBody, tokens: string[]): string {
    const request: ChatgptRequestBody = this.toRequestBody(content);

    if (!Array.isArray(request.messages)) {
      return this.contentToString(content);
    }

    let hasUpdates = false;

    request.messages?.forEach((message) => {
      if (Array.isArray(message?.content?.parts) && (message.content.parts.length ?? 0 > 0)) {
        message.content.parts = message.content.parts.map((part) => {
          let sanitizedPart = part;

          for (const token in tokens) {
            sanitizedPart = part.replaceAll(token, SANITIZED_TOKEN);
          }

          if (sanitizedPart !== part) {
            hasUpdates = true;
          }

          return sanitizedPart;
        });
      }
    });

    return hasUpdates ? JSON.stringify(request) : this.contentToString(content);
  }

  private toRequestBody(content: string | ChatgptRequestBody) {
    return typeof content === "string" ? JSON.parse(content) : content;
  }

  private contentToString(content: string | ChatgptRequestBody): string {
    return typeof content === "string" ? content : JSON.stringify(content);
  }
}
