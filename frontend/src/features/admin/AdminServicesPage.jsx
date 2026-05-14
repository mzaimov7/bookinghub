import React, { useEffect, useState } from "react";
import { resolveBackendImage } from "../../lib/assets";
import { deleteServiceAsAdmin, listAdminServices } from "../business/services/api";

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setItems(await listAdminServices());
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function onDelete(service) {
    const reason = reasons[service.id]?.trim();
    if (!reason) {
      alert("Напиши причина за изтриването на тази обява.");
      return;
    }

    try {
      setSubmittingId(service.id);
      await deleteServiceAsAdmin(service.id, { reason });
      setItems((current) => current.filter((item) => item.id !== service.id));
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Зареждане на админ услугите…</div>;
  }

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 16px 40px" }}>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#991b1b" }}>
          Админ модерация
        </div>
        <h1 style={{ margin: 0, fontSize: 34, color: "#0f172a" }}>Изтриване на бизнес обяви с ясна причина</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, maxWidth: 760 }}>
          Премахването на обява ще я архивира, ще анулира бъдещите клиентски резервации и ще остави точната админ причина към бизнес акаунта.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {items.map((service) => (
          <article key={service.id} style={card}>
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}>
              <div style={imageWrap}>
                {service.coverImageUrl ? (
                  <img src={resolveBackendImage(service.coverImageUrl)} alt={service.title} style={image} />
                ) : (
                  <div style={imagePlaceholder}>Няма снимка</div>
                )}
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{service.title}</div>
                  <div style={{ color: "#475569", marginTop: 4 }}>
                    {service.city}{service.address ? ` • ${service.address}` : ""} • €{service.price.toFixed(2)}
                  </div>
                </div>

                <textarea
                  value={reasons[service.id] ?? ""}
                  onChange={(event) => setReasons((current) => ({ ...current, [service.id]: event.target.value }))}
                  placeholder="Административна причина за изтриването на тази обява"
                  style={textarea}
                />

                <div>
                  <button type="button" onClick={() => onDelete(service)} style={button} disabled={submittingId === service.id}>
                    {submittingId === service.id ? "Изтриване..." : "Изтрий обявата"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const card = { padding: 18, borderRadius: 24, border: "1px solid #fecaca", background: "#fff", boxShadow: "0 20px 44px rgba(15,23,42,0.08)" };
const imageWrap = { borderRadius: 18, overflow: "hidden", minHeight: 160, background: "#fee2e2" };
const image = { width: "100%", height: 160, objectFit: "cover", display: "block" };
const imagePlaceholder = { height: 160, display: "grid", placeItems: "center", color: "#991b1b", fontWeight: 800 };
const textarea = { minHeight: 110, resize: "vertical", borderRadius: 16, border: "1px solid #fecaca", padding: 14, font: "inherit" };
const button = { padding: "12px 16px", borderRadius: 14, border: "none", background: "#dc2626", color: "#fff", fontWeight: 900, cursor: "pointer" };
