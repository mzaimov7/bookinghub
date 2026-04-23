import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { addFavorite, getFavoriteIds, getFavoriteServices, removeFavorite } from "./api";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";

function imageFor(service) {
  return resolveBackendImage(service?.coverImageUrl) || serviceFallbackImage(service);
}

function formatDuration(minutes) {
  return `${minutes} min`;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      navigate("/");
      return;
    }

    async function load() {
      const [favoriteServices, ids] = await Promise.all([getFavoriteServices(), getFavoriteIds()]);
      setServices(favoriteServices);
      setFavoriteIds(ids);
    }

    load();
  }, [navigate]);

  const totalEstimatedValue = useMemo(
    () => services.reduce((sum, service) => sum + Number(service.price || 0), 0),
    [services]
  );

  async function onToggleFavorite(serviceId) {
    const isFavorite = favoriteIds.includes(serviceId);

    if (isFavorite) {
      await removeFavorite(serviceId);
      setFavoriteIds((current) => current.filter((item) => item !== serviceId));
      setServices((current) => current.filter((item) => item.id !== serviceId));
      return;
    }

    await addFavorite(serviceId);
    setFavoriteIds((current) => [...current, serviceId]);
  }

  return (
    <div style={page}>
      <Header />
      <div style={content}>
        <section style={hero}>
          <div style={heroCopy}>
            <div style={eyebrow}>Saved Collection</div>
            <h1 style={title}>Favorites</h1>
            <p style={subtitle}>
              Keep the services you want to revisit, compare them quickly, and jump straight into a reservation when
              you are ready.
            </p>
          </div>

          <div style={heroStats}>
            <StatCard value={services.length} label="Saved services" tone="blue" />
            <StatCard value={`${totalEstimatedValue} lv`} label="Combined value" tone="slate" />
            <Link to="/" style={browseLink}>Discover more</Link>
          </div>
        </section>

        {services.length === 0 ? (
          <div style={emptyCard}>
            <div style={emptyTitle}>No favorites yet</div>
            <p style={emptyText}>Save services from the home page or the service details page and they will appear here.</p>
            <Link to="/" style={emptyLink}>Explore services</Link>
          </div>
        ) : (
          <section style={collectionWrap}>
            <div style={sectionHeader}>
              <div>
                <div style={sectionEyebrow}>Curated for you</div>
                <div style={sectionTitle}>Your saved shortlist</div>
              </div>
              <div style={sectionMeta}>{services.length} picks ready for booking</div>
            </div>

            <div style={cardGrid}>
              {services.map((service, index) => (
                <article key={service.id} style={favoriteCard}>
                  <Link to={`/services/${service.id}`} style={imageLink}>
                    <img
                      src={imageFor(service)}
                      alt={service.title}
                      style={cardImage}
                      onError={(event) => {
                        event.currentTarget.src = serviceFallbackImage(service);
                      }}
                    />
                    <div style={imageOverlay} />
                    <div style={saveBadge}>Saved #{index + 1}</div>
                    <div style={pricePill}>{service.price} lv</div>
                  </Link>

                  <div style={cardBody}>
                    <div style={cardTopline}>
                      <div style={locationLine}>{service.city}{service.address ? ` • ${service.address}` : ""}</div>
                      <button
                        onClick={() => onToggleFavorite(service.id)}
                        style={favoriteButton}
                        title="Remove from favorites"
                      >
                        ♥
                      </button>
                    </div>

                    <Link to={`/services/${service.id}`} style={cardTitleLink}>
                      {service.title}
                    </Link>

                    <p style={cardDescription}>{service.description}</p>

                    <div style={detailRow}>
                      <DetailChip label="Duration" value={formatDuration(service.durationMinutes)} />
                      <DetailChip label="City" value={service.city || "Local"} />
                    </div>

                    <div style={ctaRow}>
                      <Link to={`/services/${service.id}`} style={primaryAction}>
                        Reserve now
                      </Link>
                      <Link to={`/services/${service.id}`} style={secondaryAction}>
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ value, label, tone }) {
  const palette = {
    blue: { background: "rgba(255,255,255,0.72)", border: "rgba(191,219,254,0.9)", value: "#1d4ed8" },
    slate: { background: "rgba(255,255,255,0.72)", border: "rgba(203,213,225,0.9)", value: "#0f172a" },
  };

  return (
    <div style={{ ...statCard, background: palette[tone].background, borderColor: palette[tone].border }}>
      <div style={{ ...statValue, color: palette[tone].value }}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

function DetailChip({ label, value }) {
  return (
    <div style={detailChip}>
      <span style={detailLabel}>{label}</span>
      <span style={detailValue}>{value}</span>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(191,219,254,0.6) 0%, rgba(248,250,252,0.95) 28%, #f8fafc 68%)",
};
const content = { maxWidth: 1180, margin: "0 auto", padding: "18px 16px 28px" };
const hero = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 0.9fr)",
  gap: 18,
  padding: 24,
  borderRadius: 32,
  background: "linear-gradient(135deg, rgba(219,234,254,0.95) 0%, rgba(255,255,255,0.96) 62%, rgba(239,246,255,0.9) 100%)",
  border: "1px solid rgba(191,219,254,0.9)",
  boxShadow: "0 28px 80px rgba(148,163,184,0.16)",
};
const heroCopy = { maxWidth: 620 };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#2563eb" };
const title = { margin: "12px 0 10px", fontSize: 42, lineHeight: 1.02, color: "#0f172a" };
const subtitle = { margin: 0, maxWidth: 560, color: "#475569", lineHeight: 1.75, fontSize: 16 };
const heroStats = { display: "grid", alignContent: "space-between", gap: 12 };
const statCard = { border: "1px solid", borderRadius: 22, padding: "18px 18px 16px", backdropFilter: "blur(10px)" };
const statValue = { fontSize: 30, fontWeight: 900, lineHeight: 1 };
const statLabel = { marginTop: 8, color: "#475569", fontWeight: 700 };
const browseLink = {
  textDecoration: "none",
  padding: "15px 18px",
  borderRadius: 18,
  background: "#0f172a",
  color: "#fff",
  fontWeight: 900,
  textAlign: "center",
  boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
};
const emptyCard = {
  marginTop: 18,
  background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: 28,
  padding: "34px 28px",
  boxShadow: "0 24px 60px rgba(148,163,184,0.12)",
};
const emptyTitle = { fontWeight: 900, fontSize: 24, color: "#0f172a" };
const emptyText = { marginTop: 10, color: "#64748b", lineHeight: 1.7, maxWidth: 520 };
const emptyLink = {
  display: "inline-flex",
  marginTop: 16,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
};
const collectionWrap = { marginTop: 18 };
const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 18,
  marginBottom: 16,
};
const sectionEyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b" };
const sectionTitle = { marginTop: 8, fontSize: 30, fontWeight: 900, color: "#0f172a" };
const sectionMeta = { color: "#475569", fontWeight: 700 };
const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
  gap: 18,
};
const favoriteCard = {
  overflow: "hidden",
  borderRadius: 28,
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
  border: "1px solid rgba(226,232,240,0.95)",
  boxShadow: "0 24px 60px rgba(148,163,184,0.14)",
};
const imageLink = {
  position: "relative",
  display: "block",
  height: 220,
  textDecoration: "none",
  color: "inherit",
};
const cardImage = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const imageOverlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.44) 100%)",
};
const saveBadge = {
  position: "absolute",
  left: 16,
  top: 16,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.86)",
  color: "#0f172a",
  fontWeight: 900,
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};
const pricePill = {
  position: "absolute",
  right: 16,
  bottom: 16,
  padding: "10px 12px",
  borderRadius: 999,
  background: "rgba(15,23,42,0.86)",
  color: "#fff",
  fontWeight: 900,
};
const cardBody = { padding: 18 };
const cardTopline = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
const locationLine = { color: "#64748b", fontSize: 13, fontWeight: 700 };
const favoriteButton = {
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  borderRadius: 14,
  width: 42,
  height: 42,
  cursor: "pointer",
  color: "#dc2626",
  fontSize: 19,
  fontWeight: 900,
  boxShadow: "0 12px 30px rgba(37,99,235,0.12)",
};
const cardTitleLink = {
  display: "inline-block",
  marginTop: 12,
  textDecoration: "none",
  color: "#0f172a",
  fontSize: 24,
  lineHeight: 1.15,
  fontWeight: 900,
};
const cardDescription = {
  margin: "12px 0 0",
  color: "#475569",
  lineHeight: 1.7,
  minHeight: 76,
};
const detailRow = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 16 };
const detailChip = {
  display: "grid",
  gap: 4,
  padding: "12px 14px",
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};
const detailLabel = { fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" };
const detailValue = { color: "#0f172a", fontWeight: 800 };
const ctaRow = { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginTop: 18 };
const primaryAction = {
  textDecoration: "none",
  textAlign: "center",
  padding: "13px 16px",
  borderRadius: 16,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 900,
  boxShadow: "0 18px 40px rgba(37,99,235,0.2)",
};
const secondaryAction = {
  textDecoration: "none",
  textAlign: "center",
  padding: "13px 16px",
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  color: "#334155",
  fontWeight: 800,
  background: "#fff",
};
