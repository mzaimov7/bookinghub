import { apiGet, apiSend } from "../../../lib/apiClient";
import { getRole, getUserId } from "../../../lib/authStore";
import { mapCollection, mapResource } from "../../../lib/mapper";

function businessHeaders() {
  const userId = getUserId();
  if (!userId || getRole() !== "BUSINESS") {
    throw new Error("A business account is required for this action.");
  }

  return { "X-Business-User-Id": String(userId) };
}

export async function listResources() {
  const data = await apiGet("/api/business/resources", { headers: businessHeaders() });
  return mapCollection(data, mapResource);
}

export async function createResource(payload) {
  const data = await apiSend("/api/business/resources", {
    method: "POST",
    headers: { ...businessHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapResource(data);
}

export async function updateResource(resourceId, payload) {
  const data = await apiSend(`/api/business/resources/${resourceId}`, {
    method: "PATCH",
    headers: { ...businessHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapResource(data);
}

export async function uploadResourcePhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiSend("/api/business/resources/photo", {
    method: "POST",
    headers: businessHeaders(),
    body: formData,
  });

  return data?.photoUrl ?? null;
}
