import type { Id } from "@convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ConfirmState =
  | { type: "move"; id: Id<"contact_messages"> }
  | { type: "delete"; id: Id<"contact_messages_trash"> }
  | { type: "empty" };

interface FeedbackMessageCardProps {
  message: any;
  activeTab: "inbox" | "trash";
  onSelect: (message: any) => void;
  onConfirm: (state: ConfirmState) => void;
  onRestore: (id: Id<"contact_messages_trash">) => void;
}

export function FeedbackMessageCard({
  message,
  activeTab,
  onSelect,
  onConfirm,
  onRestore,
}: FeedbackMessageCardProps) {
  return (
    <Card
      className={cn(
        "minimal-card cursor-pointer transition-all hover:border-primary/30",
        message.status === "unread" &&
          "border-l-4 border-l-primary bg-primary/[0.02]",
      )}
      onClick={() => onSelect(message)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold text-primary">
            {message.firstName.charAt(0)}
            {message.lastName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">
                  {message.firstName} {message.lastName}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {message.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
                {activeTab === "inbox" ? (
                  <>
                    <Badge
                      variant={
                        message.status === "replied" ? "default" : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {message.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm({
                          type: "move",
                          id: message._id as Id<"contact_messages">,
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(message._id as Id<"contact_messages_trash">);
                      }}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm({
                          type: "delete",
                          id: message._id as Id<"contact_messages_trash">,
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {message.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
