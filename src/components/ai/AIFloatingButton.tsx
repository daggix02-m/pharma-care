import * as React from "react";
import { MessageSquare } from "lucide-react";
import gsap from "gsap";

interface AIFloatingButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export function AIFloatingButton({
  onClick,
  unreadCount = 0,
}: AIFloatingButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" },
      );
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-all hover:scale-110 flex items-center justify-center group"
    >
      <div className="relative">
        <MessageSquare className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}
