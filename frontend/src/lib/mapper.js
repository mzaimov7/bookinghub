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
  };
}

/**
 * @param {import("../types/api").AvailableSlotResponse} item
 * @returns {import("../types/models").AvailableSlotModel}
 */
export function mapAvailableSlot(item) {
  return {
    id: Number(item?.id ?? 0),
    resourceId: Number(item?.resourceId ?? 0),
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
    price: Number(item?.price ?? 0),
    durationMinutes: Number(item?.durationMinutes ?? 0),
    coverImageUrl: item?.coverImageUrl ?? null,
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
  };
}

/**
 * @param {import("../types/api").ServiceResponse} item
 * @returns {import("../types/models").ServiceModel}
 */
export function mapService(item) {
  return {
    id: Number(item?.id ?? 0),
    title: item?.title ?? "",
    description: item?.description ?? "",
    city: item?.city ?? "",
    address: item?.address ?? "",
    price: Number(item?.price ?? 0),
    durationMinutes: Number(item?.durationMinutes ?? 0),
    coverImageUrl: item?.coverImageUrl ?? null,
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
