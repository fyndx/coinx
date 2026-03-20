/**
 * HTTP utility functions for handling HTTP requests and responses.
 */

/**
 * Extract HTTP status code from various error formats.
 *
 * Handles errors from:
 * - Direct status property
 * - Response object with status
 * - Cause chain with status
 * - Error messages containing status codes like "(409)"
 *
 * @param error - The error object to extract status from
 * @returns HTTP status code if found, undefined otherwise
 *
 * @example
 * ```ts
 * const status = getHttpStatusFromError(error);
 * if (status === 409) {
 *   // Handle conflict
 * }
 * if (status === 401) {
 *   // Handle unauthorized
 * }
 * ```
 */
export function getHttpStatusFromError(error: unknown): number | undefined {
  if (!error) return undefined;

  // Type assertion for property access
  const e = error as any;

  // Check direct status property
  if (typeof e.status === "number") return e.status;

  // Check response.status (common in fetch/axios errors)
  if (typeof e.response?.status === "number") return e.response.status;

  // Check cause chain
  if (typeof e.cause?.status === "number") return e.cause.status;

  // Fallback: Parse from error message if it contains "(NNN)" format
  if (typeof e.message === "string") {
    const match = e.message.match(/\((\d{3})\)/);
    if (match) {
      const status = Number.parseInt(match[1], 10);
      if (!Number.isNaN(status)) return status;
    }
  }

  return undefined;
}
