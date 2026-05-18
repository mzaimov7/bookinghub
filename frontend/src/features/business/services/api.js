import { apiGet, apiSend } from "../../../lib/apiClient";
import { getRole, getUserId } from "../../../lib/authStore";
import { mapBusinessBooking, mapCollection, mapResource, mapService } from "../../../lib/mapper";

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
  const data = await apiGet("/api/business/admin/services", { headers: adminHeaders() });
  return mapCollection(data, mapService);
}

export async function deleteServiceAsAdmin(serviceId, payload) {
  const data = await apiSend(`/api/business/admin/services/${serviceId}/delete`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapService(data);
}
