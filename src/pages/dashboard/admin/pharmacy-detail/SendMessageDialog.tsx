import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacyId: string;
  pharmacyName: string;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  pharmacyId,
  pharmacyName,
}: SendMessageDialogProps) {
  const [messageData, setMessageData] = useState({ title: "", message: "" });

  const sendBroadcast = useMutation(api.admin.mutations.sendAdminBroadcast);

  const handleSendMessage = async () => {
    if (!messageData.title.trim() || !messageData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await sendBroadcast({
        targetType: "specific_pharmacy",
        targetIds: [pharmacyId],
        messageType: "announcement",
        title: messageData.title,
        message: messageData.message,
        priority: "medium",
      });
      toast.success("Message sent successfully");
      onOpenChange(false);
      setMessageData({ title: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
            Send Message to Pharmacy
          </DialogTitle>
          <DialogDescription>
            Send a message to <strong>{pharmacyName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="message-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="message-title"
              placeholder="Message title..."
              value={messageData.title}
              onChange={(e) =>
                setMessageData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="message-content">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message-content"
              placeholder="Type your message here..."
              value={messageData.message}
              onChange={(e) =>
                setMessageData((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              rows={6}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage}>
            <Mail className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
