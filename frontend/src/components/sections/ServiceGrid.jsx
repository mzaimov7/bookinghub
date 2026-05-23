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
    <section style={wrap}>
      {title ? (
        <div style={header}>
          <div style={eyebrow}>Открий</div>
          <h3 style={sectionTitle}>{title}</h3>
        </div>
      ) : null}

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
                  <div style={serviceTitle}>{service.title}</div>
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

                <div style={cardFooter}>
                  <div style={metaStack}>
                    <span>📍 {service.city}</span>
                    <span>⏱ {service.durationMinutes} мин</span>
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
    </section>
  );
}

const wrap = {
  marginTop: 18,
  padding: 22,
  borderRadius: 28,
  background: "linear-gradient(145deg, rgba(8,18,36,0.94) 0%, rgba(15,47,106,0.9) 42%, rgba(24,64,132,0.9) 100%)",
  border: "1px solid rgba(96,165,250,0.28)",
  boxShadow: "0 28px 70px rgba(2,6,23,0.24)",
};
const header = { marginBottom: 16 };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#93c5fd" };
const sectionTitle = { margin: "10px 0 0", color: "#eff6ff", fontSize: 34, lineHeight: 1.04 };
const card = {
  height: "100%",
  display: "grid",
  gridTemplateRows: "160px 1fr",
  border: "1px solid rgba(96,165,250,0.28)",
  borderRadius: 20,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  boxShadow: "0 20px 46px rgba(2,6,23,0.22)",
};
const image = { width: "100%", height: 160, objectFit: "cover", display: "block" };
const body = { padding: 12, color: "#e2e8f0", display: "grid", gridTemplateRows: "auto auto 1fr", minHeight: 190 };
const serviceTitle = {
  fontWeight: 800,
  lineHeight: 1.25,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const description = {
  marginTop: 6,
  color: "rgba(226,232,240,0.82)",
  fontSize: 14,
  lineHeight: 1.45,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const listWrap = { display: "grid", gap: 14 };
const listCard = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  border: "1px solid rgba(96,165,250,0.28)",
  borderRadius: 20,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  boxShadow: "0 20px 46px rgba(2,6,23,0.22)",
};
const listImage = { width: "100%", height: "100%", minHeight: 210, objectFit: "cover", display: "block" };
const listBody = { padding: 16, color: "#e2e8f0" };
const cardFooter = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 12,
  alignSelf: "end",
};
const metaStack = {
  display: "grid",
  gap: 3,
  fontSize: 13,
  color: "rgba(226,232,240,0.78)",
  lineHeight: 1.35,
};

const reserveBtn = {
  border: "1px solid rgba(96,165,250,0.34)",
  background: "linear-gradient(180deg, rgba(37,99,235,0.94) 0%, rgba(29,78,216,0.98) 100%)",
  color: "#fff",
  borderRadius: 12,
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: 700,
};

const favoriteBtn = {
  border: "1px solid rgba(96,165,250,0.28)",
  background: "rgba(15,23,42,0.44)",
  borderRadius: 999,
  width: 34,
  height: 34,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 16,
};
