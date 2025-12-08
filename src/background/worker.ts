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
import { IssueStorage } from "@/lib/issues/issue.storage.ts";
import { MESSAGE_TYPES, SOURCE_TYPES } from "@/lib/messaging/constants.ts";
import type { PayloadMap, PromptProcessingResult } from "@/lib/messaging/types.ts";
import { platformPromptHandler } from "@/lib/platforms";

const issueStorage = new IssueStorage();

function refreshIssueStorage() {
  issueStorage.load().then(() => console.log("Issue storage refreshed"));
}

refreshIssueStorage();

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }

  if (changes.issues) {
    refreshIssueStorage();
  }
});

browser.runtime.onMessage.addListener((message: unknown) => {
  console.log("Received message:", message);
  if (!isProtocolMessage(message)) {
    return true;
  }

  if (isPlatformMessage(message) && hasSource(message) && hasRequestId(message)) {
    if (message.type === MESSAGE_TYPES.PROCESS_PROMPT) {
      const content = (message.payload as PayloadMap["process-prompt"]).content;

      browser.storage.local.set({ [message.platformType]: { lastRequest: content } });

      let responsePayload: PromptProcessingResult = { result: "allowed", content };
      const handler = platformPromptHandler(message.platformType);
      if (handler) {
        const foundTokens = handler.findSanitizableTokens(content);
        const tokenStatuses = issueStorage.findTokenStatuses(foundTokens);
        const tokensToReject = [...tokenStatuses.registered, ...tokenStatuses.unknown];

        if (tokenStatuses.unknown.length) {
          issueStorage.addIssues(tokenStatuses.unknown);
        }

        const rejectedTokensMessage = withSource(
          withRequestId(buildMessage(MESSAGE_TYPES.TOKENS_REJECTED, { tokens: tokensToReject })),
          SOURCE_TYPES.WORKER,
        );

        browser.runtime.sendMessage(rejectedTokensMessage);

        if (tokensToReject.length > 0) {
          responsePayload = { result: "rejected", tokens: tokensToReject };
        } else {
          responsePayload = { result: "allowed", content: handler.updateContent(content, tokenStatuses.dismissed) };
        }
      }

      const responseMessage = withSource(
        withRequestId(buildMessage(MESSAGE_TYPES.PROMPT_PROCESSING_RESULT, responsePayload), message.requestId),
        SOURCE_TYPES.WORKER,
      );

      return Promise.resolve(responseMessage);
    }
  }

  return true;
});
