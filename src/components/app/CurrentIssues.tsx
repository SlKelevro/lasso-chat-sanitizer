import { useEffect, useMemo, useState } from "react";
import { detectPlatform, platformPromptProcessor } from "@/lib/platforms";
import { IssueStorage } from "@/lib/issues/issue.storage.ts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { useModal } from "@/content/context/ModalContext.tsx";
import { useIssues } from "@/content/context/IssueContext.tsx";
import DismissIssueAction from "./DismissIssueAction.tsx";

function findPromptProcessor() {
  return platformPromptProcessor(detectPlatform(window.location));
}

function CurrentIssues() {
  const modalContext = useModal();
  const { issues: allIssues, refreshIssues } = useIssues();
  const [dismissEnabled, setDismissEnabled] = useState(false);

  const issues = useMemo(() => {
    return allIssues.filter((issue) => modalContext.currentIssues.includes(issue.token));
  }, [modalContext.currentIssues, allIssues]);

  useEffect(() => {
    refreshIssues().then(() => {
      setDismissEnabled(true);
    });
  }, [refreshIssues]);

  const restorePrompt = () => {
    modalContext.hide();

    findPromptProcessor()?.restoreLastPrompt(window.document, []);
  };

  const sanitizeAndContinue = () => {
    modalContext.hide();

    const tokensToSanitize = issues
      .filter((issue) => !IssueStorage.isStillDismissed(issue))
      .map((issue) => issue.token);

    findPromptProcessor()?.restoreLastPrompt(window.document, tokensToSanitize, true);
  };

  return (
    <div className="w-full">
      <div className="max-h-[200px] overflow-y-scroll shadow-inner p-1">
        <Table>
          <TableCaption>Sensitive data issues in your last prompt.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue, index) => (
              <TableRow key={index}>
                <TableCell>{issue.token}</TableCell>
                <TableCell>
                  <DismissIssueAction issue={issue} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="w-full mt-5 flex space-x-4">
        <Button variant="default" className="bg-green-600" disabled={!dismissEnabled} onClick={sanitizeAndContinue}>
          Anonymize & continue
        </Button>
        <Button variant="default" className="bg-gray-500" onClick={restorePrompt}>
          Edit prompt
        </Button>
      </div>
    </div>
  );
}

export default CurrentIssues;
