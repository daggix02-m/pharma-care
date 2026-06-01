import type { Id } from "@convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmState =
  | { type: "move"; id: Id<"contact_messages"> }
  | { type: "delete"; id: Id<"contact_messages_trash"> }
  | { type: "empty" };

interface FeedbackConfirmDialogProps {
  confirmState: ConfirmState | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function FeedbackConfirmDialog({
  confirmState,
  onOpenChange,
  onConfirm,
}: FeedbackConfirmDialogProps) {
  return (
    <AlertDialog open={confirmState !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmState?.type === "move" && "Move message to trash?"}
            {confirmState?.type === "delete" && "Permanently delete message?"}
            {confirmState?.type === "empty" && "Empty trash?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirmState?.type === "move" &&
              "You can restore this message from trash later."}
            {confirmState?.type === "delete" && "This action cannot be undone."}
            {confirmState?.type === "empty" &&
              "All trashed messages will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              confirmState?.type === "move"
                ? ""
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
            onClick={onConfirm}
          >
            {confirmState?.type === "move" ? "Move to Trash" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
