import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useModal } from "@/content/context/ModalContext.tsx";
import CurrentIssues from "@/components/app/CurrentIssues.tsx";
import IssueHistory from "@/components/app/IssueHistory.tsx";

const CURRENT_ISSUES = "current-issues";
const ISSUE_HISTORY = "issue-history";

function App() {
  const modalContext = useModal();

  return (
    <>
      <Dialog open={modalContext.isOpen} onOpenChange={modalContext.toggle}>
        <DialogContent className="max-w-2xl sm:max-w-2xl">
          <DialogTitle>Sensitive data review</DialogTitle>
          <DialogDescription asChild={true}>
            <Tabs defaultValue={CURRENT_ISSUES}>
              <TabsList>
                <TabsTrigger value={CURRENT_ISSUES}>Issues found</TabsTrigger>
                <TabsTrigger value={ISSUE_HISTORY}>History</TabsTrigger>
              </TabsList>
              <div className="h-[250px]">
                <TabsContent value={CURRENT_ISSUES} className="h-full">
                  <CurrentIssues />
                </TabsContent>
                <TabsContent value={ISSUE_HISTORY} className="h-full">
                  <IssueHistory />
                </TabsContent>
              </div>
            </Tabs>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
