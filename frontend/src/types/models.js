/**
 * Frontend model layer.
 * These types describe the in-memory data shape after lib/mapper translates backend responses.
 *
 * @typedef {Object} CategoryModel
 * @property {number} id
 * @property {string} name
 *
 * @typedef {Object} ServiceModel
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} city
 * @property {string} address
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} coverImageUrl
 *
 * @typedef {Object} ResourceModel
 * @property {number} id
 * @property {"STAFF" | "TEAM" | string} type
 * @property {string} name
 * @property {boolean} active
 * @property {string | null} photoUrl
 */

export {};
