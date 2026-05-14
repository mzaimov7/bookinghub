import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/layout/Header";
import { getAuth } from "../../../lib/authStore";
import { resolveBackendImage } from "../../../lib/assets";
import { listBusinessBookings, listMyServices } from "../services/api";
import { listResources } from "../resources/api";

export default function BusinessDashboardPage() {
  const auth = getAuth();
  const [services, setServices] = useState([]);
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const pendingBookings = bookings.filter((item) => item.status === "PENDING");
    const activeResources = resources.filter((item) => item.active);
    return {
      listings: services.length,
      staff: activeResources.length,
      pending: pendingBookings.length,
      confirmed: bookings.filter((item) => item.status === "CONFIRMED").length,
    };
  }, [bookings, resources, services]);

  const previewServices = services.slice(0, 3);
  const pendingPreview = bookings.filter((item) => item.status === "PENDING").slice(0, 3);
  const resourcePreview = resources.slice(0, 4);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [loadedServices, loadedResources, loadedBookings] = await Promise.all([
          listMyServices(),
          listResources(),
          listBusinessBookings(),
        ]);

        setServices(loadedServices);
        setResources(loadedResources);
        setBookings(loadedBookings);
      } catch (loadError) {
        setError(loadError?.message || "Failed to load business workspace");
        setServices([]);
        setResources([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Зареждане на бизнес пространството…</div>;
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 16px 52px" }}>
        <section style={hero}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={heroEyebrow}>Бизнес команден център</div>
          <div style={{ display: "grid", gap: 8 }}>
            <h1 style={heroTitle}>
              {auth?.username ? `${auth.username}, поддържай бизнес страната в движение.` : "Поддържай бизнес страната в движение."}
            </h1>
            <p style={heroText}>
              Създавай обяви, разпределяй хора или екипи и отговаряй на клиентски заявки от едно фокусирано пространство, изградено около начина, по който работи реален booking бизнес.
            </p>
          </div>
          <div style={heroActions}>
            <Link to="/business/services/new" style={primaryAction}>
              Създай обява
            </Link>
            <Link to="/business/bookings" style={secondaryAction}>
              Прегледай заявките
            </Link>
          </div>
        </div>

        <div style={heroStats}>
          <StatCard label="Обяви" value={summary.listings} tone="blue" helper="Услуги, които в момента се управляват от този акаунт" />
          <StatCard label="Активен екип" value={summary.staff} tone="cyan" helper="Хора и екипи, налични за разпределение" />
          <StatCard label="Изчакващи" value={summary.pending} tone="amber" helper="Заявки, които чакат твоето решение" />
          <StatCard label="Потвърдени" value={summary.confirmed} tone="green" helper="Резервации, които вече са одобрени" />
        </div>
        </section>

        {error && <div style={errorBox}>{error}</div>}

        <section style={quickGrid}>
          <ActionPanel
            title="Обяви"
            text="Създавай, преглеждай и отваряй публичните страници на услугите, които клиентите могат да откриват и резервират."
            to="/business/services"
            cta="Отвори обявите"
            tone="blue"
          />
          <ActionPanel
            title="Резервации"
            text="Одобрявай или отказвай входящите заявки и поддържай графика реалистичен за всеки разпределен човек или екип."
            to="/business/bookings"
            cta="Отвори резервациите"
            tone="amber"
          />
          <ActionPanel
            title="Персонал и екипи"
            text="Добавяй един специалист, цял екип или сменяй наличността според развитието на бизнеса."
            to="/business/resources"
            cta="Отвори настройките"
            tone="cyan"
          />
        </section>

        <div style={workspaceIntro} />

        <section style={workspaceGrid}>
          <div style={wideColumn}>
            <SectionCard
              eyebrow="Приоритет сега"
              title="Изчакващи заявки"
              actionLabel="Виж всички"
              actionTo="/business/bookings"
            >
              {!pendingPreview.length ? (
                <EmptyInline text="В момента няма изчакващи заявки. Когато клиентите започнат да резервират, най-новите ще излизат първо тук." />
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {pendingPreview.map((booking) => (
                    <Link key={booking.id} to="/business/bookings" style={requestRow}>
                      <div style={requestVisual}>
                        {booking.coverImageUrl ? (
                          <img src={resolveBackendImage(booking.coverImageUrl)} alt={booking.serviceTitle} style={requestImage} />
                        ) : (
                          <div style={requestFallback}>BH</div>
                        )}
                      </div>
                      <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                        <div style={{ fontWeight: 900, color: "#0f172a" }}>{booking.serviceTitle}</div>
                        <div style={{ color: "#475569", lineHeight: 1.5 }}>
                          {booking.clientName} · {booking.resourceName}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>
                          {formatDate(booking.startAt)} · {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                        </div>
                      </div>
                      <div style={pendingPill}>Изчакваща</div>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              eyebrow="Каталог"
              title="Последно добавяни обяви"
              actionLabel="Управлявай всички"
              actionTo="/business/services"
            >
              {!previewServices.length ? (
                <EmptyInline text="Все още не си публикувал обяви. Започни с една силна услуга и изгради останалото около нея." />
              ) : (
                <div style={listingPreviewGrid}>
                  {previewServices.map((service) => (
                    <Link key={service.id} to={`/services/${service.id}`} style={listingPreviewCard}>
                      <div style={listingPreviewMedia}>
                        {service.coverImageUrl ? (
                          <img src={resolveBackendImage(service.coverImageUrl)} alt={service.title} style={listingPreviewImage} />
                        ) : (
                          <div style={listingPreviewFallback}>BookingHub</div>
                        )}
                      </div>
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>{service.title}</div>
                        <div style={{ color: "#475569", lineHeight: 1.5 }}>{service.description || "Все още няма описание."}</div>
                        <div style={miniMeta}>
                          <span>{service.city}</span>
                          <span>{service.durationMinutes} min</span>
                          <span>€{service.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div style={sideColumn}>
            <SectionCard
              eyebrow="Разпределение"
              title="Налични служители"
              actionLabel="Редактирай хората"
              actionTo="/business/resources"
            >
              {!resourcePreview.length ? (
                <EmptyInline text="Все още няма персонал или екипи. Добави ги, за да могат обявите ти да бъдат свързвани с реални хора." compact />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {resourcePreview.map((resource) => (
                    <div key={resource.id} style={resourceRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <div style={resourceAvatarWrap}>
                          {resource.photoUrl ? (
                            <img src={resolveBackendImage(resource.photoUrl)} alt={resource.name} style={resourceAvatar} />
                          ) : (
                            <div style={resourceFallback}>{resource.type === "TEAM" ? "T" : "S"}</div>
                          )}
                        </div>
                        <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis" }}>{resource.name}</div>
                          <div style={{ color: "#64748b", fontSize: 14 }}>{resource.type === "TEAM" ? "Екип" : "Служител"}</div>
                        </div>
                      </div>
                      <div style={resource.active ? activePill : inactivePill}>{resource.active ? "Активен" : "Неактивен"}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard eyebrow="Поток" title="Как работи бизнес страната">
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  "Създай обява и свържи правилния служител или екип.",
                  "Публикувай работещи часове, така че клиентите да резервират спрямо реална наличност.",
                  "Одобрявай или отказвай входящите заявки с пълен контрол върху графика.",
                ].map((item, index) => (
                  <div key={item} style={flowRow}>
                    <div style={flowIndex}>{index + 1}</div>
                    <div style={{ color: "#334155", lineHeight: 1.6 }}>{item}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, helper, tone = "blue" }) {
  const toneStyles = {
    blue: { background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(219,234,254,0.78))", border: "rgba(96,165,250,0.24)" },
    cyan: { background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(207,250,254,0.8))", border: "rgba(34,211,238,0.24)" },
    amber: { background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(254,243,199,0.86))", border: "rgba(245,158,11,0.24)" },
    green: { background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(220,252,231,0.84))", border: "rgba(34,197,94,0.24)" },
  };

  return (
    <div style={{ ...statCard, background: toneStyles[tone].background, borderColor: toneStyles[tone].border }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.4, color: "#64748b", fontWeight: 900 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{value}</div>
      <div style={{ color: "#475569", lineHeight: 1.5, fontSize: 14 }}>{helper}</div>
    </div>
  );
}

function ActionPanel({ title, text, to, cta, tone = "blue" }) {
  const accent = {
    blue: "#2563eb",
    amber: "#d97706",
    cyan: "#0891b2",
  }[tone];

  return (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={actionPanel}>
        <div style={{ width: 48, height: 6, borderRadius: 999, background: accent }} />
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{title}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{text}</div>
        </div>
        <div style={{ color: accent, fontWeight: 900 }}>{cta} →</div>
      </div>
    </Link>
  );
}

function SectionCard({ eyebrow, title, actionLabel, actionTo, children }) {
  return (
    <div style={sectionCard}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 4 }}>
          {eyebrow ? <div style={sectionEyebrow}>{eyebrow}</div> : null}
          <div style={sectionTitle}>{title}</div>
        </div>
        {actionLabel && actionTo ? (
          <Link to={actionTo} style={sectionLink}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EmptyInline({ text, compact = false }) {
  return (
    <div style={{ ...emptyInline, minHeight: compact ? 120 : 160 }}>
      <div style={{ color: "#64748b", lineHeight: 1.7, maxWidth: 520 }}>{text}</div>
    </div>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const hero = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.9fr)",
  gap: 18,
  marginBottom: 22,
  padding: "28px 30px",
  borderRadius: 32,
  background:
    "radial-gradient(circle at top left, rgba(96, 165, 250, 0.22), rgba(255, 255, 255, 0.95) 52%), linear-gradient(135deg, rgba(224, 231, 255, 0.92), rgba(255, 255, 255, 0.98))",
  border: "1px solid rgba(148, 163, 184, 0.22)",
};
const heroEyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 1.8, color: "#1d4ed8", fontWeight: 900 };
const heroTitle = { margin: 0, fontSize: 42, lineHeight: 0.98, color: "#0f172a", maxWidth: 700 };
const heroText = { margin: 0, color: "#475569", maxWidth: 700, lineHeight: 1.7, fontSize: 16 };
const heroActions = { display: "flex", gap: 12, flexWrap: "wrap" };
const primaryAction = {
  textDecoration: "none",
  borderRadius: 16,
  padding: "14px 18px",
  fontWeight: 900,
  color: "#fff",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  boxShadow: "0 18px 30px rgba(37, 99, 235, 0.18)",
};
const secondaryAction = {
  textDecoration: "none",
  borderRadius: 16,
  padding: "14px 18px",
  fontWeight: 900,
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  background: "rgba(255,255,255,0.84)",
};
const heroStats = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, alignContent: "start" };
const statCard = { padding: "16px 16px 14px", borderRadius: 22, border: "1px solid", display: "grid", gap: 10 };
const errorBox = { marginBottom: 16, padding: 14, borderRadius: 16, border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", fontWeight: 700 };
const quickGrid = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 24 };
const actionPanel = {
  height: "100%",
  padding: 20,
  borderRadius: 26,
  border: "1px solid #dbe4f0",
  background: "#fff",
  boxShadow: "0 18px 38px rgba(15, 23, 42, 0.06)",
  display: "grid",
  gap: 16,
};
const workspaceIntro = {
  minHeight: 20,
  marginBottom: 16,
  padding: "0 4px",
};
const workspaceGrid = { display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.75fr)", gap: 18, alignItems: "start" };
const wideColumn = { display: "grid", gap: 18 };
const sideColumn = { display: "grid", gap: 18 };
const sectionCard = {
  padding: 20,
  borderRadius: 28,
  border: "1px solid #dbe4f0",
  background: "#fff",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.06)",
  display: "grid",
  gap: 16,
};
const sectionEyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 1.4, color: "#64748b", fontWeight: 900 };
const sectionTitle = { fontSize: 24, lineHeight: 1.08, color: "#0f172a", fontWeight: 900 };
const sectionLink = { textDecoration: "none", color: "#1d4ed8", fontWeight: 900 };
const emptyInline = {
  display: "grid",
  placeItems: "center",
  padding: 20,
  borderRadius: 22,
  border: "1px dashed #cbd5e1",
  background: "#f8fafc",
};
const requestRow = {
  textDecoration: "none",
  color: "inherit",
  display: "grid",
  gridTemplateColumns: "92px minmax(0, 1fr) auto",
  gap: 14,
  alignItems: "center",
  padding: 12,
  borderRadius: 20,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};
const requestVisual = { width: 92, height: 92, borderRadius: 18, overflow: "hidden", background: "linear-gradient(135deg, #dbeafe, #eff6ff)" };
const requestImage = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const requestFallback = { width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900 };
const pendingPill = { padding: "10px 12px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: 12 };
const listingPreviewGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 };
const listingPreviewCard = {
  textDecoration: "none",
  color: "inherit",
  display: "grid",
  gap: 12,
  padding: 14,
  borderRadius: 22,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};
const listingPreviewMedia = { borderRadius: 18, overflow: "hidden", minHeight: 150, background: "linear-gradient(135deg, #dbeafe, #eff6ff)" };
const listingPreviewImage = { width: "100%", height: 150, objectFit: "cover", display: "block" };
const listingPreviewFallback = { minHeight: 150, display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900 };
const miniMeta = { display: "flex", gap: 10, flexWrap: "wrap", color: "#334155", fontSize: 14, fontWeight: 700 };
const resourceRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};
const resourceAvatarWrap = { width: 48, height: 48, borderRadius: 999, overflow: "hidden", background: "linear-gradient(135deg, #dbeafe, #eff6ff)", flexShrink: 0 };
const resourceAvatar = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const resourceFallback = { width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900 };
const activePill = { padding: "8px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontWeight: 800, fontSize: 12 };
const inactivePill = { padding: "8px 10px", borderRadius: 999, background: "#e2e8f0", color: "#334155", fontWeight: 800, fontSize: 12 };
const flowRow = { display: "grid", gridTemplateColumns: "34px minmax(0, 1fr)", gap: 12, alignItems: "start" };
const flowIndex = { width: 34, height: 34, borderRadius: 999, display: "grid", placeItems: "center", background: "#dbeafe", color: "#1d4ed8", fontWeight: 900 };
