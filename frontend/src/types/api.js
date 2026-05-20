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
 * @property {string | null} photoUrl
 * @property {string | null} bio
 */
/**
 * @typedef {Object} BusinessProfileResponse
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} providerType
 * @property {string} businessName
 * @property {string} city
 * @property {string | null} address
 * @property {string | null} phone
 * @property {string | null} photoUrl
 */
/**
 * @typedef {Object} AvailableSlotResponse
 * @property {string} bookingKey
 * @property {number} resourceId
 * @property {string} resourceName
 * @property {string} resourceType
 * @property {string | null} resourcePhotoUrl
 * @property {string} startAt
 * @property {string} endAt
 *
 * @typedef {Object} CommentResponse
 * @property {number} id
 * @property {number} serviceId
 * @property {number} authorUserId
 * @property {string} authorName
 * @property {string} text
 * @property {string} createdAt
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
 * @property {string | null} statusReason
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} opensAt
 * @property {string | null} closesAt
 * @property {number | null} slotIntervalMinutes
 * @property {number | null} bookingHorizonDays
 * @property {boolean} active
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
 * @property {number | null} categoryId
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} opensAt
 * @property {string | null} closesAt
 * @property {number | null} slotIntervalMinutes
 * @property {number | null} bookingHorizonDays
 * @property {string | null} coverImageUrl
 * @property {string[] | null} imageUrls
 * @property {number[] | null} resourceIds
 * @property {string | null} approvalStatus
 * @property {string | null} approvalNote
 * @property {string | null} approvalReviewedAt
 * @property {string | null} adminDeletionReason
 * @property {string | null} adminDeletedAt
 *
 * @typedef {Object} CategorySuggestionResponse
 * @property {number} id
 * @property {number} businessUserId
 * @property {string} businessName
 * @property {string} proposedName
 * @property {string} description
 * @property {string} status
 * @property {string | null} adminNote
 * @property {string | null} createdAt
 * @property {string | null} reviewedAt
 *
 * @typedef {Object} AdminCommentResponse
 * @property {number} id
 * @property {number} serviceId
 * @property {string} serviceTitle
 * @property {number} authorUserId
 * @property {string} authorName
 * @property {string} text
 * @property {string} status
 * @property {string | null} adminModerationReason
 * @property {string | null} createdAt
 * @property {string | null} moderatedAt
 *
 * @typedef {Object} AdminUserProfileResponse
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {boolean} active
 * @property {string} displayName
 * @property {string | null} city
 * @property {string | null} address
 * @property {string | null} phone
 * @property {string | null} photoUrl
 * @property {string | null} bio
 * @property {number | null} listingCount
 *
 * @typedef {Object} ResourceResponse
 * @property {number} id
 * @property {string} type
 * @property {string} name
 * @property {boolean} active
 * @property {string | null} photoUrl
 * @property {number[] | null} weeklyOffDays
 * @property {string[] | null} dayOffDates
 *
 * @typedef {Object} BusinessBookingResponse
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
 * @property {string | null} statusReason
 * @property {string | null} clientNote
 * @property {string} createdAt
 * @property {string} startAt
 * @property {string} endAt
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} coverImageUrl
 */

export {};
