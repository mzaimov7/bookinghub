import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../lib/authStore";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";

function imageFor(service) {
  return resolveBackendImage(service?.coverImageUrl) || serviceFallbackImage(service);
}

export default function ServiceGrid({ services = [] }) {
  const navigate = useNavigate();

  function onReserveClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn()) {
      alert("За да направиш резервация, трябва първо да влезеш в профила си.");
      navigate("/login");
      return;
    }

    alert("Reserve flow: ще го вържем към booking API в следващ етап.");
  }

  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ margin: "10px 0" }}>Примерни обяви</h3>

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
                  <div style={{ fontWeight: 900, whiteSpace: "nowrap" }}>{service.price} лв</div>
                </div>

                <div style={{ marginTop: 6, opacity: 0.85, fontSize: 14 }}>{service.description}</div>

                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    📍 {service.city} • ⏱ {service.durationMinutes} мин
                  </div>

                  <button onClick={onReserveClick} style={reserveBtn} title="Reserve">
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
