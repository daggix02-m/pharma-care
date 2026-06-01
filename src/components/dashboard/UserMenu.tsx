import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, ChevronRight } from "lucide-react";

interface UserMenuProps {
  userRole: string | null;
  userEmail?: string | null;
  onLogout: () => void;
}

export const UserMenu = React.memo(function UserMenu({
  userRole,
  userEmail,
  onLogout,
}: UserMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 px-3 flex items-center gap-2 border border-border hover:bg-muted/50 transition-colors"
        >
          <div className="w-7 h-7 bg-foreground flex items-center justify-center text-background font-bold text-xs uppercase">
            {userRole?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-[11px] font-semibold leading-none uppercase tracking-wide">
              {userRole}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2 border-border">
        <DropdownMenuLabel className="font-normal py-3">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-semibold leading-none uppercase tracking-wide text-foreground">
              {userRole}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate(`/${userRole}?tab=settings`)}
          className="cursor-pointer py-2.5"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive cursor-pointer py-2.5"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
