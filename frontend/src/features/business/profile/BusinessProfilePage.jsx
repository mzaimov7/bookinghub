import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../../components/layout/Footer";
import Header from "../../../components/layout/Header";
import { resolveBackendImage } from "../../../lib/assets";
import { getRole, isLoggedIn, updateStoredAuth } from "../../../lib/authStore";
import { changeMyBusinessPassword, getMyBusinessProfile, updateMyBusinessProfile, uploadMyBusinessProfilePhoto, verifyMyBusinessPassword } from "./api";

export default function BusinessProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    providerType: "COMPANY",
    businessName: "",
    city: "",
    address: "",
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
    if (getRole() !== "BUSINESS") {
      navigate("/");
      return;
    }

    getMyBusinessProfile()
      .then((profile) => {
        setForm({
          username: profile.username,
          email: profile.email,
          providerType: profile.providerType,
          businessName: profile.businessName,
          city: profile.city,
          address: profile.address || "",
          phone: profile.phone || "",
          photoUrl: profile.photoUrl || null,
        });
        updateStoredAuth({ profilePhotoUrl: profile.photoUrl || null });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const profileDisplayName = useMemo(
    () => form.businessName?.trim() || form.username?.trim() || "Бизнес профил",
    [form.businessName, form.username]
  );
  const profilePhoto = resolveBackendImage(form.photoUrl);

  function onChange(event) {
    setNotice(null);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function onPasswordFormChange(event) {
    setNotice(null);
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onPhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setNotice(null);

    try {
      const profile = await uploadMyBusinessProfilePhoto(file);
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

  async function onUnlock(event) {
    event.preventDefault();
    setUnlocking(true);
    setNotice(null);

    try {
      await verifyMyBusinessPassword(unlockPassword);
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
      const profile = await updateMyBusinessProfile({
        username: form.username,
        email: form.email,
        providerType: form.providerType,
        businessName: form.businessName,
        city: form.city,
        address: form.address || null,
        phone: form.phone || null,
      });

      updateStoredAuth({
        username: profile.username,
        email: profile.email,
        profilePhotoUrl: profile.photoUrl || null,
      });

      setNotice({ type: "success", text: "Бизнес профилът беше обновен успешно." });
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
      await changeMyBusinessPassword(passwordForm);
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

  return (
    <div style={page}>
      <Header />
      <div style={content}>
        <div style={hero}>
          <div style={heroIntro}>
            <div style={heroAvatarWrap}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Профилна снимка" style={heroAvatarImage} />
              ) : (
                <div style={businessHeroFallback}>🏢</div>
              )}
            </div>
            <div>
              <div style={eyebrow}>Бизнес профил</div>
              <h1 style={title}>{profileDisplayName}</h1>
              <p style={subtitle}>Поддържай фирмените данни актуални и управлявай достъпа до бизнес акаунта от едно място.</p>
            </div>
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
                <div style={miniPill}>Бизнес акаунт</div>
              </div>

              <div style={photoRow}>
                <div style={photoPreviewWrap}>
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Профилна снимка" style={photoPreviewImage} />
                  ) : (
                    <div style={photoPreviewFallback}>🏢</div>
                  )}
                </div>
                <label style={photoUploadButton}>
                  {photoUploading ? "Качване..." : "Добави снимка"}
                  <input type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
                </label>
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
                        <MaskedField label="Тип профил" />
                        <MaskedField label="Име на бизнеса" />
                        <MaskedField label="Град" />
                        <MaskedField label="Адрес" />
                        <MaskedField label="Телефон" />
                      </div>

                      <form onSubmit={onUnlock} style={unlockCard}>
                        <div>
                          <div style={unlockTitle}>Отключи детайлите</div>
                          <div style={unlockText}>Въведи текущата си парола, за да видиш и редактираш бизнес данните.</div>
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
                      <form onSubmit={onSubmit} style={formGrid}>
                        <div style={gridTwo}>
                          <Field label="Потребителско име" name="username" value={form.username} onChange={onChange} required />
                          <Field label="Имейл" name="email" type="email" value={form.email} onChange={onChange} required />
                        </div>

                        <div style={gridTwo}>
                          <label style={fieldWrap}>
                            <span style={fieldLabel}>Тип профил</span>
                            <select name="providerType" value={form.providerType} onChange={onChange} style={fieldInput}>
                              <option value="COMPANY">Компания</option>
                              <option value="INDIVIDUAL">Индивидуален</option>
                            </select>
                          </label>
                          <Field label="Име на бизнеса" name="businessName" value={form.businessName} onChange={onChange} required />
                        </div>

                        <div style={gridTwo}>
                          <Field label="Град" name="city" value={form.city} onChange={onChange} required />
                          <Field label="Телефон" name="phone" value={form.phone} onChange={onChange} />
                        </div>

                        <Field label="Адрес" name="address" value={form.address} onChange={onChange} />

                        <button type="submit" style={saveButton} disabled={saving}>
                          {saving ? "Запазване..." : "Запази промените"}
                        </button>
                      </form>

                      <form onSubmit={onPasswordSubmit} style={passwordCard}>
                        <div>
                          <div style={passwordTitle}>Смяна на парола</div>
                          <div style={unlockText}>Използвай текущата си парола и въведи нова, за да обновиш достъпа до бизнес профила.</div>
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
                  <div style={sideTitle}>Твоето бизнес място</div>
                </div>
              </div>

              <div style={quickLinks}>
                <Link to="/business" style={quickLink}>Отвори бизнес таблото</Link>
                <Link to="/business/services" style={quickLink}>Отвори обявите</Link>
                <Link to="/business/resources" style={quickLink}>Отвори персонала</Link>
                <Link to="/business/bookings" style={quickLink}>Отвори резервациите</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
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
    "radial-gradient(circle at top left, rgba(96,165,250,0.2) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, rgba(13,43,99,0.08) 0%, rgba(237,244,255,0.9) 20%, #f7faff 100%)",
};
const content = { maxWidth: 1180, margin: "0 auto", padding: "18px 16px 28px" };
const hero = {
  display: "grid",
  gap: 18,
  padding: 24,
  borderRadius: 28,
  background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #fff 100%)",
  border: "1px solid #dbeafe",
  boxShadow: "0 28px 80px rgba(148,163,184,0.14)",
};
const heroIntro = { display: "grid", gridTemplateColumns: "92px minmax(0, 1fr)", gap: 18, alignItems: "center" };
const heroAvatarWrap = { width: 92, height: 92, borderRadius: 999, overflow: "hidden", flexShrink: 0 };
const businessHeroFallback = {
  width: 92,
  height: 92,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 34,
  border: "1px solid #bfdbfe",
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.12)",
};
const heroAvatarImage = { width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 999 };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2563eb" };
const title = { margin: "10px 0 8px", fontSize: 38, lineHeight: 1.04, color: "#0f172a" };
const subtitle = { margin: 0, maxWidth: 640, color: "#475569", lineHeight: 1.7 };
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
const photoRow = { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 };
const photoPreviewWrap = { width: 64, height: 64, borderRadius: 999, overflow: "hidden", flexShrink: 0 };
const photoPreviewImage = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const photoPreviewFallback = {
  width: 64,
  height: 64,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 24,
  color: "#1e3a8a",
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  border: "1px solid #bfdbfe",
};
const photoUploadButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid #dbe4f0",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
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
const maskedField = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#475569",
  fontWeight: 900,
  letterSpacing: "0.12em",
};
const lockedGrid = { display: "grid", gap: 12 };
const unlockCard = {
  marginTop: 4,
  padding: 16,
  borderRadius: 18,
  border: "1px solid #dbe4f0",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  display: "grid",
  gap: 14,
};
const passwordCard = {
  marginTop: 8,
  padding: 16,
  borderRadius: 18,
  border: "1px solid #dbe4f0",
  background: "#f8fafc",
  display: "grid",
  gap: 14,
};
const unlockTitle = { fontSize: 20, fontWeight: 900, color: "#0f172a" };
const passwordTitle = { fontSize: 20, fontWeight: 900, color: "#0f172a" };
const unlockText = { marginTop: 6, color: "#64748b", lineHeight: 1.65 };
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
