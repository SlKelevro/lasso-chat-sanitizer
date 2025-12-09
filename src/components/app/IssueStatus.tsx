import { Badge } from "@/components/ui/badge.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { dateString } from "@/lib/utils.ts";

function IssueStatus({ dismissedUntil }: { dismissedUntil: number | null }) {
  if (!dismissedUntil) {
    return (
      <Badge variant="secondary" className="bg-red-500 text-white">
        Active
      </Badge>
    );
  }

  return (
    <SimpleTooltip content={`Until ${dateString(dismissedUntil)}`}>
      <Badge variant="secondary" className="bg-green-600 text-white">
        Ignored
      </Badge>
    </SimpleTooltip>
  );
}

export default IssueStatus;
