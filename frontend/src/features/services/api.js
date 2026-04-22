import { apiGet } from "../../lib/apiClient";
import { mapService } from "../../lib/mapper";

export async function getServiceById(id) {
  try {
    const data = await apiGet(`/api/services/${id}`);
    return mapService(data);
  } catch (error) {
    if (error.message === "HTTP 404") return null;
    throw error;
  }
}
