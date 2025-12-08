import type { ProtocolMessage, WithRequestId, WithSource } from "@/lib/messaging/types.ts";
import { MESSAGE_TYPES, SOURCE_TYPES } from "@/lib/messaging/constants.ts";
import { hasRequestId, hasSource, isProtocolMessage } from "@/lib/messaging/helpers.ts";

type CommonMessage = WithSource<WithRequestId<ProtocolMessage>>;

function isCommonMessage(value: unknown): value is CommonMessage {
  return isProtocolMessage(value) && hasSource(value) && hasRequestId(value);
}

function isProcessPromptMessage(
  value: CommonMessage,
): value is WithSource<WithRequestId<ProtocolMessage<"process-prompt">>> {
  return value.type === MESSAGE_TYPES.PROCESS_PROMPT;
}

(async () => {
  console.log("Hook listener started");

  window.addEventListener("message", (event) => {
    if (event.source !== window) {
      return;
    }

    if (event.origin !== window.location.origin) {
      return;
    }

    if (!isCommonMessage(event.data)) {
      return;
    }

    const data: CommonMessage = event.data;

    if (data.source !== SOURCE_TYPES.REQUEST_HANDLER) {
      return;
    }

    const { requestId, ...message } = data;

    console.log("Hook listener received a message", requestId, message);

    if (isProcessPromptMessage(data)) {
      const newMessage: CommonMessage = { ...data, source: SOURCE_TYPES.HOOK_LISTENER };

      browser.runtime.sendMessage(newMessage).then((response) => {
        console.log("Response from worker:", response);

        if (!isCommonMessage(response)) {
          return;
        }

        if (response.source !== SOURCE_TYPES.WORKER || response.requestId !== requestId) {
          return;
        }

        const responseMessage: CommonMessage = {
          requestId,
          source: SOURCE_TYPES.EXTENSION,
          type: response.type,
          payload: response.payload,
        };

        console.log("Responding to process-prompt with msg:", responseMessage);

        window.postMessage(responseMessage, window.location.origin);
      });
    }
  });
})();
