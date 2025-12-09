import { dateString } from "@/lib/utils.ts";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { Badge } from "@/components/ui/badge.tsx";

function DismissedBadge({ dismissedUntil }: { dismissedUntil: number }) {
  return (
    <SimpleTooltip content={`Until ${dateString(dismissedUntil)}`}>
      <Badge variant="secondary" className="bg-green-600 text-white">
        Ignored
      </Badge>
    </SimpleTooltip>
  );
}

export default DismissedBadge;
