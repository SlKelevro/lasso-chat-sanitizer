import browser from "webextension-polyfill";
import {
  buildMessage,
  hasRequestId,
  hasSource,
  isPlatformMessage,
  isProtocolMessage,
  withRequestId,
  withSource,
} from "@/lib/messaging/helpers.ts";
import { MESSAGE_TYPES, SOURCE_TYPES } from "@/lib/messaging/constants.ts";
import type { PayloadMap, PromptAllowed, PromptRejected } from "@/lib/messaging/types.ts";
import type { ChatgptRequestBody } from "@/lib/platforms/chatgpt/types.ts";

browser.runtime.onMessage.addListener((message: unknown) => {
  console.log("Received message:", message);
  if (!isProtocolMessage(message)) {
    return true;
  }

  if (isPlatformMessage(message) && hasSource(message) && hasRequestId(message)) {
    if (message.type === MESSAGE_TYPES.PROCESS_PROMPT) {
      const content = (message.payload as PayloadMap["process-prompt"]).content;

      const responsePayload = Math.random() * 100 > 80 ? promptAllowed(content) : promptRejected();

      const responseMessage = withSource(
        withRequestId(buildMessage(MESSAGE_TYPES.PROMPT_PROCESSING_RESULT, responsePayload), message.requestId),
        SOURCE_TYPES.WORKER,
      );

      return Promise.resolve(responseMessage);
    }
  }

  return true;
});

function promptAllowed(content: string): PromptAllowed {
  const decoded = JSON.parse(content) as ChatgptRequestBody;

  for (const msg of decoded.messages ?? []) {
    if (Array.isArray(msg.content?.parts) && msg.content.parts.length > 0) {
      msg.content.parts = ["Tell me current time pls"];
      break;
    }
  }

  return {
    result: "allowed",
    content: JSON.stringify(decoded),
  };
}

function promptRejected(): PromptRejected {
  return {
    result: "rejected",
    tokens: ["some@email.com"],
  };
}
