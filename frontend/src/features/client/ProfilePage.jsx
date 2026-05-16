import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { getRole, isLoggedIn, updateStoredAuth } from "../../lib/authStore";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";
import { changeMyPassword, getFavoriteIds, getFavoriteServices, getMyBookings, getMyProfile, updateMyProfile, uploadMyProfilePhoto, verifyMyPassword } from "./api";

function bookingStatusTone(status) {
  if (status === "CONFIRMED") return { background: "#ecfdf5", color: "#047857", border: "#bbf7d0" };
  if (status === "PENDING") return { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" };
  if (status === "REJECTED") return { background: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
  return { background: "#f8fafc", color: "#475569", border: "#cbd5e1" };
}

function formatStatus(status) {
  if (status === "PENDING") return "Изчакваща";
  if (status === "CONFIRMED") return "Потвърдена";
  if (status === "REJECTED") return "Отказана";
  if (status === "CANCELED") return "Отменена";
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
  const [unlocked, setUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    photoUrl: null,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
          photoUrl: profile.photoUrl || null,
        });
        updateStoredAuth({
          profilePhotoUrl: profile.photoUrl || null,
        });
        setFavoriteCount(favoriteIds.length);
        setBookingCount(bookings.length);
        setFavoritePreview(favorites.slice(0, 3));
        setBookingPreview(bookings.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const firstName = useMemo(() => form.firstName?.trim() || "Клиент", [form.firstName]);
  const profileDisplayName = useMemo(() => {
    const fullName = `${form.firstName?.trim() || ""} ${form.lastName?.trim() || ""}`.trim();
    return fullName || form.username?.trim() || "Клиентски профил";
  }, [form.firstName, form.lastName, form.username]);

  function onChange(event) {
    setNotice(null);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function onPasswordFormChange(event) {
    setNotice(null);
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onUnlock(event) {
    event.preventDefault();
    setUnlocking(true);
    setNotice(null);

    try {
      await verifyMyPassword(unlockPassword);
      setUnlocked(true);
      setUnlockPassword("");
      setNotice({ type: "success", text: "Детайлите на профила са отключени." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setUnlocking(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!unlocked) {
      setNotice({ type: "error", text: "Отключи профила с текущата си парола, за да редактираш данните." });
      return;
    }
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

      setNotice({ type: "success", text: "Профилът беше обновен успешно." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function onPasswordSubmit(event) {
    event.preventDefault();
    setPasswordSaving(true);
    setNotice(null);

    try {
      await changeMyPassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setNotice({ type: "success", text: "Паролата беше сменена успешно." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setPasswordSaving(false);
    }
  }

  async function onPhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setNotice(null);

    try {
      const profile = await uploadMyProfilePhoto(file);
      setForm((current) => ({ ...current, photoUrl: profile.photoUrl || null }));
      updateStoredAuth({ profilePhotoUrl: profile.photoUrl || null });
      setNotice({ type: "success", text: "Профилната снимка беше обновена успешно." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setPhotoUploading(false);
      event.target.value = "";
    }
  }

  const profilePhoto = resolveBackendImage(form.photoUrl);

  return (
    <div style={page}>
      <Header />
      <div style={content}>
        <div style={hero}>
          <div style={heroIntro}>
            <div style={profileHeroAvatarWrap}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Профилна снимка" style={profileHeroAvatar} />
              ) : (
                <div style={profileHeroFallback}>👤</div>
              )}
            </div>
            <div>
            <div style={eyebrow}>Клиентски профил</div>
            <h1 style={title}>{profileDisplayName}</h1>
            <p style={subtitle}>Здравей, {firstName}. Поддържай данните си актуални и се връщай бързо към услугите, които те интересуват.</p>
            </div>
          </div>

          <div style={heroStats}>
            <StatCard label="Любими услуги" value={favoriteCount} tone="blue" />
            <StatCard label="Резервации" value={bookingCount} tone="green" />
          </div>
        </div>

        <div style={layout}>
          <section style={leftColumn}>
            <div style={card}>
              <div style={sectionHeader}>
                <div>
                  <div style={sectionEyebrow}>Профил</div>
                  <div style={sectionTitle}>Детайли за профила</div>
                </div>
                <div style={miniPill}>Клиентски профил</div>
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
                <div style={{ color: "#64748b" }}>Зареждане на профила...</div>
              ) : (
                <div style={formGrid}>
                  {!unlocked ? (
                    <>
                      <div style={lockedGrid}>
                        <MaskedField label="Потребителско име" />
                        <MaskedField label="Имейл" />
                        <MaskedField label="Име" />
                        <MaskedField label="Фамилия" />
                        <MaskedField label="Телефон" />
                      </div>

                      <form onSubmit={onUnlock} style={unlockCard}>
                        <div>
                          <div style={unlockTitle}>Отключи детайлите</div>
                          <div style={unlockText}>Въведи текущата си парола, за да видиш и редактираш профилните данни.</div>
                        </div>
                        <div style={unlockRow}>
                          <Field
                            label="Текуща парола"
                            name="unlockPassword"
                            type="password"
                            value={unlockPassword}
                            onChange={(event) => setUnlockPassword(event.target.value)}
                            required
                          />
                          <button type="submit" style={unlockButton} disabled={unlocking}>
                            {unlocking ? "Проверка..." : "Отключи"}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <>
                      <div style={photoCard}>
                        <div style={photoCardTop}>
                          <div>
                            <div style={passwordTitle}>Профилна снимка</div>
                            <div style={unlockText}>Качи снимка сега или на по-късен етап. Ако няма качена снимка, профилът ще остане със стандартната икона.</div>
                          </div>
                          <div style={profilePreviewAvatarWrap}>
                            {profilePhoto ? (
                              <img src={profilePhoto} alt="Профилна снимка" style={profilePreviewAvatar} />
                            ) : (
                              <div style={profilePreviewFallback}>👤</div>
                            )}
                          </div>
                        </div>

                        <label style={photoUploadButton}>
                          <input type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
                          {photoUploading ? "Качване..." : "Добави снимка"}
                        </label>
                      </div>

                      <form onSubmit={onSubmit} style={formGrid}>
                        <div style={gridTwo}>
                          <Field label="Потребителско име" name="username" value={form.username} onChange={onChange} required />
                          <Field label="Имейл" name="email" type="email" value={form.email} onChange={onChange} required />
                        </div>

                        <div style={gridTwo}>
                          <Field label="Име" name="firstName" value={form.firstName} onChange={onChange} required />
                          <Field label="Фамилия" name="lastName" value={form.lastName} onChange={onChange} required />
                        </div>

                        <Field label="Телефон" name="phone" value={form.phone} onChange={onChange} />

                        <button type="submit" style={saveButton} disabled={saving}>
                          {saving ? "Запазване..." : "Запази промените"}
                        </button>
                      </form>

                      <form onSubmit={onPasswordSubmit} style={passwordCard}>
                        <div>
                          <div style={passwordTitle}>Смяна на парола</div>
                          <div style={unlockText}>Използвай текущата си парола и въведи нова, за да обновиш достъпа до профила.</div>
                        </div>

                        <div style={gridTwo}>
                          <Field
                            label="Текуща парола"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={onPasswordFormChange}
                            required
                          />
                          <Field
                            label="Нова парола"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={onPasswordFormChange}
                            required
                          />
                        </div>

                        <Field
                          label="Потвърди новата парола"
                          name="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={onPasswordFormChange}
                          required
                        />

                        <button type="submit" style={saveButton} disabled={passwordSaving}>
                          {passwordSaving ? "Запазване..." : "Смени паролата"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside style={rightColumn}>
            <div style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sectionEyebrow}>Бърз достъп</div>
                  <div style={sideTitle}>Твоето клиентско място</div>
                </div>
              </div>

              <div style={quickLinks}>
                <Link to="/favorites" style={quickLink}>Отвори любими</Link>
                <Link to="/my-bookings" style={quickLink}>Отвори резервации</Link>
              </div>
            </div>

            <div style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sectionEyebrow}>Любими</div>
                  <div style={sideTitle}>Любими услуги</div>
                </div>
                <Link to="/favorites" style={inlineLink}>Виж всички</Link>
              </div>

              {favoritePreview.length === 0 ? (
                <div style={emptyState}>Все още нямаш любими услуги.</div>
              ) : (
                <div style={previewGrid}>
                  {favoritePreview.map((item) => (
                    <Link key={item.id} to={`/services/${item.id}`} style={favoritePreviewCard}>
                      <img src={favoriteImage(item)} alt={item.title} style={favoritePreviewImage} />
                      <div style={favoritePreviewBody}>
                        <div style={favoritePreviewTitle}>{item.title}</div>
                        <div style={favoritePreviewMeta}>{item.city} • €{item.price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sectionEyebrow}>Резервации</div>
                  <div style={sideTitle}>Последни заявки</div>
                </div>
                <Link to="/my-bookings" style={inlineLink}>Виж всички</Link>
              </div>

              {bookingPreview.length === 0 ? (
                <div style={emptyState}>Твоите резервации ще се появят тук.</div>
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
    blue: { background: "rgba(15,23,42,0.46)", border: "rgba(96,165,250,0.24)", color: "#93c5fd" },
    green: { background: "rgba(8,37,34,0.5)", border: "rgba(52,211,153,0.24)", color: "#6ee7b7" },
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

function MaskedField({ label }) {
  return (
    <div style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      <div style={maskedField}>••••••••••••</div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 14%, #eaf2ff 42%, #f6f9ff 100%)",
};
const content = { maxWidth: 1180, margin: "0 auto", padding: "18px 16px 28px" };
const hero = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 0.9fr)",
  gap: 18,
  padding: 24,
  borderRadius: 28,
  background: "linear-gradient(135deg, rgba(7,15,31,0.94) 0%, rgba(13,33,70,0.96) 55%, rgba(24,64,132,0.92) 100%)",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 28px 80px rgba(2,6,23,0.24)",
};
const heroIntro = { display: "grid", gridTemplateColumns: "92px minmax(0, 1fr)", gap: 18, alignItems: "center" };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#93c5fd" };
const title = { margin: "10px 0 8px", fontSize: 38, lineHeight: 1.04, color: "#eff6ff" };
const subtitle = { margin: 0, maxWidth: 640, color: "rgba(226,232,240,0.78)", lineHeight: 1.7 };
const profileHeroAvatarWrap = {
  width: 92,
  height: 92,
  borderRadius: 999,
  overflow: "hidden",
  border: "1px solid #bfdbfe",
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.12)",
};
const profileHeroAvatar = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const profileHeroFallback = { width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 34 };
const heroStats = { display: "grid", gap: 12, alignContent: "start" };
const statCard = { padding: 18, borderRadius: 20, border: "1px solid" };
const statValue = { fontSize: 32, fontWeight: 900, lineHeight: 1 };
const statLabel = { marginTop: 8, color: "#cbd5e1", fontWeight: 700 };
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
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  borderRadius: 26,
  padding: 24,
  boxShadow: "0 24px 60px rgba(2,6,23,0.22)",
};
const sideCard = {
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  borderRadius: 24,
  padding: 18,
  boxShadow: "0 20px 46px rgba(2,6,23,0.22)",
};
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 14, marginBottom: 16 };
const sideHeader = { display: "flex", justifyContent: "space-between", alignItems: "start", gap: 14, marginBottom: 14 };
const sectionEyebrow = { fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd" };
const sectionTitle = { marginTop: 8, fontSize: 26, fontWeight: 900, color: "#eff6ff" };
const sideTitle = { marginTop: 6, fontSize: 22, fontWeight: 900, color: "#eff6ff" };
const miniPill = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(96,165,250,0.24)",
  color: "#bfdbfe",
  fontWeight: 800,
  fontSize: 12,
};
const quickLinks = { display: "grid", gap: 10 };
const quickLink = {
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #bfdbfe",
  background: "rgba(15,23,42,0.42)",
  color: "#bfdbfe",
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
const fieldLabel = { fontWeight: 800, color: "#cbd5e1", fontSize: 13 };
const fieldInput = { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 14, border: "1px solid rgba(96,165,250,0.24)", background: "rgba(15,23,42,0.44)", color: "#eff6ff" };
const maskedField = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.24)",
  background: "rgba(15,23,42,0.42)",
  color: "#cbd5e1",
  fontWeight: 900,
  letterSpacing: "0.12em",
};
const lockedGrid = { display: "grid", gap: 12 };
const unlockCard = {
  marginTop: 4,
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(15,23,42,0.32)",
  display: "grid",
  gap: 14,
};
const passwordCard = {
  marginTop: 8,
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(15,23,42,0.32)",
  display: "grid",
  gap: 14,
};
const photoCard = {
  marginTop: 4,
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(15,23,42,0.32)",
  display: "grid",
  gap: 14,
};
const photoCardTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};
const profilePreviewAvatarWrap = {
  width: 72,
  height: 72,
  borderRadius: 999,
  overflow: "hidden",
  border: "1px solid #bfdbfe",
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  flexShrink: 0,
};
const profilePreviewAvatar = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const profilePreviewFallback = { width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 28 };
const photoUploadButton = {
  display: "inline-flex",
  width: "fit-content",
  padding: "12px 16px",
  borderRadius: 14,
  background: "#0f172a",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
const unlockTitle = { fontSize: 20, fontWeight: 900, color: "#eff6ff" };
const passwordTitle = { fontSize: 20, fontWeight: 900, color: "#eff6ff" };
const unlockText = { marginTop: 6, color: "rgba(226,232,240,0.74)", lineHeight: 1.65 };
const unlockRow = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "end",
};
const unlockButton = {
  padding: "13px 16px",
  borderRadius: 14,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
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
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(96,165,250,0.22)",
};
const favoritePreviewImage = { width: "100%", height: 78, borderRadius: 14, objectFit: "cover", display: "block" };
const favoritePreviewBody = { minWidth: 0 };
const favoritePreviewTitle = { fontWeight: 900, color: "#eff6ff", lineHeight: 1.2 };
const favoritePreviewMeta = { marginTop: 6, color: "rgba(226,232,240,0.74)", fontSize: 14 };
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
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(96,165,250,0.22)",
};
const bookingPreviewTitle = { fontWeight: 900, color: "#eff6ff", lineHeight: 1.2 };
const bookingPreviewMeta = { marginTop: 6, color: "rgba(226,232,240,0.74)", fontSize: 14 };
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
  background: "rgba(15,23,42,0.36)",
  border: "1px dashed rgba(96,165,250,0.22)",
  color: "rgba(226,232,240,0.74)",
  lineHeight: 1.7,
};
