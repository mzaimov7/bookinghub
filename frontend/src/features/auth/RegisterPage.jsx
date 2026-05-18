import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, uploadRegistrationPhoto } from "./api";
import logoPng from "../../assets/BookingHub-logo-auth.png";
import { resolveBackendImage } from "../../lib/assets";

const initialForm = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  bio: "",
  businessName: "",
  city: "",
  address: "",
  businessPhone: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("CLIENT");
  const [providerType, setProviderType] = useState("COMPANY");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function onPhotoChange(event) {
    const file = event.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit(event) {
    event.preventDefault();

    let uploadedPhotoUrl = null;
    if (photoFile) {
      uploadedPhotoUrl = await uploadRegistrationPhoto(photoFile);
    }

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      role,
    };

    if (role === "CLIENT") {
      payload.firstName = form.firstName.trim();
      payload.lastName = form.lastName.trim();
      payload.phone = form.phone.trim() || null;
      payload.photoUrl = uploadedPhotoUrl;
      payload.bio = form.bio.trim() || null;
    } else {
      payload.providerType = providerType;
      payload.businessName = form.businessName.trim();
      payload.city = form.city.trim();
      payload.address = form.address.trim() || null;
      payload.businessPhone = form.businessPhone.trim() || null;
      payload.businessPhotoUrl = uploadedPhotoUrl;
    }

    setLoading(true);

    try {
      await register(payload);
      alert("Профилът беше създаден успешно. Вече можеш да влезеш.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={shell}>
      <div style={backdropGlowOne} />
      <div style={backdropGlowTwo} />

      <div style={layout}>
        <img src={logoPng} alt="BookingHub" style={logoStyle} />

        <section style={formPanel}>
          <div style={card}>
            <div style={formHeader}>
              <span style={eyebrow}>Създаване на профил</span>
              <h2 style={title}>Регистрация</h2>
            </div>

            <div style={selectorGrid}>
              <RoleCard
                active={role === "CLIENT"}
                title="Клиент"
                subtitle="Личен профил"
                onClick={() => setRole("CLIENT")}
              />
              <RoleCard
                active={role === "BUSINESS"}
                title="Бизнес"
                subtitle="Профил за доставчик на услуги"
                onClick={() => setRole("BUSINESS")}
              />
            </div>

            <form onSubmit={onSubmit} style={formStyle}>
              <div style={gridTwo}>
                <Field
                  label="Потребителско име"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="Избери потребителско име"
                  disabled={loading}
                  required
                />
                <Field
                  label="Имейл"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="name@email.com"
                  disabled={loading}
                  required
                />
              </div>

              <Field
                label="Парола"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Създай парола"
                disabled={loading}
                required
              />

              {role === "CLIENT" ? (
                <>
                  <div style={sectionLabel}>Клиентски профил</div>
                  <div style={gridTwo}>
                    <Field
                      label="Име"
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      placeholder="Име"
                      disabled={loading}
                      required
                    />
                    <Field
                      label="Фамилия"
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      placeholder="Фамилия"
                      disabled={loading}
                      required
                    />
                  </div>
                  <Field
                    label="Телефон"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="По желание"
                    disabled={loading}
                  />
                  <TextAreaField
                    label="Биография"
                    name="bio"
                    value={form.bio}
                    onChange={onChange}
                    placeholder="Разкажи накратко за себе си"
                    disabled={loading}
                  />
                  <PhotoUploadCard
                    role={role}
                    photoPreview={photoPreview}
                    photoFile={photoFile}
                    onPhotoChange={onPhotoChange}
                  />
                </>
              ) : (
                <>
                  <div style={sectionLabel}>Бизнес профил</div>

                  <div style={providerGrid}>
                    <ProviderCard
                      active={providerType === "COMPANY"}
                      title="Фирма"
                      onClick={() => setProviderType("COMPANY")}
                    />
                    <ProviderCard
                      active={providerType === "INDIVIDUAL"}
                      title="Самостоятелен"
                      onClick={() => setProviderType("INDIVIDUAL")}
                    />
                  </div>

                  <Field
                    label="Име на бизнеса"
                    name="businessName"
                    value={form.businessName}
                    onChange={onChange}
                    placeholder="Име на бизнеса"
                    disabled={loading}
                    required
                  />

                  <div style={gridTwo}>
                    <Field
                      label="Град"
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      placeholder="Град"
                      disabled={loading}
                      required
                    />
                    <Field
                      label="Телефон"
                      name="businessPhone"
                      value={form.businessPhone}
                      onChange={onChange}
                      placeholder="По желание"
                      disabled={loading}
                    />
                  </div>

                  <Field
                    label="Адрес"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="По желание"
                    disabled={loading}
                  />
                  <PhotoUploadCard
                    role={role}
                    photoPreview={photoPreview}
                    photoFile={photoFile}
                    onPhotoChange={onPhotoChange}
                  />
                </>
              )}

              <button type="submit" style={primaryButton} disabled={loading}>
                {loading ? "Създаване..." : "Създай профил"}
              </button>
            </form>

            <p style={registerText}>
              Вече имаш профил? <Link to="/login" style={registerLink}>Влез</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, required, ...props }) {
  return (
    <label style={fieldWrap}>
      <span style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </span>
      <input {...props} style={input} />
    </label>
  );
}

function TextAreaField({ label, required, ...props }) {
  return (
    <label style={fieldWrap}>
      <span style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </span>
      <textarea {...props} style={{ ...input, minHeight: 110, resize: "vertical" }} />
    </label>
  );
}

function PhotoUploadCard({ role, photoPreview, photoFile, onPhotoChange }) {
  return (
    <div style={photoUploadCard}>
      <div style={photoUploadTop}>
          <div>
            <div style={sectionLabel}>Профилна снимка</div>
            <div style={photoUploadHint}>Добави снимка сега или по-късно.</div>
          </div>
        <div style={registerPhotoPreviewWrap}>
          {photoPreview ? (
            <img src={photoPreview || resolveBackendImage(photoPreview)} alt="Преглед" style={registerPhotoPreview} />
          ) : (
            <div style={registerPhotoFallback}>{role === "CLIENT" ? "👤" : "🏢"}</div>
          )}
        </div>
      </div>
      <label style={photoUploadButton}>
        <input type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
        {photoFile ? "Смени снимката" : "Добави снимка"}
      </label>
    </div>
  );
}

function RoleCard({ active, title, subtitle, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ ...roleCard, ...(active ? roleCardActive : null) }}>
      <span style={roleCardTitle}>{title}</span>
      <span style={roleCardSubtitle}>{subtitle}</span>
    </button>
  );
}

