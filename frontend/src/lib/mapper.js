/**
 * @param {import("../types/api").AuthResponse} item
 * @returns {import("../types/models").AuthModel}
 */
export function mapAuth(item) {
  return {
    userId: item?.userId == null ? null : Number(item.userId),
    username: item?.username ?? "",
    email: item?.email ?? "",
    role: item?.role ?? "CLIENT",
    devMode: Boolean(item?.devMode),
  };
}

/**
 * @param {import("../types/api").ClientProfileResponse} item
 * @returns {import("../types/models").ClientProfileModel}
 */
export function mapClientProfile(item) {
  return {
    userId: Number(item?.userId ?? 0),
    username: item?.username ?? "",
    email: item?.email ?? "",
    role: item?.role ?? "CLIENT",
    firstName: item?.firstName ?? "",
    lastName: item?.lastName ?? "",
    phone: item?.phone ?? "",
    photoUrl: item?.photoUrl ?? null,
    bio: item?.bio ?? "",
  };
}

/**
 * @param {import("../types/api").BusinessProfileResponse} item
 * @returns {import("../types/models").BusinessProfileModel}
 */
export function mapBusinessProfile(item) {
  return {
    userId: Number(item?.userId ?? 0),
    username: item?.username ?? "",
    email: item?.email ?? "",
    role: item?.role ?? "BUSINESS",
    providerType: item?.providerType ?? "COMPANY",
    businessName: item?.businessName ?? "",
    companyLegalName: item?.companyLegalName ?? "",
    companyEik: item?.companyEik ?? "",
    companyRepresentative: item?.companyRepresentative ?? "",
    city: item?.city ?? "",
    address: item?.address ?? "",
    phone: item?.phone ?? "",
    description: item?.description ?? "",
    photoUrl: item?.photoUrl ?? null,
  };
}

/**
 * @param {import("../types/api").AvailableSlotResponse} item
 * @returns {import("../types/models").AvailableSlotModel}
 */
export function mapAvailableSlot(item) {
  return {
    bookingKey: item?.bookingKey ?? "",
    resourceId: Number(item?.resourceId ?? 0),
    resourceName: item?.resourceName ?? "Assigned resource",
    resourceType: item?.resourceType ?? "STAFF",
    resourcePhotoUrl: item?.resourcePhotoUrl ?? null,
    startAt: item?.startAt ?? "",
    endAt: item?.endAt ?? "",
  };
}

/**
 * @param {import("../types/api").BookingResponse} item
 * @returns {import("../types/models").BookingModel}
 */
export function mapBooking(item) {
  return {
    id: Number(item?.id ?? 0),
    serviceId: Number(item?.serviceId ?? 0),
    slotId: Number(item?.slotId ?? 0),
    status: item?.status ?? "PENDING",
    clientNote: item?.clientNote ?? "",
    createdAt: item?.createdAt ?? "",
    startAt: item?.startAt ?? "",
    endAt: item?.endAt ?? "",
    title: item?.title ?? "",
    city: item?.city ?? "",
    address: item?.address ?? "",
    statusReason: item?.statusReason ?? "",
    price: Number(item?.price ?? 0),
    durationMinutes: Number(item?.durationMinutes ?? 0),
    coverImageUrl: item?.coverImageUrl ?? null,
    reviewId: item?.reviewId == null ? null : Number(item.reviewId),
    reviewRating: item?.reviewRating == null ? null : Number(item.reviewRating),
    reviewComment: item?.reviewComment ?? "",
  };
}

export function mapReview(item) {
  return {
    id: Number(item?.id ?? 0),
    bookingId: item?.bookingId == null ? null : Number(item.bookingId),
    serviceId: Number(item?.serviceId ?? 0),
    authorUserId: Number(item?.authorUserId ?? 0),
    authorName: item?.authorName ?? "Клиент",
    authorPhotoUrl: item?.authorPhotoUrl ?? null,
    rating: Number(item?.rating ?? 0),
    comment: item?.comment ?? "",
    status: item?.status ?? "VISIBLE",
    createdAt: item?.createdAt ?? "",
  };
}

/**
 * @param {import("../types/api").CommentResponse} item
 * @returns {import("../types/models").CommentModel}
 */
