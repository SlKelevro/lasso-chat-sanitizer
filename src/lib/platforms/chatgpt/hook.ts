import { buildMessage, notifyExtension, withPlatformType, withSource } from "@/lib/messaging/helpers.ts";
import { MESSAGE_TYPES, SOURCE_TYPES } from "@/lib/messaging/constants.ts";
import type { PromptProcessingResult } from "@/lib/messaging/types.ts";
import { PLATFORMS } from "../common/constants.ts";
import type { PlatformHook, PlatformType } from "../common/types.ts";

const KNOWN_DOMAINS = ["chat.openai.com", "chatgpt.com"];
const KNOWN_ENDPOINTS = ["/backend-api/conversation", "/backend-api/f/conversation"];

function toUrl(input: string | Request | URL): URL {
  if (input instanceof URL) {
    return input;
  }

  if (typeof input === "string") {
    return new URL(input);
  }

  return new URL(input.url);
}

export class ChatgptHook implements PlatformHook {
  platformName(): PlatformType {
    return PLATFORMS.CHATGPT;
  }

  supports(location: Location): boolean {
    return KNOWN_DOMAINS.some((host) => host === location.host);
  }

  install(): void {
    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const [input, init] = args;
      const method = init?.method?.toUpperCase() ?? "GET";

      if (!init || !init.body || method !== "POST") {
        return originalFetch(...args);
      }

      try {
        const url = toUrl(input);

        if (this.shouldProcess(url)) {
          console.log("pre-processing fetch() request:", input, method, init);

          const content: string = typeof init.body === "string" ? init.body : init.body.toString();

          const message = withSource(
            withPlatformType(buildMessage(MESSAGE_TYPES.PROCESS_PROMPT, { content }), this.platformName()),
            SOURCE_TYPES.REQUEST_HANDLER,
          );

          const result = await notifyExtension<PromptProcessingResult>(message);
          console.log("notifyExtension() result in fetch() hook:", result);

          if (result.result === "allowed") {
            init.body = result.content;
          } else if (result.result === "rejected") {
            return Promise.resolve(this.sensitiveDataResponse());
          }
        }
      } catch (error) {
        // do not break fetch
        console.error(error);
      }

      return originalFetch(input, init);
    };

    console.log("window.fetch after replacement", window.fetch);
  }

  private shouldProcess(url: URL): boolean {
    console.log("shouldProcess():", url.host, url.pathname, url.href);

    if (!KNOWN_DOMAINS.some((host) => host === url.host)) {
      return false;
    }

    return KNOWN_ENDPOINTS.some((suffix) => url.pathname.endsWith(suffix));
  }

  private sensitiveDataResponse() {
    return new Response(JSON.stringify({ error: "Sensitive information found!" }), {
      status: 400,
      statusText: "Bad Request",
      headers: { "Content-Type": "application/json" },
    });
  }
}
