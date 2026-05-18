import { apiGet, apiSend } from "../../lib/apiClient";
import { getUserId } from "../../lib/authStore";
import { mapAvailableSlot, mapBooking, mapClientProfile, mapCollection, mapRecentSearch, mapService } from "../../lib/mapper";

function userHeaders() {
  const userId = getUserId();
  if (!userId) {
    throw new Error("A client account is required for this action.");
  }

  return { "X-User-Id": String(userId) };
}

export async function getFavoriteServices() {
  const data = await apiGet("/api/client/favorites", { headers: userHeaders() });
  return mapCollection(data, mapService);
}

export async function getMyProfile() {
  const data = await apiGet("/api/client/profile", { headers: userHeaders() });
  return mapClientProfile(data);
}

export async function updateMyProfile(payload) {
  const data = await apiSend("/api/client/profile", {
    method: "PUT",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapClientProfile(data);
}

export async function uploadMyProfilePhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiSend("/api/client/profile/photo", {
    method: "POST",
    headers: {
      ...userHeaders(),
    },
    body: formData,
  });

  return mapClientProfile(data);
}

export async function verifyMyPassword(password) {
  await apiSend("/api/client/profile/verify-password", {
    method: "POST",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
}

export async function changeMyPassword(payload) {
  await apiSend("/api/client/profile/password", {
    method: "PUT",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getFavoriteIds() {
  return apiGet("/api/client/favorites/ids", { headers: userHeaders() });
}

export async function addFavorite(serviceId) {
  await apiSend(`/api/client/favorites/${serviceId}`, {
    method: "POST",
    headers: userHeaders(),
  });
}

export async function removeFavorite(serviceId) {
  await apiSend(`/api/client/favorites/${serviceId}`, {
    method: "DELETE",
    headers: userHeaders(),
  });
}

export async function getRecentSearches() {
  const data = await apiGet("/api/client/recent-searches", { headers: userHeaders() });
  return mapCollection(data, mapRecentSearch);
}

export async function saveRecentSearch(payload) {
  await apiSend("/api/client/recent-searches", {
    method: "POST",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getAvailableSlots(serviceId) {
  const data = await apiGet(`/api/services/${serviceId}/slots`);
  return mapCollection(data, mapAvailableSlot);
}

export async function createBooking(payload) {
  const data = await apiSend("/api/client/bookings", {
    method: "POST",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapBooking(data);
}

export async function getMyBookings() {
  const data = await apiGet("/api/client/bookings", { headers: userHeaders() });
  return mapCollection(data, mapBooking);
}
