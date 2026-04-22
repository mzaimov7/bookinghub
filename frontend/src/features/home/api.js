import { apiGet } from "../../lib/apiClient";
import { mapCategory, mapCollection, mapService } from "../../lib/mapper";

export async function getCategories() {
  const data = await apiGet("/api/categories");
  return mapCollection(data, mapCategory);
}

export async function searchServices({ query, city, categoryId } = {}) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (city) params.set("city", city);
  if (categoryId) params.set("categoryId", categoryId);

  const url = params.toString() ? `/api/services?${params.toString()}` : "/api/services";
  const data = await apiGet(url);

  return mapCollection(data, mapService);
}
