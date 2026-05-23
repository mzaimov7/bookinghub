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
 * @property {string} bio
 *
 * @typedef {Object} BusinessProfileModel
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} providerType
 * @property {string} businessName
 * @property {string} companyLegalName
 * @property {string} companyEik
 * @property {string} companyRepresentative
 * @property {string} city
 * @property {string} address
 * @property {string} phone
 * @property {string} description
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
 * @property {string} authorRole
 * @property {string | null} authorPhotoUrl
 * @property {number | null} parentId
 * @property {number | null} parentReviewId
 * @property {string} text
 * @property {string} createdAt
 *
 * @typedef {Object} ReviewModel
 * @property {number} id
 * @property {number | null} bookingId
 * @property {number} serviceId
 * @property {number} authorUserId
 * @property {string} authorName
 * @property {string | null} authorPhotoUrl
 * @property {number} rating
 * @property {string} comment
 * @property {string} status
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
 * @property {boolean} active
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
 * @property {number | null} businessUserId
 * @property {string} title
 * @property {string} description
 * @property {string} city
 * @property {string} address
 * @property {number | null} categoryId
 * @property {string} categorySuggestion
 * @property {number} price
 * @property {number} durationMinutes
 * @property {string | null} opensAt
 * @property {string | null} closesAt
 * @property {number} slotIntervalMinutes
 * @property {number} bookingHorizonDays
 * @property {string | null} coverImageUrl
 * @property {string[]} imageUrls
 * @property {number[]} resourceIds
 * @property {string} approvalStatus
 * @property {string} approvalNote
 * @property {string | null} approvalReviewedAt
 * @property {string} adminDeletionReason
 * @property {string | null} adminDeletedAt
 *
 * @typedef {Object} AdminCommentModel
 * @property {number} id
 * @property {number} serviceId
 * @property {string} serviceTitle
 * @property {number} authorUserId
 * @property {string} authorName
 * @property {string} text
 * @property {string} status
 * @property {string} adminModerationReason
 * @property {string | null} createdAt
 * @property {string | null} moderatedAt
 *
 * @typedef {Object} AdminUserProfileModel
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {boolean} active
 * @property {string | null} createdAt
 * @property {string | null} lastLoginAt
 * @property {string} displayName
 * @property {string} city
 * @property {string} address
 * @property {string} phone
 * @property {string | null} photoUrl
 * @property {string} bio
 * @property {number} listingCount
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
