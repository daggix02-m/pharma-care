import * as React from "react";
import {
  Megaphone,
  Users,
  Shield,
  Building2,
  CheckCircle2,
} from "lucide-react";

export type TargetAudience =
  | "all_users"
  | "all_owners"
  | "specific_plan"
  | "specific_pharmacy";

export type MessageType =
  | "announcement"
  | "newsletter"
  | "compliance_alert"
  | "subscription_reminder"
  | "security_notice";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface PharmacyOption {
  _id: string;
  name: string;
}

export const TARGET_OPTIONS: {
  value: TargetAudience;
  icon: React.ElementType;
  label: string;
  description: string;
}[] = [
  {
    value: "all_users",
    icon: Users,
    label: "All Users",
    description: "Send to every user in the platform",
  },
  {
    value: "all_owners",
    icon: Shield,
    label: "All Pharmacy Owners",
    description: "Send to all pharmacy owners only",
  },
  {
    value: "specific_plan",
    icon: CheckCircle2,
    label: "Specific Subscription Plan",
    description: "Target users on a specific plan",
  },
  {
    value: "specific_pharmacy",
    icon: Building2,
    label: "Specific Pharmacy",
    description: "Target a specific pharmacy",
  },
];

export const MESSAGE_TYPES: {
  value: MessageType;
  icon: React.ElementType;
  label: string;
  color: string;
}[] = [
  {
    value: "announcement",
    icon: Megaphone,
    label: "Announcement",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    value: "newsletter",
    icon: Megaphone,
    label: "Newsletter",
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  {
    value: "compliance_alert",
    icon: Megaphone,
    label: "Compliance Alert",
    color: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  {
    value: "subscription_reminder",
    icon: Megaphone,
    label: "Subscription Reminder",
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
  {
    value: "security_notice",
    icon: Megaphone,
    label: "Security Notice",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
];
