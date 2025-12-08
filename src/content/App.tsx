import { useState } from "react";
// import "./App.css";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";

const CURRENT_ISSUES = "current-issues";
const ISSUE_HISTORY = "issue-history";

function App({ portalRoot }: { portalRoot: HTMLElement }) {
  const [isOpen, setOpen] = useState<boolean>(false);
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent container={portalRoot}>
          <DialogTitle>Sensitive data review</DialogTitle>
          <DialogDescription asChild={true}>
            <Tabs defaultValue={CURRENT_ISSUES}>
              <TabsList>
                <TabsTrigger value={CURRENT_ISSUES}>Issues found</TabsTrigger>
                <TabsTrigger value={ISSUE_HISTORY}>History</TabsTrigger>
              </TabsList>
              <TabsContent value={CURRENT_ISSUES}>currently found</TabsContent>
              <TabsContent value={ISSUE_HISTORY}>history list</TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
