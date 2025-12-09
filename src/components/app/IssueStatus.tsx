import { Badge } from "@/components/ui/badge.tsx";
import DismissedBadge from "./DismissedBadge.tsx";

function IssueStatus({ dismissedUntil }: { dismissedUntil: number | null }) {
  if (!dismissedUntil) {
    return (
      <Badge variant="secondary" className="bg-red-500 text-white">
        Active
      </Badge>
    );
  }

  return <DismissedBadge dismissedUntil={dismissedUntil} />;
}

export default IssueStatus;
