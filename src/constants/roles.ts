export const ROLES = {
  ADMIN: { id: 1, name: "admin" },
  MANAGER: { id: 2, name: "manager" },
  PHARMACIST: { id: 3, name: "pharmacist" },
  CASHIER: { id: 4, name: "cashier" },
};

export const getRoleById = (roleId: number) => {
  return Object.values(ROLES).find((role) => role.id === roleId);
};

export const getRoleByName = (roleName: string) => {
  return Object.values(ROLES).find((role) => role.name === roleName);
};
