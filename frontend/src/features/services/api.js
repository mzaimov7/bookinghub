import { apiGet, apiSend } from "../../lib/apiClient";
import { getUserId } from "../../lib/authStore";
import { mapCollection, mapComment, mapReview, mapService } from "../../lib/mapper";

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

export async function getServiceReviews(id) {
  const data = await apiGet(`/api/services/${id}/reviews`);
  return mapCollection(data, mapReview);
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

export async function updateServiceComment(serviceId, commentId, payload) {
  const userId = getUserId();
  if (!userId) {
    throw new Error("Нужен е клиентски профил, за да редактираш коментар.");
  }

  const data = await apiSend(`/api/services/${serviceId}/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "X-User-Id": String(userId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapComment(data);
}

export async function deleteServiceComment(serviceId, commentId) {
  const userId = getUserId();
  if (!userId) {
    throw new Error("Нужен е клиентски профил, за да изтриеш коментар.");
  }

  await apiSend(`/api/services/${serviceId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "X-User-Id": String(userId),
    },
  });
}

export async function createReport(payload) {
  const userId = getUserId();
  if (!userId) {
    throw new Error("Трябва да си влязъл в профила си, за да подадеш сигнал.");
  }

  return apiSend("/api/reports", {
    method: "POST",
    headers: {
      "X-User-Id": String(userId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