function ProviderCard({ active, title, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ ...providerCard, ...(active ? providerCardActive : null) }}>
      {title}
    </button>
  );
}

const shell = {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  background: "radial-gradient(circle at top left, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 22%), radial-gradient(circle at top right, rgba(30,64,175,0.18) 0%, rgba(30,64,175,0) 26%), linear-gradient(180deg, #081224 0%, #0d2b63 12%, #edf4ff 34%, #f7faff 100%)",
};

const backdropGlowOne = {
  position: "absolute",
  top: -180,
  left: -120,
  width: 420,
  height: 420,
  borderRadius: "50%",
  background: "rgba(59, 130, 246, 0.18)",
  filter: "blur(40px)",
};

const backdropGlowTwo = {
  position: "absolute",
  right: -140,
  bottom: -120,
  width: 360,
  height: 360,
  borderRadius: "50%",
  background: "rgba(59, 130, 246, 0.14)",
  filter: "blur(44px)",
};

const layout = {
  position: "relative",
  zIndex: 1,
  maxWidth: 760,
  margin: "0 auto",
  minHeight: "100vh",
  padding: "32px 20px",
  display: "grid",
  gap: 18,
  alignContent: "center",
  justifyItems: "center",
};

const logoStyle = {
  display: "block",
  height: 60,
  marginBottom: 6,
};

