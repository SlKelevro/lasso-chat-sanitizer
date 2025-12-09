import { useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { SimpleTooltip } from "@/components/ui/tooltip.tsx";
import { dateString } from "@/lib/utils.ts";
import { useIssues } from "@/content/context/IssueContext.tsx";
import IssueStatus from "./IssueStatus.tsx";
import DismissIssueAction from "./DismissIssueAction.tsx";

function IssueHistory() {
  const { issues } = useIssues();

  const reversedIssues = useMemo(() => {
    return issues.slice().reverse();
  }, [issues]);

  return (
    <div className="h-full overflow-y-scroll shadow-inner p-1">
      <Table>
        <TableCaption>History of sensitive data issues.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reversedIssues.map((issue, index) => (
            <TableRow key={index}>
              <TableCell>
                <SimpleTooltip content={`Added ${dateString(issue.createdAt)}`}>
                  <span className="inline-block">{issue.token}</span>
                </SimpleTooltip>
              </TableCell>
              <TableCell>
                <IssueStatus dismissedUntil={issue.dismissedUntil} />
              </TableCell>
              <TableCell>
                <DismissIssueAction issue={issue} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default IssueHistory;
