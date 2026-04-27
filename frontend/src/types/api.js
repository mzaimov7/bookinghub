/**
 * @typedef {Object} AuthResponse
 * @property {number | null} userId
 * @property {string} username
 * @property {string} email
 * @property {"CLIENT" | "BUSINESS" | "ADMIN" | string} role
 * @property {boolean} devMode
 */
/**
 * @typedef {Object} ClientProfileResponse
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} firstName
 * @property {string} lastName
 * @property {string | null} phone
 */
/**
 * @typedef {Object} AvailableSlotResponse
 * @property {number} id
 * @property {number} resourceId
 * @property {string} startAt
 * @property {string} endAt
 *
 * @typedef {Object} BookingResponse
 * @property {number} id
 * @property {number} serviceId
 * @property {number} slotId
 * @property {string} status
 * @property {string | null} clientNote
 * @property {string} createdAt
 * @property {string} startAt
 * @property {string} endAt
 * @property {string} title
 * @property {string} city
 * @property {string | null} address
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} coverImageUrl
 *
 * @typedef {Object} RecentSearchResponse
 * @property {number} id
 * @property {string | null} query
 * @property {string | null} city
 * @property {number | null} categoryId
 * @property {number | null} minPrice
 * @property {number | null} maxPrice
 * @property {string} createdAt
 */
/**
 * @typedef {Object} CategoryResponse
 * @property {number} id
 * @property {string} name
 * @property {string | null} description
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
