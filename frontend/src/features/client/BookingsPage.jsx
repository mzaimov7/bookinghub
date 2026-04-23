import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { getMyBookings } from "./api";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";

function bookingImage(item) {
  return resolveBackendImage(item?.coverImageUrl) || serviceFallbackImage(item);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      navigate("/");
      return;
    }

    getMyBookings().then(setBookings).catch(() => setBookings([]));
  }, [navigate]);

  const summary = useMemo(() => {
    return bookings.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "PENDING") acc.pending += 1;
        if (item.status === "CONFIRMED") acc.confirmed += 1;
        if (item.status === "REJECTED" || item.status === "CANCELED") acc.closed += 1;
        return acc;
      },
      { total: 0, pending: 0, confirmed: 0, closed: 0 }
    );
  }, [bookings]);

  return (
    <div style={page}>
      <Header />
      <div style={content}>
        <section style={hero}>
          <div>
            <div style={eyebrow}>Booking Timeline</div>
            <h1 style={title}>My Bookings</h1>
            <p style={subtitle}>
              Follow every reservation request from the first click to the final status in one clear timeline.
            </p>
          </div>

          <div style={summaryGrid}>
            <SummaryCard value={summary.total} label="All requests" tone="slate" />
            <SummaryCard value={summary.pending} label="Pending" tone="amber" />
            <SummaryCard value={summary.confirmed} label="Confirmed" tone="green" />
          </div>
        </section>

        {bookings.length === 0 ? (
          <div style={emptyCard}>
            <div style={emptyTitle}>No bookings yet</div>
            <p style={emptyText}>Once you reserve a slot, your request timeline will start here.</p>
            <Link to="/" style={emptyLink}>Book your first service</Link>
          </div>
        ) : (
          <section style={timelineWrap}>
            <div style={sectionHeader}>
              <div>
                <div style={sectionEyebrow}>Reservation tracker</div>
                <div style={sectionTitle}>Requests and upcoming visits</div>
              </div>
              <Link to="/" style={sectionAction}>Find another service</Link>
            </div>

            <div style={timelineList}>
              {bookings.map((item) => (
                <article key={item.id} style={bookingCard}>
                  <div style={timelineRail}>
                    <div style={timelineDot(item.status)} />
                    <div style={timelineLine} />
                  </div>

                  <div style={dateCard}>
                    <div style={dateDay}>{formatDate(item.startAt)}</div>
                    <div style={dateTime}>
                      {formatTime(item.startAt)} - {formatTime(item.endAt)}
                    </div>
                    <div style={dateMeta}>{item.durationMinutes} min</div>
                  </div>

                  <div style={bookingMain}>
                    <div style={bookingTop}>
                      <div>
                        <div style={locationLine}>{item.city}{item.address ? ` • ${item.address}` : ""}</div>
                        <div style={bookingTitle}>{item.title}</div>
                      </div>
                      <div style={statusBadge(item.status)}>{formatStatus(item.status)}</div>
                    </div>

                    <div style={bookingBody}>
                      <img
                        src={bookingImage(item)}
                        alt={item.title}
                        style={bookingImageStyle}
                        onError={(event) => {
                          event.currentTarget.src = serviceFallbackImage(item);
                        }}
                      />

                      <div style={bookingInfo}>
                        <div style={infoGrid}>
                          <InfoPill label="Price" value={`${item.price} lv`} />
                          <InfoPill label="Duration" value={`${item.durationMinutes} min`} />
                          <InfoPill label="Requested on" value={formatDate(item.createdAt)} />
                          <InfoPill label="Status" value={formatStatus(item.status)} />
                        </div>

                        {item.clientNote ? (
                          <div style={noteBox}>
                            <div style={noteLabel}>Your note</div>
                            <div style={noteText}>{item.clientNote}</div>
                          </div>
                        ) : (
                          <div style={noteBoxMuted}>
                            <div style={noteLabel}>Your note</div>
                            <div style={noteText}>No extra note was added to this request.</div>
                          </div>
                        )}

                        <div style={ctaRow}>
                          <Link to={`/services/${item.serviceId}`} style={primaryAction}>
                            Open service
                          </Link>
                        </div>
                      </div>
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

function SummaryCard({ value, label, tone }) {
  const palette = {
    slate: { background: "rgba(255,255,255,0.74)", border: "rgba(203,213,225,0.9)", value: "#0f172a" },
    amber: { background: "rgba(255,251,235,0.9)", border: "rgba(253,230,138,0.9)", value: "#b45309" },
    green: { background: "rgba(236,253,245,0.92)", border: "rgba(187,247,208,0.95)", value: "#047857" },
  };

  return (
    <div style={{ ...summaryCard, background: palette[tone].background, borderColor: palette[tone].border }}>
      <div style={{ ...summaryValue, color: palette[tone].value }}>{value}</div>
      <div style={summaryLabel}>{label}</div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div style={infoPill}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{value}</div>
    </div>
  );
}

function formatStatus(status) {
  if (status === "PENDING") return "Pending";
  if (status === "CONFIRMED") return "Confirmed";
  if (status === "REJECTED") return "Rejected";
  if (status === "CANCELED") return "Canceled";
  return status;
}

function statusBadge(status) {
  const palette = {
    PENDING: { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    CONFIRMED: { background: "#ecfdf5", color: "#047857", border: "#bbf7d0" },
    REJECTED: { background: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    CANCELED: { background: "#f8fafc", color: "#475569", border: "#cbd5e1" },
  };

  return {
    padding: "9px 13px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    border: "1px solid",
    ...palette[status],
  };
}

function timelineDot(status) {
  const colors = {
    PENDING: "#f97316",
    CONFIRMED: "#10b981",
    REJECTED: "#ef4444",
    CANCELED: "#94a3b8",
  };

  return {
    width: 16,
    height: 16,
    borderRadius: 999,
    background: colors[status] || "#2563eb",
    boxShadow: `0 0 0 5px ${status === "PENDING" ? "rgba(249,115,22,0.16)" : status === "CONFIRMED" ? "rgba(16,185,129,0.16)" : status === "REJECTED" ? "rgba(239,68,68,0.14)" : "rgba(148,163,184,0.16)"}`,
  };
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(187,247,208,0.42) 0%, rgba(248,250,252,0.96) 24%, #f8fafc 64%)",
};
const content = { maxWidth: 1180, margin: "0 auto", padding: "18px 16px 28px" };
const hero = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.35fr) minmax(300px, 0.95fr)",
  gap: 18,
  padding: 24,
  borderRadius: 32,
  background: "linear-gradient(135deg, rgba(220,252,231,0.9) 0%, rgba(255,255,255,0.96) 55%, rgba(239,246,255,0.92) 100%)",
  border: "1px solid rgba(187,247,208,0.95)",
  boxShadow: "0 28px 80px rgba(148,163,184,0.16)",
};
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#0f766e" };
const title = { margin: "12px 0 10px", fontSize: 42, lineHeight: 1.02, color: "#0f172a" };
const subtitle = { margin: 0, maxWidth: 560, color: "#475569", lineHeight: 1.75, fontSize: 16 };
const summaryGrid = { display: "grid", gap: 12, alignContent: "start" };
const summaryCard = { border: "1px solid", borderRadius: 22, padding: "18px 18px 16px", backdropFilter: "blur(10px)" };
const summaryValue = { fontSize: 30, fontWeight: 900, lineHeight: 1 };
const summaryLabel = { marginTop: 8, color: "#475569", fontWeight: 700 };
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
const timelineWrap = { marginTop: 18 };
const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 18,
  marginBottom: 16,
};
const sectionEyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b" };
const sectionTitle = { marginTop: 8, fontSize: 30, fontWeight: 900, color: "#0f172a" };
const sectionAction = {
  textDecoration: "none",
  color: "#2563eb",
  fontWeight: 800,
  padding: "10px 14px",
  borderRadius: 999,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
};
const timelineList = { display: "grid", gap: 18 };
const bookingCard = {
  display: "grid",
  gridTemplateColumns: "28px minmax(120px, 170px) minmax(0, 1fr)",
  gap: 16,
  alignItems: "start",
  padding: 20,
  borderRadius: 28,
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
  border: "1px solid rgba(226,232,240,0.95)",
  boxShadow: "0 24px 60px rgba(148,163,184,0.14)",
};
const timelineRail = { display: "grid", justifyItems: "center", alignSelf: "stretch" };
const timelineLine = { width: 2, flex: 1, minHeight: 120, background: "linear-gradient(180deg, #bfdbfe 0%, #e2e8f0 100%)", marginTop: 10 };
const dateCard = {
  padding: "16px 14px",
  borderRadius: 22,
  background: "#0f172a",
  color: "#fff",
  display: "grid",
  gap: 8,
  alignContent: "start",
};
const dateDay = { fontWeight: 900, fontSize: 18, lineHeight: 1.2 };
const dateTime = { color: "rgba(255,255,255,0.88)", fontWeight: 700 };
const dateMeta = {
  marginTop: 2,
  display: "inline-flex",
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.1)",
  fontSize: 12,
  fontWeight: 800,
};
const bookingMain = { display: "grid", gap: 16 };
const bookingTop = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" };
const locationLine = { color: "#64748b", fontSize: 13, fontWeight: 700 };
const bookingTitle = { marginTop: 8, fontSize: 28, lineHeight: 1.08, fontWeight: 900, color: "#0f172a" };
const bookingBody = { display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 16 };
const bookingImageStyle = {
  width: "100%",
  height: 220,
  borderRadius: 22,
  objectFit: "cover",
  boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
};
const bookingInfo = { display: "grid", gap: 14, alignContent: "start" };
const infoGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 };
const infoPill = {
  padding: "13px 14px",
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #e2e8f0",
};
const infoLabel = { fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" };
const infoValue = { marginTop: 5, fontWeight: 800, color: "#0f172a" };
const noteBox = {
  padding: "15px 16px",
  borderRadius: 18,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
};
const noteBoxMuted = {
  padding: "15px 16px",
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};
const noteLabel = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" };
const noteText = { marginTop: 8, color: "#334155", lineHeight: 1.7 };
const ctaRow = { display: "flex", gap: 10, flexWrap: "wrap" };
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
