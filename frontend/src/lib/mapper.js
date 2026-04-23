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