const formPanel = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const card = {
  width: "min(620px, 100%)",
  padding: 28,
  borderRadius: 30,
  background: "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(239,246,255,0.8) 100%)",
  border: "1px solid rgba(255,255,255,0.74)",
  boxShadow: "0 28px 90px rgba(15, 23, 42, 0.16)",
  backdropFilter: "blur(18px)",
};

const formHeader = {
  marginBottom: 18,
};

const eyebrow = {
  display: "inline-block",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#2563eb",
};

const title = {
  margin: "10px 0 4px",
  color: "#0f172a",
  fontSize: 34,
  lineHeight: 1.05,
  textAlign: "center",
};

const selectorGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const roleCard = {
  display: "grid",
  gap: 6,
  padding: "16px 18px",
  borderRadius: 20,
  border: "1px solid #dbeafe",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,249,255,0.96) 100%)",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
};

const roleCardActive = {
  border: "1px solid #2563eb",
  background: "linear-gradient(135deg, rgba(219,234,254,0.98) 0%, rgba(239,246,255,1) 100%)",
  boxShadow: "0 14px 30px rgba(37, 99, 235, 0.14)",
};

const roleCardTitle = {
  fontSize: 16,
  fontWeight: 900,
  color: "#0f172a",
};

const roleCardSubtitle = {
  fontSize: 13,
  color: "#64748b",
};

const formStyle = {
  display: "grid",
  gap: 14,
};

const gridTwo = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const fieldWrap = {
  display: "grid",
  gap: 6,
};

const labelStyle = {
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 800,
};

const input = {
  width: "100%",
  padding: "14px 15px",
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.34)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,251,255,0.94) 100%)",
  color: "#0f172a",
  outline: "none",
  fontSize: 15,
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.82)",
};

const sectionLabel = {
  marginTop: 6,
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const providerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};
const photoUploadCard = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 22,
  border: "1px solid rgba(96,165,250,0.26)",
  background: "linear-gradient(135deg, rgba(223,235,255,0.92) 0%, rgba(245,249,255,0.98) 58%, rgba(255,255,255,0.98) 100%)",
  boxShadow: "0 16px 34px rgba(37,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.82)",
};
const photoUploadTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};
const photoUploadHint = {
  marginTop: 6,
  color: "#64748b",
  lineHeight: 1.65,
  fontSize: 14,
  maxWidth: 380,
};
const registerPhotoPreviewWrap = {
  width: 72,
  height: 72,
  borderRadius: 999,
  overflow: "hidden",
  border: "1px solid #bfdbfe",
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  boxShadow: "0 14px 28px rgba(37,99,235,0.12)",
  flexShrink: 0,
};
const registerPhotoPreview = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const registerPhotoFallback = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  fontSize: 28,
  color: "#1d4ed8",
};
const photoUploadButton = {
  display: "inline-flex",
  width: "fit-content",
  padding: "12px 16px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 16px 30px rgba(37,99,235,0.18)",
};

const providerCard = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #dbeafe",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,249,255,0.96) 100%)",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
};

const providerCardActive = {
  background: "linear-gradient(135deg, rgba(219,234,254,0.98) 0%, rgba(239,246,255,1) 100%)",
  border: "1px solid #2563eb",
  boxShadow: "0 12px 24px rgba(37,99,235,0.12)",
};

const primaryButton = {
  marginTop: 4,
  padding: "15px 16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 16px 30px rgba(37, 99, 235, 0.28)",
};

const registerText = {
  marginTop: 18,
  marginBottom: 0,
  color: "#475569",
  fontSize: 14,
  textAlign: "center",
};

const registerLink = {
  color: "#2563eb",
  fontWeight: 800,
  textDecoration: "none",
};
