"use client";

import { Mail, Phone, Calendar, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StaffMember } from "./types";

interface StaffCardProps {
  staff: StaffMember;
  className?: string;
}

export function StaffCard({ staff }: StaffCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={staff.avatarUrl} alt={staff.name} />
            <AvatarFallback>
              {staff.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h6 className="font-semibold truncate">{staff.name}</h6>
                <Badge variant="outline" className="mt-1">
                  {staff.role}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="truncate">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Joined {staff.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
