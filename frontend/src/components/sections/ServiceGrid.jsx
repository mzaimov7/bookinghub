import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";

function imageFor(service) {
  return resolveBackendImage(service?.coverImageUrl) || serviceFallbackImage(service);
}

export default function ServiceGrid({
  services = [],
  favoriteIds = [],
  onToggleFavorite,
  title = "Примерни обяви",
  viewMode = "grid",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  function onReserveClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn()) {
      alert("За да направиш резервация, трябва първо да влезеш в профила си.");
      navigate("/login");
      return;
    }

    if (getRole() !== "CLIENT") {
      alert("За резервация е нужен клиентски профил.");
      return;
    }

    const serviceId = event.currentTarget.getAttribute("data-service-id");
    navigate(`/services/${serviceId}`, { state: { from } });
  }

  function onFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn()) {
      alert("Първо влез в профила си, за да запазваш любими.");
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      alert("Любимите са налични само за клиентски профили.");
      return;
    }

    const serviceId = Number(event.currentTarget.getAttribute("data-service-id"));
    onToggleFavorite?.(serviceId);
  }

  return (
    <div style={{ marginTop: 18 }}>
      {title ? <h3 style={{ margin: "10px 0" }}>{title}</h3> : null}

      <div
        style={
          viewMode === "list"
            ? listWrap
            : { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }
        }
      >
        {services.map((service) => (
          <Link key={service.id} to={`/services/${service.id}`} state={{ from }} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={viewMode === "list" ? listCard : card}>
              <img
                src={imageFor(service)}
                alt={service.title}
                style={viewMode === "list" ? listImage : image}
                onError={(event) => {
                  event.currentTarget.src = serviceFallbackImage(service);
                }}
              />

              <div style={viewMode === "list" ? listBody : body}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 800 }}>{service.title}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={onFavoriteClick}
                      data-service-id={service.id}
                      style={{ ...favoriteBtn, color: favoriteIds.includes(service.id) ? "#dc2626" : "#64748b" }}
                      title="Любими"
                    >
                      ♥
                    </button>
                    <div style={{ fontWeight: 900, whiteSpace: "nowrap" }}>€{service.price}</div>
                  </div>
                </div>

                <div style={description}>{service.description}</div>

                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    📍 {service.city} • ⏱ {service.durationMinutes} мин
                  </div>

                  <button onClick={onReserveClick} data-service-id={service.id} style={reserveBtn} title="Резервирай">
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

const card = { border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", background: "#fff" };
const image = { width: "100%", height: 160, objectFit: "cover", display: "block" };
const body = { padding: 12 };
const description = { marginTop: 6, opacity: 0.85, fontSize: 14 };
const listWrap = { display: "grid", gap: 14 };
const listCard = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  overflow: "hidden",
  background: "#fff",
};
const listImage = { width: "100%", height: "100%", minHeight: 210, objectFit: "cover", display: "block" };
const listBody = { padding: 16 };

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
