import type { ProtocolMessage, WithRequestId, WithSource } from "@/lib/messaging/types.ts";

type CommonMessage = WithSource<WithRequestId<ProtocolMessage>>;

function isCommonMessage(value: unknown): value is CommonMessage {
  if (typeof value !== "object" || !value) {
    return false;
  }

  const object = value as { [key: string]: string | object };
  const mapping = {
    source: "string",
    requestId: "string",
    type: "string",
    payload: "object",
  };

  return Object.entries(mapping).filter(([field, type]) => object[field] && typeof object[field] !== type).length === 0;
}

function isProcessPromptMessage(
  value: CommonMessage,
): value is WithSource<WithRequestId<ProtocolMessage<"process-prompt">>> {
  return value.type === "process-prompt";
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

    if (data.source !== "lasso-request-handler") {
      return;
    }

    const { requestId, ...message } = data;

    console.log("Received message in hook-loader", requestId, message);

    if (isProcessPromptMessage(data)) {
      const newMessage: CommonMessage = { ...data, source: "lasso-ext-hook-loader" };

      browser.runtime.sendMessage(newMessage).then((response) => {
        console.log("Response from worker:", response);

        if (!isCommonMessage(response)) {
          return;
        }

        if (response.source !== "lasso-ext-worker" || response.requestId !== requestId) {
          return;
        }

        const responseMessage: CommonMessage = {
          requestId,
          source: "lasso-extension",
          type: response.type,
          payload: response.payload,
        };

        console.log("Responding to process-prompt with msg:", responseMessage);

        window.postMessage(responseMessage, window.location.origin);
      });
    }
  });
})();
