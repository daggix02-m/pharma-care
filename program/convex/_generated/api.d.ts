/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_mutations from "../admin/mutations.js";
import type * as admin_queries from "../admin/queries.js";
import type * as auth_mutations from "../auth/mutations.js";
import type * as auth_queries from "../auth/queries.js";
import type * as cashier_mutations from "../cashier/mutations.js";
import type * as cashier_queries from "../cashier/queries.js";
import type * as manager_mutations from "../manager/mutations.js";
import type * as manager_queries from "../manager/queries.js";
import type * as pharmacist_mutations from "../pharmacist/mutations.js";
import type * as pharmacist_queries from "../pharmacist/queries.js";
import type * as seed from "../seed.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/mutations": typeof admin_mutations;
  "admin/queries": typeof admin_queries;
  "auth/mutations": typeof auth_mutations;
  "auth/queries": typeof auth_queries;
  "cashier/mutations": typeof cashier_mutations;
  "cashier/queries": typeof cashier_queries;
  "manager/mutations": typeof manager_mutations;
  "manager/queries": typeof manager_queries;
  "pharmacist/mutations": typeof pharmacist_mutations;
  "pharmacist/queries": typeof pharmacist_queries;
  seed: typeof seed;
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
