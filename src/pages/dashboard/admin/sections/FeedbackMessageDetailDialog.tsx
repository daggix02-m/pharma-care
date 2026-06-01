import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FeedbackMessageDetailDialogProps {
  message: any;
  activeTab: "inbox" | "trash";
  isReplying: boolean;
  onReply: (replyText: string) => Promise<void>;
  onClose: () => void;
}

export function FeedbackMessageDetailDialog({
  message,
  activeTab,
  isReplying,
  onReply,
  onClose,
}: FeedbackMessageDetailDialogProps) {
  const [replyText, setReplyText] = useState("");

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await onReply(replyText);
    setReplyText("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {message.firstName} {message.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{message.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleString()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="bg-muted/30 p-4 rounded-xl">
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>

          {message.adminReply && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
              <p className="text-xs font-semibold text-primary mb-2">
                Your Reply:
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {message.adminReply}
              </p>
              {message.repliedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Sent on {new Date(message.repliedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {activeTab === "inbox" && !message.adminReply && (
            <div className="space-y-3 pt-4 border-t border-border/40">
              <label className="text-sm font-medium">Reply to Message</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full min-h-[120px] p-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                maxLength={2000}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isReplying}
                >
                  {isReplying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reply"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
