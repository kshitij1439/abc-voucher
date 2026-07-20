/**
 * Centralized Role Configuration & Routing Utilities
 * Makes role-based navigation DRY and scalable.
 */

export const ROLE_DASHBOARDS = {
  employee: '/employee/dashboard',
  director: '/director/dashboard',
  accounts: '/accounts/dashboard',
};

/**
 * Returns the default dashboard route for a given user role.
 * @param {string} role - User role
 * @returns {string} Route URL
 */
export const getDashboardForRole = (role) => {
  return ROLE_DASHBOARDS[role] || '/login';
};
