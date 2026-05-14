import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/layout/Header";
import { resolveBackendImage } from "../../../lib/assets";
import { listMyServices } from "./api";

export default function BusinessServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await listMyServices();
      setItems(data);
    } catch (loadError) {
      setError(loadError?.message || "Неуспешно зареждане на обявите");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Зареждане на обявите…</div>;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 16px 44px" }}>
        <div style={hero}>
          <div>
            <div style={eyebrow}>Бизнес обяви</div>
            <h2 style={{ margin: "8px 0 10px", fontSize: 34, lineHeight: 1.05, color: "#0f172a" }}>Управлявай услугите, които клиентите ти могат да резервират.</h2>
            <p style={{ margin: 0, color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
              Преглеждай активните обяви, отваряй публичната им страница и поддържай каталога си подреден, докато екипът ти расте.
            </p>
          </div>
          <Link to="/business/services/new" style={cta}>
            Създай нова обява
          </Link>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {!items.length ? (
          <div style={emptyState}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Все още няма обяви</div>
            <div style={{ color: "#64748b", maxWidth: 520 }}>
              Започни с една услуга, свържи правилния служител или екип и публикувай първите работещи часове за клиентите.
            </div>
          </div>
        ) : (
          <div style={grid}>
            {items.map((service) => {
              const imageUrl = resolveBackendImage(service.coverImageUrl);
              return (
                <div key={service.id} style={card}>
                  <div style={imageWrap}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={service.title} style={image} />
                    ) : (
                    <div style={imagePlaceholder}>BookingHub</div>
                    )}
                    <div style={statusPill}>Активна обява</div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{service.title}</div>
                      <div style={{ color: "#475569", lineHeight: 1.55 }}>{service.description || "Все още няма описание."}</div>
                    </div>

                    <div style={metaRow}>
                      <span>{service.city}</span>
                      <span>{service.durationMinutes} min</span>
                      <span>€{service.price.toFixed(2)}</span>
                    </div>

                    {!service.active && service.adminDeletionReason ? (
                      <div style={adminNotice}>
                        <div style={{ fontWeight: 900, color: "#991b1b" }}>Премахната от админ</div>
                        <div style={{ color: "#7f1d1d", lineHeight: 1.6 }}>{service.adminDeletionReason}</div>
                      </div>
                    ) : null}

                    <div style={actions}>
                      <Link to={`/business/services/${service.id}/edit`} style={solidBtn}>
                        Редактирай обявата
                      </Link>
                      <Link to={`/services/${service.id}`} style={ghostBtn}>
                        Отвори публичната страница
                      </Link>
                      <Link to="/business/bookings" style={softBtn}>
                        Виж входящите резервации
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const hero = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 20, padding: "24px 26px", borderRadius: 28, background: "linear-gradient(135deg, rgba(191, 219, 254, 0.95), rgba(255, 255, 255, 0.96))", border: "1px solid rgba(148, 163, 184, 0.28)" };
const eyebrow = { fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase", color: "#1d4ed8", fontWeight: 900 };
const cta = { textDecoration: "none", borderRadius: 16, padding: "14px 18px", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 18px 30px rgba(37, 99, 235, 0.2)" };
const errorBox = { marginBottom: 16, padding: 14, borderRadius: 16, border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", fontWeight: 700 };
const emptyState = { minHeight: 280, display: "grid", gap: 8, placeContent: "center", padding: 24, borderRadius: 28, border: "1px dashed #cbd5e1", background: "#fff" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 };
const card = { display: "grid", gap: 16, padding: 18, borderRadius: 26, border: "1px solid #dbe4f0", background: "#fff", boxShadow: "0 22px 45px rgba(15, 23, 42, 0.08)" };
const imageWrap = { position: "relative", borderRadius: 22, overflow: "hidden", minHeight: 210, background: "linear-gradient(135deg, #dbeafe, #eff6ff)" };
const image = { width: "100%", height: 210, objectFit: "cover", display: "block" };
const imagePlaceholder = { minHeight: 210, display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900, letterSpacing: 1.4 };
const statusPill = { position: "absolute", top: 14, right: 14, padding: "8px 12px", borderRadius: 999, background: "rgba(15, 23, 42, 0.72)", color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase" };
const metaRow = { display: "flex", gap: 12, flexWrap: "wrap", color: "#334155", fontWeight: 700 };
const actions = { display: "flex", gap: 10, flexWrap: "wrap" };
const adminNotice = { padding: "12px 14px", borderRadius: 16, background: "#fff1f2", border: "1px solid #fecdd3" };
const ghostBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", color: "#0f172a", fontWeight: 800 };
const solidBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "none", background: "#e0e7ff", color: "#1e3a8a", fontWeight: 900 };
const softBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "1px solid #dbe4f0", background: "#f8fafc", color: "#334155", fontWeight: 800 };
