import fallbackServiceImage from "../assets/services/BookingHub-logo.png";

export function serviceFallbackImage(service) {
  const title = (service?.title || "").toLowerCase();

  if (title.includes("electrical") || title.includes("diagnostics")) return fallbackServiceImage;
  if (title.includes("vip")) return fallbackServiceImage;
  if (title.includes("haircut") || title.includes("standard")) return fallbackServiceImage;

  return fallbackServiceImage;
}

export function resolveBackendImage(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `http://localhost:8080${url}`;
  return url;
}
