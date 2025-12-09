import browser from "webextension-polyfill";
import type { Runtime } from "webextension-polyfill";
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
import type { PromptProcessingResult } from "@/lib/messaging/types.ts";
import { platformPromptProcessor } from "@/lib/platforms";

const issueStorage = new IssueStorage();

function refreshIssueStorage() {
  issueStorage.load().then(() => console.log("Issue storage refreshed"));
}

refreshIssueStorage();

setInterval(refreshIssueStorage, 5000);

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }

  if (changes.issues) {
    refreshIssueStorage();
  }
});

browser.runtime.onMessage.addListener((message: unknown, sender: Runtime.MessageSender) => {
  console.log("Received message:", message);
  if (!isProtocolMessage(message, MESSAGE_TYPES.PROCESS_PROMPT)) {
    return true;
  }

  if (!sender.tab?.id) {
    return true;
  }

  if (isPlatformMessage(message) && hasSource(message) && hasRequestId(message)) {
    const content = message.payload.content;

    browser.storage.local.set({ [message.platformType]: { lastRequest: content } });

    let responsePayload: PromptProcessingResult = { result: "allowed", content };
    const handler = platformPromptProcessor(message.platformType);
    if (handler) {
      const foundTokens = handler.findSanitizableTokens(content);
      const tokenStatuses = issueStorage.findTokenStatuses(foundTokens);
      const tokensToReject = [...tokenStatuses.registered, ...tokenStatuses.unknown];

      if (tokenStatuses.unknown.length) {
        issueStorage.addIssues(tokenStatuses.unknown);
        issueStorage.save().then(() => console.log("Issue storage updated"));
      }

      if (tokensToReject.length > 0) {
        const rejectedTokensMessage = withSource(
          withRequestId(buildMessage(MESSAGE_TYPES.TOKENS_REJECTED, { tokens: tokensToReject })),
          SOURCE_TYPES.WORKER,
        );

        browser.tabs.sendMessage(sender.tab.id, rejectedTokensMessage);

        responsePayload = { result: "rejected", tokens: tokensToReject };
      } else {
        responsePayload = { result: "allowed", content: handler.updatePrompt(content, tokenStatuses.dismissed) };
      }
    }

    const responseMessage = withSource(
      withRequestId(buildMessage(MESSAGE_TYPES.PROMPT_PROCESSING_RESULT, responsePayload), message.requestId),
      SOURCE_TYPES.WORKER,
    );

    return Promise.resolve(responseMessage);
  }

  return true;
});
