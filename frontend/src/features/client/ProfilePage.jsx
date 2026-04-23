import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { getRole, isLoggedIn, updateStoredAuth } from "../../lib/authStore";
import { getFavoriteIds, getMyBookings, getMyProfile, updateMyProfile } from "./api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
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
      getMyBookings().catch(() => []),
    ])
      .then(([profile, favorites, bookings]) => {
        setForm({
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone || "",
        });
        setFavoriteCount(favorites.length);
        setBookingCount(bookings.length);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);

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

      alert("Profile updated successfully.");
    } catch (error) {
      alert(error.message);
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
            <p style={subtitle}>Review your account details and keep them up to date.</p>
          </div>
        </div>

        <div style={card}>
          <div style={personalSpace}>
            <div style={personalSpaceHeader}>
              <div>
                <div style={sectionEyebrow}>Personal space</div>
                <div style={sectionTitle}>Your client hub</div>
              </div>
              <div style={quickLinks}>
                <Link to="/favorites" style={quickLink}>Favorites</Link>
                <Link to="/my-bookings" style={quickLink}>Bookings</Link>
              </div>
            </div>

            <div style={statsGrid}>
              <StatCard label="Saved services" value={favoriteCount} tone="blue" />
              <StatCard label="Booking requests" value={bookingCount} tone="green" />
            </div>
          </div>

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
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const palette = {
    blue: { background: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    green: { background: "#ecfdf5", border: "#bbf7d0", color: "#047857" },
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

const page = { minHeight: "100vh", background: "#f8fafc" };
const content = { maxWidth: 1180, margin: "0 auto", padding: "18px 16px 28px" };
const hero = {
  padding: 20,
  borderRadius: 24,
  background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #fff 100%)",
  border: "1px solid #dbeafe",
};
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2563eb" };
const title = { margin: "10px 0 8px", fontSize: 34, color: "#0f172a" };
const subtitle = { margin: 0, color: "#475569", lineHeight: 1.6 };
const card = { marginTop: 18, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: 24 };
const personalSpace = { marginBottom: 20, padding: 18, borderRadius: 20, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%)", border: "1px solid #dbeafe" };
const personalSpaceHeader = { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 16 };
const sectionEyebrow = { fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb" };
const sectionTitle = { marginTop: 8, fontSize: 24, fontWeight: 900, color: "#0f172a" };
const quickLinks = { display: "flex", gap: 10, flexWrap: "wrap" };
const quickLink = { textDecoration: "none", padding: "10px 14px", borderRadius: 999, border: "1px solid #bfdbfe", background: "#fff", color: "#1d4ed8", fontWeight: 800 };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const statCard = { padding: 16, borderRadius: 18, border: "1px solid" };
const statValue = { fontSize: 30, fontWeight: 900, lineHeight: 1 };
const statLabel = { marginTop: 8, color: "#475569", fontWeight: 700 };
const formGrid = { display: "grid", gap: 14 };
const gridTwo = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const fieldWrap = { display: "grid", gap: 6 };
const fieldLabel = { fontWeight: 800, color: "#0f172a", fontSize: 13 };
const fieldInput = { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: "1px solid #cbd5e1" };
const saveButton = { marginTop: 6, padding: "13px 16px", borderRadius: 14, border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer" };
