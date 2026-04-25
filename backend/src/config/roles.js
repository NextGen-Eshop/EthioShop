/**
 * Single source of truth for roles and permissions. Backend enforces; never trust the client.
 * Legacy `user` in the database is treated as `customer` for permissions.
 */

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CUSTOMER: "customer",
  USER: "user", // legacy alias; same as customer
};

export const PERMISSIONS = {
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",
  VIEW_PRODUCTS: "view_products",

  VIEW_OWN_ORDERS: "view_own_orders",
  VIEW_ALL_ORDERS: "view_all_orders",
  UPDATE_ORDER: "update_order",
  DELETE_ORDER: "delete_order",
  PLACE_ORDER: "place_order",
  APPROVE_PAYMENT: "approve_payment",

  VIEW_ALL_USERS: "view_all_users",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",
  CHANGE_ROLE: "change_role",

  VIEW_ANALYTICS: "view_analytics",
};

const ALL = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ALL,

  [ROLES.MANAGER]: [
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.PLACE_ORDER,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.APPROVE_PAYMENT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ALL_USERS,
  ],

  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.PLACE_ORDER,
    PERMISSIONS.VIEW_OWN_ORDERS,
  ],

  [ROLES.USER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.PLACE_ORDER,
    PERMISSIONS.VIEW_OWN_ORDERS,
  ],
};

export const normalizeRole = (role) => {
  if (role === ROLES.USER) return ROLES.CUSTOMER;
  return role;
};

export const getPermissions = (role) => {
  const r = role === ROLES.USER ? ROLES.CUSTOMER : role;
  return ROLE_PERMISSIONS[r] ?? ROLE_PERMISSIONS[ROLES.CUSTOMER];
};
