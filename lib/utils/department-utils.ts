/**
 * Utility functions for department-related operations
 */

/**
 * Generates a URL-friendly slug from a department name
 * @param departmentName - The department name to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateDepartmentSlug(departmentName: string): string {
  if (!departmentName) return 'department'
  
  return departmentName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Gets the department route for a department head user
 * @param user - The user object with department information
 * @returns The department route path
 */
export function getDepartmentRoute(user: { department?: string }): string {
  const departmentSlug = generateDepartmentSlug(user.department || '')
  return `/department/${departmentSlug}`
}
