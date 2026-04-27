import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { getRole, isLoggedIn, updateStoredAuth } from "../../lib/authStore";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";
import { getFavoriteIds, getFavoriteServices, getMyBookings, getMyProfile, updateMyProfile } from "./api";

function bookingStatusTone(status) {
  if (status === "CONFIRMED") return { background: "#ecfdf5", color: "#047857", border: "#bbf7d0" };
  if (status === "PENDING") return { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" };
  if (status === "REJECTED") return { background: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
  return { background: "#f8fafc", color: "#475569", border: "#cbd5e1" };
}

function formatStatus(status) {
  if (status === "PENDING") return "Pending";
  if (status === "CONFIRMED") return "Confirmed";
  if (status === "REJECTED") return "Rejected";
  if (status === "CANCELED") return "Canceled";
  return status;
}

function formatBookingTime(startAt) {
  return new Date(startAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function favoriteImage(item) {
  return resolveBackendImage(item?.coverImageUrl) || serviceFallbackImage(item);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [favoritePreview, setFavoritePreview] = useState([]);
  const [bookingPreview, setBookingPreview] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      navigate("/");
      return;
    }

    Promise.all([
      getMyProfile(),
      getFavoriteIds().catch(() => []),
      getFavoriteServices().catch(() => []),
      getMyBookings().catch(() => []),
    ])
      .then(([profile, favoriteIds, favorites, bookings]) => {
        setForm({
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone || "",
        });
        setFavoriteCount(favoriteIds.length);
        setBookingCount(bookings.length);
        setFavoritePreview(favorites.slice(0, 3));
        setBookingPreview(bookings.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const firstName = useMemo(() => form.firstName?.trim() || "Client", [form.firstName]);

  function onChange(event) {
    setNotice(null);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const profile = await updateMyProfile({
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || null,
      });

      updateStoredAuth({
        username: profile.username,
        email: profile.email,
      });

      setNotice({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={page}>
      <Header />
      <div style={content}>
        <div style={hero}>
          <div>
            <div style={eyebrow}>Client Profile</div>
            <h1 style={title}>My Profile</h1>
            <p style={subtitle}>Welcome back, {firstName}. Keep your details current and jump back into the services you care about.</p>
          </div>

          <div style={heroStats}>
            <StatCard label="Saved services" value={favoriteCount} tone="blue" />
            <StatCard label="Booking requests" value={bookingCount} tone="green" />
          </div>
        </div>

        <div style={layout}>
          <section style={leftColumn}>
            <div style={card}>
              <div style={sectionHeader}>
                <div>
                  <div style={sectionEyebrow}>Account</div>
                  <div style={sectionTitle}>Profile details</div>
                </div>
                <div style={miniPill}>Client account</div>
              </div>

              {notice && (
                <div
                  style={{
                    ...noticeBox,
                    background: notice.type === "success" ? "#ecfdf5" : "#fef2f2",
                    borderColor: notice.type === "success" ? "#bbf7d0" : "#fecaca",
                    color: notice.type === "success" ? "#047857" : "#b91c1c",
                  }}
                >
                  {notice.text}
                </div>
              )}

              {loading ? (
                <div style={{ color: "#64748b" }}>Loading profile...</div>
              ) : (
                <form onSubmit={onSubmit} style={formGrid}>
                  <div style={gridTwo}>
                    <Field label="Username" name="username" value={form.username} onChange={onChange} required />
                    <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
                  </div>

                  <div style={gridTwo}>
                    <Field label="First name" name="firstName" value={form.firstName} onChange={onChange} required />
                    <Field label="Last name" name="lastName" value={form.lastName} onChange={onChange} required />
                  </div>

                  <Field label="Phone" name="phone" value={form.phone} onChange={onChange} />

                  <button type="submit" style={saveButton} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </form>
              )}
            </div>
          </section>

          <aside style={rightColumn}>
            <div style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sectionEyebrow}>Quick access</div>
                  <div style={sideTitle}>Your client hub</div>
                </div>
              </div>

              <div style={quickLinks}>
                <Link to="/favorites" style={quickLink}>Open favorites</Link>
                <Link to="/my-bookings" style={quickLink}>Open bookings</Link>
              </div>
            </div>

            <div style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sectionEyebrow}>Favorites</div>
                  <div style={sideTitle}>Saved services</div>
                </div>
                <Link to="/favorites" style={inlineLink}>View all</Link>
              </div>

              {favoritePreview.length === 0 ? (
                <div style={emptyState}>You have not saved any services yet.</div>
              ) : (
                <div style={previewGrid}>
                  {favoritePreview.map((item) => (
                    <Link key={item.id} to={`/services/${item.id}`} style={favoritePreviewCard}>
                      <img src={favoriteImage(item)} alt={item.title} style={favoritePreviewImage} />
                      <div style={favoritePreviewBody}>
                        <div style={favoritePreviewTitle}>{item.title}</div>
                        <div style={favoritePreviewMeta}>{item.city} • {item.price} lv</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sectionEyebrow}>Bookings</div>
                  <div style={sideTitle}>Latest requests</div>
                </div>
                <Link to="/my-bookings" style={inlineLink}>View all</Link>
              </div>

              {bookingPreview.length === 0 ? (
                <div style={emptyState}>Your booking requests will appear here.</div>
              ) : (
                <div style={bookingPreviewList}>
                  {bookingPreview.map((item) => (
                    <Link key={item.id} to={`/services/${item.serviceId}`} style={bookingPreviewCard}>
                      <div>
                        <div style={bookingPreviewTitle}>{item.title}</div>
                        <div style={bookingPreviewMeta}>{formatBookingTime(item.startAt)}</div>
                      </div>
                      <div style={{ ...statusChip, ...bookingStatusTone(item.status) }}>{formatStatus(item.status)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const palette = {
    blue: { background: "rgba(255,255,255,0.74)", border: "rgba(191,219,254,0.95)", color: "#1d4ed8" },
    green: { background: "rgba(236,253,245,0.92)", border: "rgba(187,247,208,0.95)", color: "#047857" },
  };

  return (
    <div style={{ ...statCard, background: palette[tone].background, borderColor: palette[tone].border }}>
      <div style={{ ...statValue, color: palette[tone].color }}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      <input {...props} style={fieldInput} />
    </label>
  );
}

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top left, rgba(219,234,254,0.55) 0%, rgba(248,250,252,0.96) 26%, #f8fafc 66%)",
};
const content = { maxWidth: 1180, margin: "0 auto", padding: "18px 16px 28px" };
const hero = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 0.9fr)",
  gap: 18,
  padding: 24,
  borderRadius: 28,
  background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #fff 100%)",
  border: "1px solid #dbeafe",
  boxShadow: "0 28px 80px rgba(148,163,184,0.14)",
};
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2563eb" };
const title = { margin: "10px 0 8px", fontSize: 38, lineHeight: 1.04, color: "#0f172a" };
const subtitle = { margin: 0, maxWidth: 640, color: "#475569", lineHeight: 1.7 };
const heroStats = { display: "grid", gap: 12, alignContent: "start" };
const statCard = { padding: 18, borderRadius: 20, border: "1px solid" };
const statValue = { fontSize: 32, fontWeight: 900, lineHeight: 1 };
const statLabel = { marginTop: 8, color: "#475569", fontWeight: 700 };
const layout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.95fr)",
  gap: 18,
  marginTop: 18,
  alignItems: "start",
};
const leftColumn = { minWidth: 0 };
const rightColumn = { display: "grid", gap: 18 };
const card = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 26,
  padding: 24,
  boxShadow: "0 24px 60px rgba(148,163,184,0.12)",
};
const sideCard = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 18,
  boxShadow: "0 20px 46px rgba(148,163,184,0.1)",
};
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 14, marginBottom: 16 };
const sideHeader = { display: "flex", justifyContent: "space-between", alignItems: "start", gap: 14, marginBottom: 14 };
const sectionEyebrow = { fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb" };
const sectionTitle = { marginTop: 8, fontSize: 26, fontWeight: 900, color: "#0f172a" };
const sideTitle = { marginTop: 6, fontSize: 22, fontWeight: 900, color: "#0f172a" };
const miniPill = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontWeight: 800,
  fontSize: 12,
};
const quickLinks = { display: "grid", gap: 10 };
const quickLink = {
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #bfdbfe",
  background: "#fff",
  color: "#1d4ed8",
  fontWeight: 800,
};
const inlineLink = { textDecoration: "none", color: "#2563eb", fontWeight: 800, fontSize: 14 };
const noticeBox = {
  marginBottom: 16,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid",
  fontWeight: 700,
};
const formGrid = { display: "grid", gap: 14 };
const gridTwo = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const fieldWrap = { display: "grid", gap: 6 };
const fieldLabel = { fontWeight: 800, color: "#0f172a", fontSize: 13 };
const fieldInput = { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: "1px solid #cbd5e1" };
const saveButton = { marginTop: 6, padding: "13px 16px", borderRadius: 14, border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer" };
const previewGrid = { display: "grid", gap: 12 };
const favoritePreviewCard = {
  display: "grid",
  gridTemplateColumns: "94px minmax(0, 1fr)",
  gap: 12,
  textDecoration: "none",
  color: "inherit",
  alignItems: "center",
  padding: 10,
  borderRadius: 18,
  background: "#fff",
  border: "1px solid #e2e8f0",
};
const favoritePreviewImage = { width: "100%", height: 78, borderRadius: 14, objectFit: "cover", display: "block" };
const favoritePreviewBody = { minWidth: 0 };
const favoritePreviewTitle = { fontWeight: 900, color: "#0f172a", lineHeight: 1.2 };
const favoritePreviewMeta = { marginTop: 6, color: "#64748b", fontSize: 14 };
const bookingPreviewList = { display: "grid", gap: 10 };
const bookingPreviewCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  textDecoration: "none",
  color: "inherit",
  padding: "12px 14px",
  borderRadius: 18,
  background: "#fff",
  border: "1px solid #e2e8f0",
};
const bookingPreviewTitle = { fontWeight: 900, color: "#0f172a", lineHeight: 1.2 };
const bookingPreviewMeta = { marginTop: 6, color: "#64748b", fontSize: 14 };
const statusChip = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid",
  fontWeight: 900,
  fontSize: 12,
  whiteSpace: "nowrap",
};
const emptyState = {
  padding: "14px 16px",
  borderRadius: 16,
  background: "#fff",
  border: "1px dashed #cbd5e1",
  color: "#64748b",
  lineHeight: 1.7,
};
