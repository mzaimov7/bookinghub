import React, { useEffect, useMemo, useState } from "react";
import Header from "../../../components/layout/Header";
import { resolveBackendImage } from "../../../lib/assets";
import { listBusinessBookings, updateBusinessBookingStatus } from "../services/api";

export default function BusinessBookingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteById, setNoteById] = useState({});
  const [savingId, setSavingId] = useState(null);

  const summary = useMemo(() => ({
    total: items.length,
    pending: items.filter((item) => item.status === "PENDING").length,
    confirmed: items.filter((item) => item.status === "CONFIRMED").length,
    completed: items.filter((item) => item.status === "COMPLETED").length,
    rejected: items.filter((item) => {
      return item.status === "REJECTED" || item.status === "CANCELED";
    }).length,
  }), [items]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await listBusinessBookings();
      setItems(data);
    } catch (loadError) {
      setError(loadError?.message || "Неуспешно зареждане на резервациите");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpdate(bookingId, status) {
    setSavingId(bookingId);
    setError("");

    try {
      const updated = await updateBusinessBookingStatus(bookingId, {
        status,
        reason: status === "REJECTED" ? noteById[bookingId] || "" : null,
      });

      setItems((current) => current.map((item) => (item.id === bookingId ? updated : item)));
      if (status === "REJECTED") {
        setNoteById((current) => ({ ...current, [bookingId]: "" }));
      }
    } catch (updateError) {
      setError(updateError?.message || "Неуспешно обновяване на резервацията");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Зареждане на входящите резервации…</div>;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 16px 44px" }}>
        <div style={hero}>
          <div>
            <div style={eyebrow}>Входящи резервации</div>
            <h2 style={{ margin: "8px 0 10px", fontSize: 34, lineHeight: 1.05, color: "#0f172a" }}>Одобрявай, отказвай и поддържай графика под контрол.</h2>
            <p style={{ margin: 0, color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
              Всяка заявка остава свързана с избрания служител или екип, така че можеш да решаваш кое да бъде потвърдено и кое да се освободи обратно в графика.
            </p>
          </div>
          <div style={stats}>
            <Stat label="Всички" value={summary.total} />
            <Stat label="Изчакващи" value={summary.pending} />
            <Stat label="Потвърдени" value={summary.confirmed} />
            <Stat label="Завършени" value={summary.completed} />
            <Stat label="Отказани" value={summary.rejected} />
          </div>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {!items.length ? (
          <div style={emptyState}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Все още няма заявки за резервации</div>
            <div style={{ color: "#64748b", maxWidth: 520 }}>
              Когато клиентите започнат да резервират услугите ти, тук ще виждаш всички изчакващи, потвърдени и отказани заявки.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {items.map((item) => {
              const imageUrl = resolveBackendImage(item.coverImageUrl);
              const canModerate = item.status === "PENDING";
              const canComplete = item.status === "CONFIRMED" && new Date(item.endAt).getTime() < Date.now();
              const isSaving = savingId === item.id;
              return (
                <div key={item.id} style={card}>
                <div style={imageCol}>
                  {imageUrl ? <img src={imageUrl} alt={item.serviceTitle} style={image} /> : <div style={imagePlaceholder}>BookingHub</div>}
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{item.serviceTitle}</div>
                      <div style={{ color: "#475569" }}>
                        {item.clientName} · {item.clientEmail}
                      </div>
                    </div>
                    <div style={{ ...statusBadge, ...statusStyles[item.status] }}>{formatStatus(item.status)}</div>
                  </div>

                  <div style={metaGrid}>
                    <Meta label="Изпълнител" value={`${item.resourceName} · ${item.resourceType}`} />
                    <Meta label="Час" value={`${formatDate(item.startAt)} · ${formatTimeRange(item.startAt, item.endAt)}`} />
                    <Meta label="Цена" value={`€${item.price.toFixed(2)}`} />
                    <Meta label="Продължителност" value={`${item.durationMinutes} мин`} />
                  </div>

                  {item.clientNote && (
                    <div style={noteBox}>
                      <div style={noteLabel}>Бележка от клиента</div>
                      <div style={{ color: "#334155", lineHeight: 1.6 }}>{item.clientNote}</div>
                    </div>
                  )}

                  {item.statusReason && (
                    <div style={{ ...noteBox, borderColor: "#fecdd3", background: "#fff1f2" }}>
                      <div style={noteLabel}>{item.status === "CANCELED" ? "Причина за отмяна" : "Причина за отказ"}</div>
                      <div style={{ color: "#881337", lineHeight: 1.6 }}>{item.statusReason}</div>
                    </div>
                  )}

                  {canModerate ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      <textarea
                        value={noteById[item.id] || ""}
                        onChange={(event) => setNoteById((current) => ({ ...current, [item.id]: event.target.value }))}
                        placeholder="Бележка при потвърждение или задължителна причина при отказ"
                        style={textarea}
                      />

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => onUpdate(item.id, "CONFIRMED")} style={approveBtn} disabled={isSaving}>
                          {isSaving ? "Запазване..." : "Потвърди резервацията"}
                        </button>
                        <button type="button" onClick={() => onUpdate(item.id, "REJECTED")} style={rejectBtn} disabled={isSaving}>
                          {isSaving ? "Запазване..." : "Откажи с причина"}
                        </button>
                      </div>
                    </div>
                  ) : canComplete ? (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => onUpdate(item.id, "COMPLETED")} style={completeBtn} disabled={isSaving}>
                        {isSaving ? "Запазване..." : "Маркирай като завършена"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: "#64748b", fontWeight: 700 }}>
                      {item.status === "CONFIRMED"
                        ? "Тази заявка вече е потвърдена и блокира избрания час."
                        : item.status === "COMPLETED"
                          ? "Тази резервация е завършена и остава тук като история."
                        : "Тази заявка вече е отказана и часът е върнат обратно като свободен."}
                    </div>
                  )}
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

function Stat({ label, value }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.3, color: "#64748b", fontWeight: 900 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div style={metaCard}>
      <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#64748b", fontWeight: 900 }}>{label}</div>
      <div style={{ color: "#0f172a", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

function formatTimeRange(startAt, endAt) {
  const start = new Date(startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const end = new Date(endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${start} - ${end}`;
}

function formatStatus(status) {
  if (status === "PENDING") return "Изчакваща";
  if (status === "CONFIRMED") return "Потвърдена";
  if (status === "COMPLETED") return "Завършена";
  if (status === "REJECTED") return "Отказана";
  if (status === "CANCELED") return "Отменена";
  return status;
}

const hero = { display: "grid", gap: 18, marginBottom: 20, padding: "24px 26px", borderRadius: 28, background: "linear-gradient(135deg, rgba(224, 231, 255, 0.98), rgba(255, 255, 255, 0.96))", border: "1px solid rgba(148, 163, 184, 0.28)" };
const eyebrow = { fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase", color: "#4338ca", fontWeight: 900 };
const stats = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 };
const statCard = { padding: "14px 16px", borderRadius: 20, background: "rgba(255,255,255,0.84)", border: "1px solid rgba(148, 163, 184, 0.18)" };
const errorBox = { marginBottom: 16, padding: 14, borderRadius: 16, border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", fontWeight: 700 };
const emptyState = { minHeight: 280, display: "grid", gap: 8, placeContent: "center", padding: 24, borderRadius: 28, border: "1px dashed #cbd5e1", background: "#fff" };
const card = { display: "grid", gridTemplateColumns: "240px 1fr", gap: 18, padding: 18, borderRadius: 26, border: "1px solid #dbe4f0", background: "#fff", boxShadow: "0 22px 45px rgba(15, 23, 42, 0.08)" };
const imageCol = { borderRadius: 22, overflow: "hidden", background: "linear-gradient(135deg, #dbeafe, #eff6ff)" };
const image = { width: "100%", height: "100%", minHeight: 220, objectFit: "cover", display: "block" };
const imagePlaceholder = { minHeight: 220, display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900, letterSpacing: 1.4 };
const metaGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 };
const metaCard = { padding: "12px 14px", borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: 4 };
const statusBadge = { padding: "10px 14px", borderRadius: 999, fontSize: 12, fontWeight: 900, letterSpacing: 1.1, textTransform: "uppercase", height: "fit-content" };
const statusStyles = {
  PENDING: { background: "#fef3c7", color: "#92400e" },
  CONFIRMED: { background: "#dcfce7", color: "#166534" },
  COMPLETED: { background: "#dbeafe", color: "#1d4ed8" },
  REJECTED: { background: "#fee2e2", color: "#991b1b" },
  CANCELED: { background: "#e2e8f0", color: "#334155" },
};
const noteBox = { padding: "14px 16px", borderRadius: 18, background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: 6 };
const noteLabel = { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "#64748b", fontWeight: 900 };
const textarea = { width: "100%", minHeight: 92, padding: "12px 14px", borderRadius: 16, border: "1px solid #cbd5e1", boxSizing: "border-box", resize: "vertical" };
const approveBtn = { border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", borderRadius: 14, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const completeBtn = { border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", borderRadius: 14, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const rejectBtn = { border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", borderRadius: 14, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
