import type { Id } from "@convex/_generated/dataModel";

export type PlanRecord = {
  _id: Id<"subscription_plans">;
  name: string;
  code: string;
  price: number;
  currency?: string;
  maxBranches: number;
  maxUsers: number;
  description?: string;
  features: string[];
  isActive: boolean;
};

export interface PlanDraft {
  name: string;
  code: string;
  price: string;
  currency: string;
  maxBranches: string;
  maxUsers: string;
  description: string;
  features: string[];
  isActive: boolean;
}

export type TemplateRecord = {
  _id: Id<"subscription_plan_templates">;
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: string[];
  maxBranches: number;
  maxUsers: number;
  isActiveDefault: boolean;
  isBuiltIn: boolean;
};

export interface TemplateDraft {
  name: string;
  description: string;
  price: string;
  currency: string;
  maxBranches: string;
  maxUsers: string;
  features: string[];
  isActiveDefault: boolean;
}

export const DEFAULT_CODES = new Set(["basic", "premium", "enterprise"]);

export const EMPTY_PLAN_DRAFT: PlanDraft = {
  name: "",
  code: "",
  price: "0",
  currency: "ETB",
  maxBranches: "1",
  maxUsers: "1",
  description: "",
  features: [],
  isActive: true,
};

export const EMPTY_TEMPLATE_DRAFT: TemplateDraft = {
  name: "",
  description: "",
  price: "0",
  currency: "ETB",
  maxBranches: "1",
  maxUsers: "1",
  features: [],
  isActiveDefault: true,
};

export const CODE_PATTERN = /^[a-z0-9-]+$/;
