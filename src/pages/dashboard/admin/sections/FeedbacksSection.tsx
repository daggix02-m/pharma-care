import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import { Search, Loader2, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { FeedbackMessageCard } from "./FeedbackMessageCard";
import { FeedbackMessageDetailDialog } from "./FeedbackMessageDetailDialog";
import { FeedbackConfirmDialog } from "./FeedbackConfirmDialog";

type ConfirmState =
  | { type: "move"; id: Id<"contact_messages"> }
  | { type: "delete"; id: Id<"contact_messages_trash"> }
  | { type: "empty" };

export function FeedbacksSection() {
  const { sessionToken } = useAuth();
  const sessionTokenArg = sessionToken || undefined;
  const [activeTab, setActiveTab] = useState<"inbox" | "trash">("inbox");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const messages = useQuery(
    api.admin.feedbacks.getMessages,
    sessionTokenArg && activeTab === "inbox"
      ? { sessionToken: sessionTokenArg, status: statusFilter, searchQuery }
      : "skip",
  );
  const trashedMessages = useQuery(
    api.admin.feedbacks.getTrashedMessages,
    sessionTokenArg && activeTab === "trash"
      ? { sessionToken: sessionTokenArg }
      : "skip",
  );
  const unreadCount = useQuery(
    api.admin.feedbacks.getUnreadCount,
    sessionTokenArg ? { sessionToken: sessionTokenArg } : "skip",
  );
  const markAsRead = useMutation(api.admin.feedbacks.markAsRead);
  const replyToMessage = useMutation(api.admin.feedbacks.replyToMessage);
  const moveToTrash = useMutation(api.admin.feedbacks.moveToTrash);
  const restoreFromTrash = useMutation(api.admin.feedbacks.restoreFromTrash);
  const permanentDelete = useMutation(api.admin.feedbacks.permanentDelete);
  const emptyTrash = useMutation(api.admin.feedbacks.emptyTrash);

  const handleReply = async (replyText: string) => {
    if (!selectedMessage) return;
    setIsReplying(true);
    try {
      await replyToMessage({
        messageId: selectedMessage._id,
        reply: replyText,
        sessionToken: sessionTokenArg,
      });
      toast.success("Reply sent successfully");
      setSelectedMessage(null);
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (messageId: Id<"contact_messages">) => {
    try {
      await moveToTrash({ messageId, sessionToken: sessionTokenArg });
      toast.success("Message moved to trash");
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleRestore = async (trashId: Id<"contact_messages_trash">) => {
    try {
      await restoreFromTrash({ trashId, sessionToken: sessionTokenArg });
      toast.success("Message restored");
    } catch {
      toast.error("Failed to restore message");
    }
  };

  const handlePermanentDelete = async (
    trashId: Id<"contact_messages_trash">,
  ) => {
    try {
      await permanentDelete({ trashId, sessionToken: sessionTokenArg });
      toast.success("Message permanently deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const result = await emptyTrash({ sessionToken: sessionTokenArg });
      toast.success(`Trash emptied. ${result.deletedCount} messages deleted.`);
    } catch {
      toast.error("Failed to empty trash");
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    const action = confirmState;
    setConfirmState(null);
    if (action.type === "move") {
      await handleDelete(action.id);
    } else if (action.type === "delete") {
      await handlePermanentDelete(action.id);
    } else {
      await handleEmptyTrash();
    }
  };

  const displayMessages =
    activeTab === "inbox" ? messages?.messages : trashedMessages?.messages;
  const isLoading =
    activeTab === "inbox"
      ? messages === undefined
      : trashedMessages === undefined;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Contact Messages
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage messages from the contact form
            {unreadCount ? (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {unreadCount} unread
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={activeTab === "inbox" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("inbox")}
            className="rounded-lg"
          >
            Inbox
          </Button>
          <Button
            variant={activeTab === "trash" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("trash")}
            className="rounded-lg"
          >
            Trash
          </Button>
        </div>
      </div>

      {activeTab === "inbox" && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "unread", "read", "replied"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "secondary"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize rounded-lg text-[12px] font-semibold"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "trash" &&
        displayMessages &&
        displayMessages.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmState({ type: "empty" })}
              className="rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Empty Trash
            </Button>
          </div>
        )}

      <div className="space-y-3">
        {!displayMessages || displayMessages.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {activeTab === "inbox" ? "No messages" : "Trash is empty"}
            </p>
          </div>
        ) : (
          displayMessages.map((message: any) => (
            <FeedbackMessageCard
              key={message._id}
              message={message}
              activeTab={activeTab}
              onSelect={(msg) => {
                setSelectedMessage(msg);
                if (msg.status === "unread" && activeTab === "inbox") {
                  markAsRead({
                    messageId: msg._id,
                    sessionToken: sessionTokenArg,
                  });
                }
              }}
              onConfirm={setConfirmState}
              onRestore={handleRestore}
            />
          ))
        )}
      </div>

      {selectedMessage && (
        <FeedbackMessageDetailDialog
          message={selectedMessage}
          activeTab={activeTab}
          isReplying={isReplying}
          onReply={handleReply}
          onClose={() => setSelectedMessage(null)}
        />
      )}

      <FeedbackConfirmDialog
        confirmState={confirmState}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
