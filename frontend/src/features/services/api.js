import { apiGet, apiSend } from "../../lib/apiClient";
import { getUserId } from "../../lib/authStore";
import { mapCollection, mapComment, mapService } from "../../lib/mapper";

export async function getServiceById(id) {
  try {
    const data = await apiGet(`/api/services/${id}`);
    return mapService(data);
  } catch (error) {
    if (error.message === "HTTP 404") return null;
    throw error;
  }
}

export async function getServiceComments(id) {
  const data = await apiGet(`/api/services/${id}/comments`);
  return mapCollection(data, mapComment);
}

export async function createServiceComment(id, payload) {
  const userId = getUserId();
  if (!userId) {
    throw new Error("Нужен е клиентски профил, за да публикуваш коментар.");
  }

  const data = await apiSend(`/api/services/${id}/comments`, {
    method: "POST",
    headers: {
      "X-User-Id": String(userId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapComment(data);
}
