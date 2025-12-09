import type { PlatformPromptProcessor, PlatformType, StoredPlatformData } from "../common/types.ts";
import { EMAIL_PATTERN, PLATFORMS, SANITIZED_TOKEN } from "../common/constants.ts";
import type { ChatgptRequestBody } from "./types.ts";

export class ChatgptPromptProcessor implements PlatformPromptProcessor {
  platformName(): PlatformType {
    return PLATFORMS.CHATGPT;
  }

  parsePrompt(requestBody: string): string {
    const requestData = this.toRequestData(requestBody);
    if (!this.isValidBody(requestData)) {
      return "";
    }

    return requestData.messages.map((message) => message.content.parts.join(" ")).join(" ");
  }

  findSanitizableTokens(requestBody: string): string[] {
    if (!this.isValidBody(this.toRequestData(requestBody))) {
      return [];
    }

    const text = this.parsePrompt(requestBody);
    const matches = (text.match(EMAIL_PATTERN) || []).map((value) => value.toLowerCase());
    const uniqueTokens = new Set<string>(matches);

    return Array.from(uniqueTokens);
  }

  updatePrompt(requestBody: string, tokens: string[]): string {
    const requestData = this.toRequestData(requestBody);

    if (!this.isValidBody(requestData)) {
      return requestBody;
    }

    let hasUpdates = false;

    requestData.messages.forEach((message) => {
      if (message.content.parts.length > 0) {
        message.content.parts = message.content.parts.map((part) => {
          let sanitizedPart = part;

          for (const token of tokens) {
            sanitizedPart = sanitizedPart.replaceAll(token, SANITIZED_TOKEN);
          }

          if (sanitizedPart !== part) {
            hasUpdates = true;
          }

          return sanitizedPart;
        });
      }
    });

    return hasUpdates ? JSON.stringify(requestData) : requestBody;
  }

  async restoreLastPrompt(doc: Document, submit: boolean = false): Promise<void> {
    const data = (await browser.storage.local.get(this.platformName())) as Record<string, StoredPlatformData>;
    if (!data[this.platformName()]) {
      return;
    }

    const text = this.parsePrompt(data[this.platformName()].lastRequest);

    const textarea = doc.querySelector("#prompt-textarea");
    if (!textarea) {
      return;
    }

    textarea.textContent = text;

    if (submit) {
      // wait until Chat updates its UI
      await new Promise((resolve) => setTimeout(resolve, 200));

      const button = document.querySelector("#composer-submit-button") as HTMLButtonElement;
      button?.click();
    }
  }

  private isValidBody(value: Record<string, unknown>): value is ChatgptRequestBody {
    if (!(typeof value === "object" && Array.isArray(value.messages) && value.messages.length > 0)) {
      return false;
    }

    return value.messages.filter((msg) => !Array.isArray(msg?.content?.parts ?? false)).length === 0;
  }

  private toRequestData(content: string | Record<string, unknown>): Record<string, unknown> {
    return typeof content === "string" ? JSON.parse(content) : content;
  }
}
