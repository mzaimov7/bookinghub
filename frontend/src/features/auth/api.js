import { apiSend } from "../../lib/apiClient";

export async function register(payload) {
  await apiSend("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return true;
}
