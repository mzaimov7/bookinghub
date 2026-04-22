import { apiGet, apiSend } from "../../../lib/apiClient";
import { mapCollection, mapResource } from "../../../lib/mapper";

const businessHeaders = { "X-Business-User-Id": "1" };

export async function listActiveResources() {
  const data = await apiGet("/api/business/resources", { headers: businessHeaders });
  return mapCollection(data, mapResource).filter((resource) => resource.active);
}

export async function createService(payload) {
  return apiSend("/api/business/services", {
    method: "POST",
    headers: { ...businessHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