export function mapComment(item) {
  return {
    id: Number(item?.id ?? 0),
    serviceId: Number(item?.serviceId ?? 0),
    authorUserId: Number(item?.authorUserId ?? 0),
    authorName: item?.authorName ?? "Потребител",
    authorRole: item?.authorRole ?? "CLIENT",
    authorPhotoUrl: item?.authorPhotoUrl ?? null,
    parentId: item?.parentId == null ? null : Number(item.parentId),
    text: item?.text ?? "",
    createdAt: item?.createdAt ?? "",
  };
}

/**
 * @param {import("../types/api").RecentSearchResponse} item
 * @returns {import("../types/models").RecentSearchModel}
 */
export function mapRecentSearch(item) {
  return {
    id: Number(item?.id ?? 0),
    query: item?.query ?? "",
    city: item?.city ?? "",
    categoryId: item?.categoryId == null ? null : Number(item.categoryId),
    minPrice: item?.minPrice == null ? null : Number(item.minPrice),
    maxPrice: item?.maxPrice == null ? null : Number(item.maxPrice),
    createdAt: item?.createdAt ?? "",
  };
}

/**
 * @param {import("../types/api").CategoryResponse} item
 * @returns {import("../types/models").CategoryModel}
 */
export function mapCategory(item) {
  return {
    id: Number(item?.id ?? 0),
    name: item?.name ?? "",
    description: item?.description ?? "",
  };
}

export function mapAdminComment(item) {
  return {
    id: Number(item?.id ?? 0),
    serviceId: Number(item?.serviceId ?? 0),
    serviceTitle: item?.serviceTitle ?? "",
    authorUserId: Number(item?.authorUserId ?? 0),
    authorName: item?.authorName ?? "",
    text: item?.text ?? "",
    status: item?.status ?? "VISIBLE",
    adminModerationReason: item?.adminModerationReason ?? "",
    createdAt: item?.createdAt ?? null,
    moderatedAt: item?.moderatedAt ?? null,
  };
}

export function mapAdminUserProfile(item) {
  return {
    userId: Number(item?.userId ?? 0),
    username: item?.username ?? "",
    email: item?.email ?? "",
    role: item?.role ?? "",
    active: Boolean(item?.active),
    createdAt: item?.createdAt ?? null,
    lastLoginAt: item?.lastLoginAt ?? null,
    displayName: item?.displayName ?? "",
    city: item?.city ?? "",
    address: item?.address ?? "",
    phone: item?.phone ?? "",
    photoUrl: item?.photoUrl ?? null,
    bio: item?.bio ?? "",
    listingCount: Number(item?.listingCount ?? 0),
  };
}

export function mapAdminBooking(item) {
  return {
    id: Number(item?.id ?? 0),
    serviceId: Number(item?.serviceId ?? 0),
    serviceTitle: item?.serviceTitle ?? "",
    businessUserId: item?.businessUserId == null ? null : Number(item.businessUserId),
    businessName: item?.businessName ?? "",
    clientUserId: Number(item?.clientUserId ?? 0),
    clientName: item?.clientName ?? "",
    resourceName: item?.resourceName ?? "",
    status: item?.status ?? "PENDING",
    statusReason: item?.statusReason ?? "",
    clientNote: item?.clientNote ?? "",
    createdAt: item?.createdAt ?? null,
    startAt: item?.startAt ?? null,
    endAt: item?.endAt ?? null,
    price: item?.price == null ? null : Number(item.price),
  };
}

export function mapAdminCategory(item) {
  return {
    id: Number(item?.id ?? 0),
    name: item?.name ?? "",
    description: item?.description ?? "",
    active: Boolean(item?.active),
  };
}

export function mapAdminReview(item) {
  return {
    id: Number(item?.id ?? 0),
    bookingId: Number(item?.bookingId ?? 0),
    serviceId: Number(item?.serviceId ?? 0),
    serviceTitle: item?.serviceTitle ?? "",
    authorUserId: Number(item?.authorUserId ?? 0),
    authorName: item?.authorName ?? "",
    rating: Number(item?.rating ?? 0),
    comment: item?.comment ?? "",
    status: item?.status ?? "VISIBLE",
    createdAt: item?.createdAt ?? null,
  };
}

