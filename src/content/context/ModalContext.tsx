import browser from "webextension-polyfill";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { hasSource, isProtocolMessage } from "@/lib/messaging/helpers.ts";
import { MESSAGE_TYPES, SOURCE_TYPES } from "@/lib/messaging/constants.ts";

interface Props {
  children: React.ReactNode;
}

interface ModalContextValue {
  isOpen: boolean;
  currentIssues: string[];
  show: () => void;
  hide: () => void;
  toggle: (state: boolean) => void;
  setIssues: (tokens: string[]) => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }

  return context;
}

function ModalBridge() {
  const { show: showModal, setIssues } = useModal();

  useEffect(() => {
    const listener = (message: unknown) => {
      console.log("ModalBridge listener got a message", message);
      if (!isProtocolMessage(message, MESSAGE_TYPES.TOKENS_REJECTED) || !hasSource(message)) {
        return;
      }

      if (message.source !== SOURCE_TYPES.WORKER) {
        return;
      }

      setIssues(message.payload.tokens);
      showModal();
    };

    console.log("ModalBridge listening");
    browser.runtime.onMessage.addListener(listener);

    return () => {
      console.log("ModalBridge unsubscribe");
      browser.runtime.onMessage.removeListener(listener);
    };
  }, [showModal, setIssues]);

  return <></>;
}

function ModalProvider({ children }: Props) {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [currentIssues, setCurrentIssues] = useState<string[]>([]);
  const contextValue: ModalContextValue = {
    isOpen,
    currentIssues,
    show: () => setOpen(true),
    hide: () => setOpen(false),
    toggle: (state) => setOpen(state),
    setIssues: (issues: string[]) => setCurrentIssues(issues),
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <ModalBridge />
      {children}
    </ModalContext.Provider>
  );
}

export { useModal, ModalProvider };
