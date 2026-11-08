/**
 * The single source of truth for roles.
 * Use ROLES.ADMIN instead of the string "admin" everywhere, so a typo becomes
 * an error instead of a silent security bug.
 */
export const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));
