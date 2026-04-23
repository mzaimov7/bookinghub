/**
 * @typedef {Object} AuthResponse
 * @property {number | null} userId
 * @property {string} username
 * @property {string} email
 * @property {"CLIENT" | "BUSINESS" | "ADMIN" | string} role
 * @property {boolean} devMode
 */
/**
 * @typedef {Object} CategoryResponse
 * @property {number} id
 * @property {string} name
 *
 * @typedef {Object} ServiceResponse
 * @property {number} id
 * @property {string} title
 * @property {string | null} description
 * @property {string} city
 * @property {string} address
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} coverImageUrl
 *
 * @typedef {Object} ResourceResponse
 * @property {number} id
 * @property {string} type
 * @property {string} name
 * @property {boolean} active
 * @property {string | null} photoUrl
 */

export {};
