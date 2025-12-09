import * as React from "react";
import { useEffect, useState } from "react";
import type { Issue } from "@/lib/issues/issue.storage.ts";
import { IssueStorage } from "@/lib/issues/issue.storage.ts";

interface Props {
  children: React.ReactNode;
}

interface IssueContextValue {
  issues: Issue[];
  refreshIssues: () => Promise<void>;
  find: (tokens: string[]) => Issue[];
  dismiss: (tokens: string[]) => Promise<void>;
}

const IssueContext = React.createContext<IssueContextValue | null>(null);

function useIssues() {
  const context = React.useContext(IssueContext);

  if (!context) {
    throw new Error("useIssues must be used within IssueProvider");
  }

  return context;
}

const issueStorage = new IssueStorage();

function IssueProvider({ children }: Props) {
  const [issues, setIssues] = useState<Issue[]>([]);

  const contextValue: IssueContextValue = {
    issues,
    refreshIssues: async () => {
      await issueStorage.load();
      setIssues(issueStorage.getIssues());
    },
    find: (tokens: string[]) => issueStorage.find(tokens),
    dismiss: async (tokens: string[]) => {
      issueStorage.dismiss(tokens);
      await issueStorage.save();
      setIssues(issueStorage.getIssues());
    },
  };

  useEffect(() => {
    issueStorage.load().then(() => {
      setIssues(issueStorage.getIssues());
    });
  }, []);

  return <IssueContext.Provider value={contextValue}>{children}</IssueContext.Provider>;
}

export { IssueProvider, useIssues };
