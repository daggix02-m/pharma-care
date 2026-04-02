/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_feedbacks from "../admin/feedbacks.js";
import type * as admin_landingPage from "../admin/landingPage.js";
import type * as admin_mutations from "../admin/mutations.js";
import type * as admin_queries from "../admin/queries.js";
import type * as admin_siteSettings from "../admin/siteSettings.js";
import type * as admin_testimonials from "../admin/testimonials.js";
import type * as ai_mutations from "../ai/mutations.js";
import type * as ai_queries from "../ai/queries.js";
import type * as auth_mutations from "../auth/mutations.js";
import type * as auth_queries from "../auth/queries.js";
import type * as cashier_mutations from "../cashier/mutations.js";
import type * as cashier_queries from "../cashier/queries.js";
import type * as cron from "../cron.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_utils from "../lib/utils.js";
import type * as manager_mutations from "../manager/mutations.js";
import type * as manager_queries from "../manager/queries.js";
import type * as notifications_mutations from "../notifications/mutations.js";
import type * as notifications_queries from "../notifications/queries.js";
import type * as owner_mutations from "../owner/mutations.js";
import type * as owner_queries from "../owner/queries.js";
import type * as owner_testimonials from "../owner/testimonials.js";
import type * as pharmacist_mutations from "../pharmacist/mutations.js";
import type * as pharmacist_queries from "../pharmacist/queries.js";
import type * as public_contact from "../public/contact.js";
import type * as public_landingPage from "../public/landingPage.js";
import type * as seed from "../seed.js";
import type * as stockTransfers from "../stockTransfers.js";
import type * as subscription_mutations from "../subscription/mutations.js";
import type * as subscription_queries from "../subscription/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/feedbacks": typeof admin_feedbacks;
  "admin/landingPage": typeof admin_landingPage;
  "admin/mutations": typeof admin_mutations;
  "admin/queries": typeof admin_queries;
  "admin/siteSettings": typeof admin_siteSettings;
  "admin/testimonials": typeof admin_testimonials;
  "ai/mutations": typeof ai_mutations;
  "ai/queries": typeof ai_queries;
  "auth/mutations": typeof auth_mutations;
  "auth/queries": typeof auth_queries;
  "cashier/mutations": typeof cashier_mutations;
  "cashier/queries": typeof cashier_queries;
  cron: typeof cron;
  "lib/auth": typeof lib_auth;
  "lib/email": typeof lib_email;
  "lib/permissions": typeof lib_permissions;
  "lib/utils": typeof lib_utils;
  "manager/mutations": typeof manager_mutations;
  "manager/queries": typeof manager_queries;
  "notifications/mutations": typeof notifications_mutations;
  "notifications/queries": typeof notifications_queries;
  "owner/mutations": typeof owner_mutations;
  "owner/queries": typeof owner_queries;
  "owner/testimonials": typeof owner_testimonials;
  "pharmacist/mutations": typeof pharmacist_mutations;
  "pharmacist/queries": typeof pharmacist_queries;
  "public/contact": typeof public_contact;
  "public/landingPage": typeof public_landingPage;
  seed: typeof seed;
  stockTransfers: typeof stockTransfers;
  "subscription/mutations": typeof subscription_mutations;
  "subscription/queries": typeof subscription_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
