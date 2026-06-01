import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { type MessageType, MESSAGE_TYPES } from "./broadcastTypes";

interface BroadcastStepMessageTypeProps {
  messageType: MessageType;
  onMessageTypeChange: (type: MessageType) => void;
  isAnimating: boolean;
}

export function BroadcastStepMessageType({
  messageType,
  onMessageTypeChange,
  isAnimating,
}: BroadcastStepMessageTypeProps) {
  return (
    <div
      className={cn(
        "space-y-6",
        "transition-all duration-700 delay-300 ease-out",
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: isAnimating ? "300ms" : "0ms" }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h3 className="font-display text-xl font-semibold text-slate-800">
            What type of message is this?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MESSAGE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onMessageTypeChange(type.value)}
              className={cn(
                "relative p-3 rounded-xl border-2 transition-all duration-300 group",
                "bg-white/80 backdrop-blur-sm hover:bg-white/95",
                messageType === type.value
                  ? "border-emerald-500 shadow-md"
                  : "border-slate-200",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                    messageType === type.value
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                      : type.color,
                  )}
                >
                  <type.icon className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm text-slate-800">
                  {type.label}
                </span>
              </div>
              {messageType === type.value && (
                <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
