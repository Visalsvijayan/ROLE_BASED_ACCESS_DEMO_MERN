/**
 * Every URL of the app in one place. Use ROUTES.LOGIN instead of "/login", so
 * renaming a page means changing one line, and a typo becomes an error.
 */
export const ROUTES = Object.freeze({
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT: (id) => `/products/${id}`,
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  UNAUTHORIZED: "/unauthorized",

  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER: (id) => `/admin/users/${id}`,
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_NEW: "/admin/products/add",
  ADMIN_PRODUCT_EDIT: (id) => `/admin/products/edit/${id}`,
});
