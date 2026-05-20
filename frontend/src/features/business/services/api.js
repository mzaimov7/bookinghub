import { apiGet, apiSend } from "../../../lib/apiClient";
import { getRole, getUserId } from "../../../lib/authStore";
import {
  mapAdminBooking,
  mapAdminCategory,
  mapAdminComment,
  mapAdminReport,
  mapAdminReview,
  mapAdminUserProfile,
  mapBusinessBooking,
  mapCategorySuggestion,
  mapCollection,
  mapResource,
  mapService,
} from "../../../lib/mapper";

function businessHeaders() {
  const userId = getUserId();
  if (!userId || getRole() !== "BUSINESS") {
    throw new Error("A business account is required for this action.");
  }

  return { "X-Business-User-Id": String(userId) };
}

function adminHeaders() {
  const userId = getUserId();
  if (!userId || getRole() !== "ADMIN") {
    throw new Error("An admin account is required for this action.");
  }

  return { "X-Admin-User-Id": String(userId) };
}

export async function listActiveResources() {
  const data = await apiGet("/api/business/resources", { headers: businessHeaders() });
  return mapCollection(data, mapResource).filter((resource) => resource.active);
}

export async function createService(payload) {
  return apiSend("/api/business/services", {
    method: "POST",
    headers: { ...businessHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function createCategorySuggestion(payload) {
  const data = await apiSend("/api/business/category-suggestions", {
    method: "POST",
    headers: { ...businessHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapCategorySuggestion(data);
}

export async function getMyService(serviceId) {
  const data = await apiGet(`/api/business/services/${serviceId}`, { headers: businessHeaders() });
  return mapService(data);
}

export async function updateService(serviceId, payload) {
  return apiSend(`/api/business/services/${serviceId}`, {
    method: "PUT",
    headers: { ...businessHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function uploadServiceImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiSend("/api/business/services/images", {
    method: "POST",
    headers: businessHeaders(),
    body: formData,
  });

  return data?.imageUrl ?? null;
}

export async function listMyServices() {
  const data = await apiGet("/api/business/services", { headers: businessHeaders() });
  return mapCollection(data, mapService);
}

export async function listBusinessBookings() {
  const data = await apiGet("/api/business/bookings", { headers: businessHeaders() });
  return mapCollection(data, mapBusinessBooking);
}

export async function updateBusinessBookingStatus(bookingId, payload) {
  const data = await apiSend(`/api/business/bookings/${bookingId}`, {
    method: "PATCH",
    headers: { ...businessHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapBusinessBooking(data);
}

export async function listAdminServices() {
  const data = await apiGet("/api/admin/services", { headers: adminHeaders() });
  return mapCollection(data, mapService);
}

export async function listAdminBookings() {
  const data = await apiGet("/api/admin/bookings", { headers: adminHeaders() });
  return mapCollection(data, mapAdminBooking);
}

export async function listAdminCategories() {
  const data = await apiGet("/api/admin/categories", { headers: adminHeaders() });
  return mapCollection(data, mapAdminCategory);
}

export async function createAdminCategory(payload) {
  const data = await apiSend("/api/admin/categories", {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapAdminCategory(data);
}

export async function updateAdminCategory(categoryId, payload) {
  const data = await apiSend(`/api/admin/categories/${categoryId}`, {
    method: "PUT",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapAdminCategory(data);
}

export async function deactivateAdminCategory(categoryId) {
  const data = await apiSend(`/api/admin/categories/${categoryId}/deactivate`, {
    method: "PATCH",
    headers: adminHeaders(),
  });
  return mapAdminCategory(data);
}

export async function approveServiceAsAdmin(serviceId, payload) {
  const data = await apiSend(`/api/admin/services/${serviceId}/approve`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapService(data);
}

export async function rejectServiceAsAdmin(serviceId, payload) {
  const data = await apiSend(`/api/admin/services/${serviceId}/reject`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapService(data);
}

export async function deleteServiceAsAdmin(serviceId, payload) {
  const data = await apiSend(`/api/admin/services/${serviceId}/delete`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapService(data);
}

export async function listAdminCategorySuggestions() {
  const data = await apiGet("/api/admin/category-suggestions", { headers: adminHeaders() });
  return mapCollection(data, mapCategorySuggestion);
}

export async function listAdminComments() {
  const data = await apiGet("/api/admin/comments", { headers: adminHeaders() });
  return mapCollection(data, mapAdminComment);
}

export async function listAdminReviews() {
  const data = await apiGet("/api/admin/reviews", { headers: adminHeaders() });
  return mapCollection(data, mapAdminReview);
}

export async function hideReviewAsAdmin(reviewId) {
  const data = await apiSend(`/api/admin/reviews/${reviewId}/hide`, {
    method: "PATCH",
    headers: adminHeaders(),
  });
  return mapAdminReview(data);
}

export async function listAdminReports() {
  const data = await apiGet("/api/admin/reports", { headers: adminHeaders() });
  return mapCollection(data, mapAdminReport);
}

export async function updateAdminReport(reportId, payload) {
  const data = await apiSend(`/api/admin/reports/${reportId}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapAdminReport(data);
}

export async function hideCommentAsAdmin(commentId, payload) {
  const data = await apiSend(`/api/admin/comments/${commentId}/hide`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapAdminComment(data);
}

export async function listAdminClients() {
  const data = await apiGet("/api/admin/users/clients", { headers: adminHeaders() });
  return mapCollection(data, mapAdminUserProfile);
}

export async function listAdminBusinesses() {
  const data = await apiGet("/api/admin/users/businesses", { headers: adminHeaders() });
  return mapCollection(data, mapAdminUserProfile);
}

export async function updateAdminUserStatus(userId, payload) {
  const data = await apiSend(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapAdminUserProfile(data);
}
