import { useEffect, useState } from "react";
import { detectPlatform, platformPromptProcessor } from "@/lib/platforms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { useModal } from "@/content/context/ModalContext.tsx";
import { useIssues } from "@/content/context/IssueContext.tsx";

function findPromptProcessor() {
  return platformPromptProcessor(detectPlatform(window.location));
}

function CurrentIssues() {
  const modalContext = useModal();
  const { refreshIssues, dismiss } = useIssues();
  const [dismissEnabled, setDismissEnabled] = useState(false);

  useEffect(() => {
    refreshIssues().then(() => {
      setDismissEnabled(true);
    });
  }, [refreshIssues]);

  const restorePrompt = () => {
    modalContext.hide();

    findPromptProcessor()?.restoreLastPrompt(window.document);
  };

  const dismissAll = () => {
    dismiss(modalContext.currentIssues).then(() => {
      modalContext.hide();

      findPromptProcessor()?.restoreLastPrompt(window.document, true);
    });
  };

  return (
    <div className="w-full">
      <div className="max-h-[200px] overflow-y-scroll shadow-inner p-1">
        <Table>
          <TableCaption>Sensitive data issues in your last prompt.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modalContext.currentIssues.map((token, index) => (
              <TableRow key={index}>
                <TableCell>{token}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="w-full mt-5 flex space-x-4">
        <Button variant="default" className="bg-green-600" disabled={!dismissEnabled} onClick={dismissAll}>
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
