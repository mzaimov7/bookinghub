/**
 * Frontend model layer.
 * These types describe the in-memory data shape after lib/mapper translates backend responses.
 *
 * @typedef {Object} AuthModel
 * @property {number | null} userId
 * @property {string} username
 * @property {string} email
 * @property {"CLIENT" | "BUSINESS" | "ADMIN" | string} role
 * @property {boolean} devMode
 *
 * @typedef {Object} ClientProfileModel
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} phone
 *
 * @typedef {Object} AvailableSlotModel
 * @property {number} id
 * @property {number} resourceId
 * @property {string} startAt
 * @property {string} endAt
 *
 * @typedef {Object} BookingModel
 * @property {number} id
 * @property {number} serviceId
 * @property {number} slotId
 * @property {string} status
 * @property {string} clientNote
 * @property {string} createdAt
 * @property {string} startAt
 * @property {string} endAt
 * @property {string} title
 * @property {string} city
 * @property {string} address
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} coverImageUrl
 *
 * @typedef {Object} RecentSearchModel
 * @property {number} id
 * @property {string} query
 * @property {string} city
 * @property {number | null} categoryId
 * @property {number | null} minPrice
 * @property {number | null} maxPrice
 * @property {string} createdAt
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
