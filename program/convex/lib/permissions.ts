import { Doc } from '../_generated/dataModel';

export enum Permission {
  VIEW_SYSTEM_STATS = 'VIEW_SYSTEM_STATS',
  MANAGE_PHARMACIES = 'MANAGE_PHARMACIES',
  SUSPEND_PHARMACIES = 'SUSPEND_PHARMACIES',
  SEND_ADMIN_BROADCASTS = 'SEND_ADMIN_BROADCASTS',
  VIEW_DIAGNOSTIC_SESSIONS = 'VIEW_DIAGNOSTIC_SESSIONS',
  START_DIAGNOSTIC_SESSIONS = 'START_DIAGNOSTIC_SESSIONS',
  FLAG_MANAGERS = 'FLAG_MANAGERS',
  TEMPORARY_LOCK_MANAGERS = 'TEMPORARY_LOCK_MANAGERS',
  VIEW_APPEALS = 'VIEW_APPEALS',
  APPROVE_APPEALS = 'APPROVE_APPEALS',
  SEND_OWNER_MESSAGES = 'SEND_OWNER_MESSAGES',
  MANAGE_STAFF = 'MANAGE_STAFF',
  MANAGE_INVENTORY = 'MANAGE_INVENTORY',
}

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    Permission.VIEW_SYSTEM_STATS,
    Permission.MANAGE_PHARMACIES,
    Permission.SUSPEND_PHARMACIES,
    Permission.SEND_ADMIN_BROADCASTS,
    Permission.VIEW_DIAGNOSTIC_SESSIONS,
    Permission.START_DIAGNOSTIC_SESSIONS,
    Permission.FLAG_MANAGERS,
    Permission.TEMPORARY_LOCK_MANAGERS,
    Permission.VIEW_APPEALS,
    Permission.APPROVE_APPEALS,
  ],
  owner: [Permission.SEND_OWNER_MESSAGES, Permission.MANAGE_STAFF, Permission.MANAGE_INVENTORY],
  manager: [Permission.MANAGE_STAFF, Permission.MANAGE_INVENTORY],
  pharmacist: [],
  cashier: [],
};

export function hasPermission(
  user: Doc<'users'> | null,
  permission: Permission,
  context?: { branchId?: string }
): boolean {
  if (!user) {
    return false;
  }

  const role = user.role;
  if (!role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role] || [];

  if (permissions.includes(permission)) {
    if (role === 'manager' && context?.branchId && user.accessScope === 'branch_specific') {
      return user.assignedBranches?.includes(context.branchId as any) || false;
    }
    return true;
  }

  return false;
}
