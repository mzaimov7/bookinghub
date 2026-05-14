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
 * @property {string | null} photoUrl
 *
 * @typedef {Object} BusinessProfileModel
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} providerType
 * @property {string} businessName
 * @property {string} city
 * @property {string} address
 * @property {string} phone
 * @property {string | null} photoUrl
 *
 * @typedef {Object} AvailableSlotModel
 * @property {string} bookingKey
 * @property {number} resourceId
 * @property {string} resourceName
 * @property {string} resourceType
 * @property {string | null} resourcePhotoUrl
 * @property {string} startAt
 * @property {string} endAt
 *
 * @typedef {Object} CommentModel
 * @property {number} id
 * @property {number} serviceId
 * @property {number} authorUserId
 * @property {string} authorName
 * @property {string} text
 * @property {string} createdAt
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
 * @property {string} statusReason
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} opensAt
 * @property {string | null} closesAt
 * @property {number} slotIntervalMinutes
 * @property {number} bookingHorizonDays
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
 * @property {string} description
 *
 * @typedef {Object} ServiceModel
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} city
 * @property {string} address
 * @property {number | null} categoryId
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} opensAt
 * @property {string | null} closesAt
 * @property {number} slotIntervalMinutes
 * @property {number} bookingHorizonDays
 * @property {string | null} coverImageUrl
 * @property {string[]} imageUrls
 * @property {number[]} resourceIds
 * @property {string} adminDeletionReason
 * @property {string | null} adminDeletedAt
 *
 * @typedef {Object} ResourceModel
 * @property {number} id
 * @property {"STAFF" | "TEAM" | string} type
 * @property {string} name
 * @property {boolean} active
 * @property {string | null} photoUrl
 * @property {number[]} weeklyOffDays
 * @property {string[]} dayOffDates
 *
 * @typedef {Object} BusinessBookingModel
 * @property {number} id
 * @property {number} serviceId
 * @property {number} slotId
 * @property {number} clientUserId
 * @property {string} clientName
 * @property {string} clientEmail
 * @property {string} serviceTitle
 * @property {string} resourceName
 * @property {string} resourceType
 * @property {string} status
 * @property {string} statusReason
 * @property {string} clientNote
 * @property {string} createdAt
 * @property {string} startAt
 * @property {string} endAt
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} coverImageUrl
 */

export {};