export function mapAdminReport(item) {
  return {
    id: Number(item?.id ?? 0),
    reporterUserId: Number(item?.reporterUserId ?? 0),
    reporterName: item?.reporterName ?? "",
    targetType: item?.targetType ?? "COMMENT",
    targetId: Number(item?.targetId ?? 0),
    targetLabel: item?.targetLabel ?? "",
    reasonText: item?.reasonText ?? "",
    status: item?.status ?? "OPEN",
    resolutionNote: item?.resolutionNote ?? "",
    createdAt: item?.createdAt ?? null,
  };
}

/**
 * @param {import("../types/api").ServiceResponse} item
 * @returns {import("../types/models").ServiceModel}
 */
export function mapService(item) {
  return {
    id: Number(item?.id ?? 0),
    categoryId: item?.categoryId == null ? null : Number(item.categoryId),
    categorySuggestion: item?.categorySuggestion ?? "",
    businessUserId: item?.businessUserId == null ? null : Number(item.businessUserId),
    title: item?.title ?? "",
    description: item?.description ?? "",
    city: item?.city ?? "",
    address: item?.address ?? "",
    price: Number(item?.price ?? 0),
    durationMinutes: Number(item?.durationMinutes ?? 0),
    opensAt: item?.opensAt ?? null,
    closesAt: item?.closesAt ?? null,
    slotIntervalMinutes: Number(item?.slotIntervalMinutes ?? 30),
    bookingHorizonDays: Number(item?.bookingHorizonDays ?? 90),
    active: Boolean(item?.active),
    coverImageUrl: item?.coverImageUrl ?? null,
    imageUrls: Array.isArray(item?.imageUrls) ? item.imageUrls.filter(Boolean) : [],
    resourceIds: Array.isArray(item?.resourceIds) ? item.resourceIds.map(Number).filter((value) => !Number.isNaN(value)) : [],
    approvalStatus: item?.approvalStatus ?? "PENDING",
    approvalNote: item?.approvalNote ?? "",
    approvalReviewedAt: item?.approvalReviewedAt ?? null,
    adminDeletionReason: item?.adminDeletionReason ?? "",
    adminDeletedAt: item?.adminDeletedAt ?? null,
  };
}

/**
 * @param {import("../types/api").ResourceResponse} item
 * @returns {import("../types/models").ResourceModel}
 */
export function mapResource(item) {
  return {
    id: Number(item?.id ?? 0),
    type: item?.type ?? "STAFF",
    name: item?.name ?? "",
    active: Boolean(item?.active),
    photoUrl: item?.photoUrl ?? null,
    weeklyOffDays: Array.isArray(item?.weeklyOffDays) ? item.weeklyOffDays.map(Number).filter((value) => !Number.isNaN(value)) : [],
    dayOffDates: Array.isArray(item?.dayOffDates) ? item.dayOffDates.filter(Boolean) : [],
  };
}

/**
 * @param {import("../types/api").BusinessBookingResponse} item
 * @returns {import("../types/models").BusinessBookingModel}
 */
export function mapBusinessBooking(item) {
  return {
    id: Number(item?.id ?? 0),
    serviceId: Number(item?.serviceId ?? 0),
    slotId: Number(item?.slotId ?? 0),
    clientUserId: Number(item?.clientUserId ?? 0),
    clientName: item?.clientName ?? "",
    clientEmail: item?.clientEmail ?? "",
    serviceTitle: item?.serviceTitle ?? "",
    resourceName: item?.resourceName ?? "",
    resourceType: item?.resourceType ?? "STAFF",
    status: item?.status ?? "PENDING",
    statusReason: item?.statusReason ?? "",
    clientNote: item?.clientNote ?? "",
    createdAt: item?.createdAt ?? "",
    startAt: item?.startAt ?? "",
    endAt: item?.endAt ?? "",
    price: Number(item?.price ?? 0),
    durationMinutes: Number(item?.durationMinutes ?? 0),
    coverImageUrl: item?.coverImageUrl ?? null,
  };
}

/**
 * @template TInput, TOutput
 * @param {TInput[] | null | undefined} items
 * @param {(item: TInput) => TOutput} mapper
 * @returns {TOutput[]}
 */
export function mapCollection(items, mapper) {
  if (!Array.isArray(items)) return [];
  return items.map(mapper);
}
