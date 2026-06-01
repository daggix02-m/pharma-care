import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MessagingSectionProps {
  messages: any[] | undefined;
  onSendMessage: () => void;
}

export function MessagingSection({
  messages,
  onSendMessage,
}: MessagingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message: any) => (
              <div
                key={message._id}
                className="border border-border/40 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">
                    {message.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {message.message}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">
                    To: {message.targetType || "All Managers"}
                  </Badge>
                  {message.isUrgent && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                  <Badge variant="secondary">
                    Delivered:{" "}
                    {message.deliveryStatus?.filter((s: any) => s.delivered)
                      .length || 0}
                    /{message.deliveryStatus?.length || 0}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No messages sent yet</p>
            <Button variant="outline" className="mt-4" onClick={onSendMessage}>
              Send Your First Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
