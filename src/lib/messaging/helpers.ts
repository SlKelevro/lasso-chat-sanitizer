import type { PlatformType } from "@/lib/platforms/common/types.ts";
import type {
  MessageType,
  PayloadMap,
  ProtocolMessage,
  SourceType,
  WithPlatformType,
  WithRequestId,
  WithSource,
} from "./types.ts";
import { SOURCE_TYPES } from "./constants.ts";

export function buildMessage<T extends MessageType>(type: T, payload: PayloadMap[T]) {
  const message: ProtocolMessage<T> = { type, payload };

  return message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && value !== undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value !== "";
}

export function isProtocolMessage(value: unknown): value is ProtocolMessage {
  return isRecord(value) && isNonEmptyString(value.type) && isRecord(value.payload);
}

export function withPlatformType<T extends ProtocolMessage = ProtocolMessage>(
  message: T,
  platformType: PlatformType,
): WithPlatformType<T> {
  return { ...message, platformType };
}

export function isPlatformMessage(
  value: ProtocolMessage & Partial<WithPlatformType<object>>,
): value is WithPlatformType<ProtocolMessage> {
  return isNonEmptyString(value.platformType);
}

export function withSource<T extends ProtocolMessage = ProtocolMessage>(message: T, source: SourceType): WithSource<T> {
  return { ...message, source };
}

export function hasSource(value: ProtocolMessage & Partial<WithSource<object>>): value is WithSource<ProtocolMessage> {
  return isNonEmptyString(value.source);
}

export function withRequestId<T extends ProtocolMessage = ProtocolMessage>(
  message: T,
  requestId?: string,
): WithRequestId<T> {
  if (requestId === undefined) {
    requestId = String(Date.now() + Math.random());
  }

  return { ...message, requestId };
}

export function hasRequestId(
  value: ProtocolMessage & Partial<WithRequestId<object>>,
): value is WithRequestId<ProtocolMessage> {
  return isNonEmptyString(value.requestId);
}

export async function notifyExtension<Response = unknown | null>(message: ProtocolMessage): Promise<Response> {
  const notification = withRequestId(message);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Lasso extension did not respond"));
    }, 5000);

    function handler(event: MessageEvent) {
      if (event.source !== window) {
        return;
      }

      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data;

      if (!isProtocolMessage(data) || !hasRequestId(data) || !hasSource(data)) {
        return;
      }

      console.log("handler() in notifyExtension()", data, event);

      if (data.source !== SOURCE_TYPES.EXTENSION) {
        return;
      }

      if (data.requestId !== notification.requestId) {
        console.warn(`Event's requestId ${data.requestId} != original ${notification.requestId}`);
        return;
      }

      cleanup();

      console.log(`Resolving notifyExtension() with: ${JSON.stringify(data.payload)}`);
      resolve(data.payload as Response);
    }

    function cleanup() {
      clearTimeout(timeout);
      window.removeEventListener("message", handler);
    }

    window.addEventListener("message", handler);

    window.postMessage(notification, window.location.origin);
  });
}
