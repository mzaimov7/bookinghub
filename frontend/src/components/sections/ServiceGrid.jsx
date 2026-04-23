import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";

function imageFor(service) {
  return resolveBackendImage(service?.coverImageUrl) || serviceFallbackImage(service);
}

export default function ServiceGrid({ services = [], favoriteIds = [], onToggleFavorite, title = "Примерни обяви" }) {
  const navigate = useNavigate();

  function onReserveClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn()) {
      alert("За да направиш резервация, трябва първо да влезеш в профила си.");
      navigate("/login");
      return;
    }

    if (getRole() !== "CLIENT") {
      alert("Client account required for reservations.");
      return;
    }

    const serviceId = event.currentTarget.getAttribute("data-service-id");
    navigate(`/services/${serviceId}`);
  }

  function onFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn()) {
      alert("Login first to save favorites.");
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      alert("Favorites are available for client accounts.");
      return;
    }

    const serviceId = Number(event.currentTarget.getAttribute("data-service-id"));
    onToggleFavorite?.(serviceId);
  }

  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ margin: "10px 0" }}>{title}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
        {services.map((service) => (
          <Link key={service.id} to={`/services/${service.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
              <img
                src={imageFor(service)}
                alt={service.title}
                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                onError={(event) => {
                  event.currentTarget.src = serviceFallbackImage(service);
                }}
              />

              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 800 }}>{service.title}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={onFavoriteClick}
                      data-service-id={service.id}
                      style={{ ...favoriteBtn, color: favoriteIds.includes(service.id) ? "#dc2626" : "#64748b" }}
                      title="Favorite"
                    >
                      ♥
                    </button>
                    <div style={{ fontWeight: 900, whiteSpace: "nowrap" }}>{service.price} лв</div>
                  </div>
                </div>

                <div style={{ marginTop: 6, opacity: 0.85, fontSize: 14 }}>{service.description}</div>

                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    📍 {service.city} • ⏱ {service.durationMinutes} мин
                  </div>

                  <button onClick={onReserveClick} data-service-id={service.id} style={reserveBtn} title="Reserve">
                    📅 Резервирай
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const reserveBtn = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 12,
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: 700,
};

const favoriteBtn = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 999,
  width: 34,
  height: 34,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 16,
};
