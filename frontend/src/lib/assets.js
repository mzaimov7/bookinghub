import imgElectric from "../assets/services/service-electric.png";
import imgHaircut from "../assets/services/service-haircut.png";
import imgVip from "../assets/services/service-vip.png";

export function serviceFallbackImage(service) {
  const title = (service?.title || "").toLowerCase();

  if (title.includes("electrical") || title.includes("diagnostics")) return imgElectric;
  if (title.includes("vip")) return imgVip;
  if (title.includes("haircut") || title.includes("standard")) return imgHaircut;

  return imgHaircut;
}

export function resolveBackendImage(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `http://localhost:8080${url}`;
  return url;
}

export function categoryFallbackImage(category) {
  const value = `${category?.name || ""} ${category?.description || ""}`.toLowerCase();

  if (
    value.includes("hair") ||
    value.includes("barber") ||
    value.includes("beauty") ||
    value.includes("salon") ||
    value.includes("cosmetic")
  ) {
    return imgHaircut;
  }

  if (
    value.includes("car") ||
    value.includes("repair") ||
    value.includes("service") ||
    value.includes("electrical") ||
    value.includes("diagnostic") ||
    value.includes("auto")
  ) {
    return imgElectric;
  }

  return imgVip;
}
