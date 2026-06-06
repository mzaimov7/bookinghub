import { apiSend } from "../../lib/apiClient";
import { mapAuth } from "../../lib/mapper";

export async function login(payload) {
  const data = await apiSend("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapAuth(data);
}

export async function loginAsDev(role) {
  const data = await apiSend(`/api/auth/dev-login/${role}`, {
    method: "POST",
  });

  return mapAuth(data);
}

export async function register(payload) {
  await apiSend("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return true;
}

export async function requestPasswordReset(payload) {
  return apiSend("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload) {
  return apiSend("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function uploadRegistrationPhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiSend("/api/auth/register/photo", {
    method: "POST",
    body: formData,
  });

  return data?.photoUrl ?? null;
}
