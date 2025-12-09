import { CircleCheck } from "lucide-react";
import type { Issue } from "@/lib/issues/issue.storage.ts";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { useIssues } from "@/content/context/IssueContext.tsx";
import DismissedBadge from "./DismissedBadge.tsx";

function DismissIssueAction({ issue }: { issue: Issue }) {
  const { dismiss } = useIssues();

  const dismissToken = (token: string) => {
    dismiss([token]);
  };

  if (issue.dismissedUntil) {
    return <DismissedBadge dismissedUntil={issue.dismissedUntil} />;
  }

  return (
    <SimpleTooltip content="Dismiss for 24h">
      <a className="inline-block cursor-pointer" onClick={() => dismissToken(issue.token)}>
        <CircleCheck />
      </a>
    </SimpleTooltip>
  );
}

export default DismissIssueAction;
