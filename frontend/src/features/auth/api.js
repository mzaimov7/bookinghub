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
