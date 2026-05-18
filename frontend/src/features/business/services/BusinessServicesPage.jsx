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

  if (loading) return <div style={{ padding: 24, color: "#e2e8f0" }}>Зареждане на обявите…</div>;

  return (
    <div style={{ minHeight: "100vh", background: pageBackground }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 16px 44px" }}>
        <div style={hero}>
          <div>
            <div style={eyebrow}>Бизнес обяви</div>
            <h2 style={{ margin: "8px 0 10px", fontSize: 34, lineHeight: 1.05, color: "#eff6ff" }}>Управлявай услугите, които клиентите ти могат да резервират.</h2>
            <p style={{ margin: 0, color: "rgba(226,232,240,0.8)", maxWidth: 720, lineHeight: 1.6 }}>
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
            <div style={{ fontSize: 18, fontWeight: 900, color: "#eff6ff" }}>Все още няма обяви</div>
            <div style={{ color: "rgba(191,219,254,0.74)", maxWidth: 520 }}>
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
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#eff6ff" }}>{service.title}</div>
                      <div style={{ color: "rgba(226,232,240,0.8)", lineHeight: 1.55 }}>{service.description || "Все още няма описание."}</div>
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

const pageBackground = "radial-gradient(circle at top left, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 16%, #eaf2ff 44%, #f6f9ff 100%)";
const hero = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 20, padding: "24px 26px", borderRadius: 28, background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", border: "1px solid rgba(96,165,250,0.24)" };
const eyebrow = { fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase", color: "#1d4ed8", fontWeight: 900 };
const cta = { textDecoration: "none", borderRadius: 16, padding: "14px 18px", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 18px 30px rgba(37, 99, 235, 0.2)" };
const errorBox = { marginBottom: 16, padding: 14, borderRadius: 16, border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", fontWeight: 700 };
const emptyState = { minHeight: 280, display: "grid", gap: 8, placeContent: "center", padding: 24, borderRadius: 28, border: "1px dashed rgba(96,165,250,0.24)", background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 };
const card = { display: "grid", gap: 16, padding: 18, borderRadius: 26, border: "1px solid rgba(96,165,250,0.22)", background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", boxShadow: "0 22px 45px rgba(15, 23, 42, 0.18)" };
const imageWrap = { position: "relative", borderRadius: 22, overflow: "hidden", minHeight: 210, background: "linear-gradient(135deg, #dbeafe, #eff6ff)" };
const image = { width: "100%", height: 210, objectFit: "cover", display: "block" };
const imagePlaceholder = { minHeight: 210, display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900, letterSpacing: 1.4 };
const statusPill = { position: "absolute", top: 14, right: 14, padding: "8px 12px", borderRadius: 999, background: "rgba(15, 23, 42, 0.72)", color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase" };
const metaRow = { display: "flex", gap: 12, flexWrap: "wrap", color: "rgba(191,219,254,0.76)", fontWeight: 700 };
const actions = { display: "flex", gap: 10, flexWrap: "wrap" };
const adminNotice = { padding: "12px 14px", borderRadius: 16, background: "#fff1f2", border: "1px solid #fecdd3" };
const ghostBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(96,165,250,0.24)", color: "#eff6ff", fontWeight: 800, background: "rgba(15,23,42,0.34)" };
const solidBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontWeight: 900 };
const softBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(96,165,250,0.2)", background: "rgba(15,23,42,0.28)", color: "#cbd5e1", fontWeight: 800 };
