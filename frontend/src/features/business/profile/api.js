import { apiGet, apiSend } from "../../../lib/apiClient";
import { getUserId } from "../../../lib/authStore";
import { mapBusinessProfile } from "../../../lib/mapper";

function userHeaders() {
  const userId = getUserId();
  if (!userId) {
    throw new Error("A business account is required for this action.");
  }

  return { "X-User-Id": String(userId) };
}

export async function getMyBusinessProfile() {
  const data = await apiGet("/api/business/profile", { headers: userHeaders() });
  return mapBusinessProfile(data);
}

export async function updateMyBusinessProfile(payload) {
  const data = await apiSend("/api/business/profile", {
    method: "PUT",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapBusinessProfile(data);
}

export async function uploadMyBusinessProfilePhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiSend("/api/business/profile/photo", {
    method: "POST",
    headers: {
      ...userHeaders(),
    },
    body: formData,
  });

  return mapBusinessProfile(data);
}

export async function verifyMyBusinessPassword(password) {
  await apiSend("/api/business/profile/verify-password", {
    method: "POST",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
}

export async function changeMyBusinessPassword(payload) {
  await apiSend("/api/business/profile/password", {
    method: "PUT",
    headers: {
      ...userHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
