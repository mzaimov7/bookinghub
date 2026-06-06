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
  companyLegalName: "",
  companyEik: "",
  companyRepresentative: "",
  city: "",
  address: "",
  businessPhone: "",
  businessDescription: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("CLIENT");
  const [providerType, setProviderType] = useState("COMPANY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [event.target.name]: "" }));
    setError("");
  }

  function onPhotoChange(event) {
    const file = event.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    setLoading(true);

    try {
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
        payload.companyLegalName = providerType === "COMPANY" ? form.companyLegalName.trim() : null;
        payload.companyEik = providerType === "COMPANY" ? form.companyEik.trim() : null;
        payload.companyRepresentative = providerType === "COMPANY" ? form.companyRepresentative.trim() : null;
        payload.city = form.city.trim();
        payload.address = form.address.trim();
        payload.businessPhone = form.businessPhone.trim() || null;
        payload.businessPhotoUrl = uploadedPhotoUrl;
        payload.businessDescription = form.businessDescription.trim() || null;
      }

      await register(payload);
      alert("Профилът беше създаден успешно. Вече можеш да влезеш.");
      navigate("/login");
    } catch (error) {
      const { fieldErrors: nextFieldErrors, formError } = fieldErrorsForRegistration(error);
      setFieldErrors(nextFieldErrors);
      setError(formError);
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

            {error ? <div style={errorBox}>{error}</div> : null}

            <form onSubmit={onSubmit} style={formStyle}>
              <div style={gridTwo}>
                <Field
                  label="Потребителско име"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="Избери потребителско име"
                  disabled={loading}
                  error={fieldErrors.username}
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
                  error={fieldErrors.email}
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
                error={fieldErrors.password}
                required
              />
              <div style={passwordHint}>Поне 8 символа, с главна буква, малка буква и цифра.</div>

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
                      error={fieldErrors.firstName}
                      required
                    />
                    <Field
                      label="Фамилия"
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      placeholder="Фамилия"
                      disabled={loading}
                      error={fieldErrors.lastName}
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
                    error={fieldErrors.phone}
                  />
                  <TextAreaField
                    label="Биография"
                    name="bio"
                    value={form.bio}
                    onChange={onChange}
                    placeholder="Разкажи накратко за себе си"
                    disabled={loading}
                    error={fieldErrors.bio}
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
                    error={fieldErrors.businessName}
                    required
                  />

                  {providerType === "COMPANY" ? (
                    <>
                      <Field
                        label="Име на фирмата"
                        name="companyLegalName"
                        value={form.companyLegalName}
                        onChange={onChange}
                        placeholder="Юридическо име на фирмата"
                        disabled={loading}
                        error={fieldErrors.companyLegalName}
                        required
                      />
                      <div style={gridTwo}>
                      <Field
                        label="ЕИК"
                        name="companyEik"
                        value={form.companyEik}
                        onChange={onChange}
                        placeholder="ЕИК на фирмата"
                        disabled={loading}
                        error={fieldErrors.companyEik}
                        required
                      />
                      <Field
                        label="МОЛ"
                        name="companyRepresentative"
                        value={form.companyRepresentative}
                        onChange={onChange}
                        placeholder="Материално отговорно лице"
                        disabled={loading}
                        error={fieldErrors.companyRepresentative}
                        required
                      />
                      </div>
                    </>
                  ) : null}

                  <div style={gridTwo}>
                    <Field
                      label="Град"
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      placeholder="Град"
                      disabled={loading}
                      error={fieldErrors.city}
                      required
                    />
                    <Field
                      label="Телефон"
                      name="businessPhone"
                      value={form.businessPhone}
                      onChange={onChange}
                      placeholder="Телефон за контакт"
                      disabled={loading}
                      error={fieldErrors.businessPhone}
                      required
                    />
                  </div>

                  <Field
                    label="Адрес"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Адрес на бизнеса"
                    disabled={loading}
                    error={fieldErrors.address}
                    required
                  />
                  <TextAreaField
                    label="Кратко описание"
                    name="businessDescription"
                    value={form.businessDescription}
                    onChange={onChange}
                    placeholder="Разкажи накратко какви услуги предлага бизнесът ти"
                    disabled={loading}
                    error={fieldErrors.businessDescription}
                    required
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

function Field({ label, required, error, ...props }) {
  return (
    <label style={fieldWrap}>
      <span style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </span>
      <input {...props} style={{ ...input, ...(error ? inputError : null) }} />
      {error ? <span style={fieldErrorText}>{error}</span> : null}
    </label>
  );
}

function TextAreaField({ label, required, error, ...props }) {
  return (
    <label style={fieldWrap}>
      <span style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </span>
      <textarea {...props} style={{ ...input, ...(error ? inputError : null), minHeight: 110, resize: "vertical" }} />
      {error ? <span style={fieldErrorText}>{error}</span> : null}
    </label>
  );
}

function fieldErrorsForRegistration(error) {
  if (error?.errors) {
    return { fieldErrors: error.errors, formError: "" };
  }

  const message = error?.message || "Неуспешна регистрация";
  if (message.includes("Потребителското име")) {
    return { fieldErrors: { username: message }, formError: "" };
  }
  if (message.includes("Имейл")) {
    return { fieldErrors: { email: message }, formError: "" };
  }
  if (message.includes("Паролата")) {
    return { fieldErrors: { password: message }, formError: "" };
  }
  if (message.includes("Името и фамилията")) {
    return { fieldErrors: { firstName: message, lastName: message }, formError: "" };
  }
  if (message.includes("Името на бизнеса")) {
    return {
      fieldErrors: {
        businessName: message,
        city: message,
        address: message,
        businessPhone: message,
        businessDescription: message,
      },
      formError: "",
    };
  }
  if (message.includes("Име на фирмата")) {
    return {
      fieldErrors: {
        companyLegalName: message,
        companyEik: message,
        companyRepresentative: message,
      },
      formError: "",
    };
  }
  return { fieldErrors: {}, formError: message };
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
  background:
    "radial-gradient(circle at 18% 12%, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0) 30%), linear-gradient(145deg, #020617 0%, #061225 44%, #08245a 100%)",
};

const backdropGlowOne = {
  position: "absolute",
  top: -180,
  left: -120,
  width: 420,
  height: 420,
  borderRadius: "50%",
  background: "rgba(37,99,235,0.12)",
  filter: "blur(72px)",
};

const backdropGlowTwo = {
  position: "absolute",
  right: -140,
  bottom: -120,
  width: 360,
  height: 360,
  borderRadius: "50%",
  background: "rgba(14,116,184,0.10)",
  filter: "blur(76px)",
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
  height: 72,
  marginBottom: 8,
  borderRadius: 18,
  boxShadow: "0 18px 45px rgba(2,6,23,0.28)",
};

const formPanel = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const card = {
  width: "min(620px, 100%)",
  padding: 28,
  borderRadius: 26,
  background: "linear-gradient(180deg, rgba(5,13,28,0.96) 0%, rgba(9,25,55,0.94) 100%)",
  border: "1px solid rgba(147,197,253,0.24)",
  boxShadow: "0 28px 90px rgba(2,6,23,0.34)",
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
  color: "#93c5fd",
};

const title = {
  margin: "10px 0 4px",
  color: "#eff6ff",
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
  border: "1px solid rgba(147,197,253,0.22)",
  background: "rgba(15,23,42,0.36)",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
};

const roleCardActive = {
  border: "1px solid #60a5fa",
  background: "linear-gradient(135deg, rgba(37,99,235,0.34) 0%, rgba(15,23,42,0.5) 100%)",
  boxShadow: "0 14px 30px rgba(37,99,235,0.18)",
};

const roleCardTitle = {
  fontSize: 16,
  fontWeight: 900,
  color: "#eff6ff",
};

const roleCardSubtitle = {
  fontSize: 13,
  color: "#cbd5e1",
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

const errorBox = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(248,113,113,0.28)",
  background: "linear-gradient(180deg, rgba(255,241,242,0.98) 0%, rgba(255,247,248,0.98) 100%)",
  color: "#9f1239",
  fontWeight: 700,
  lineHeight: 1.55,
};

const labelStyle = {
  color: "#dbeafe",
  fontSize: 13,
  fontWeight: 800,
};

const input = {
  width: "100%",
  padding: "14px 15px",
  borderRadius: 16,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(15,23,42,0.46)",
  color: "#eff6ff",
  outline: "none",
  fontSize: 15,
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
};

const inputError = {
  border: "1px solid rgba(248,113,113,0.72)",
  boxShadow: "0 0 0 3px rgba(248,113,113,0.12)",
};

const fieldErrorText = {
  color: "#fca5a5",
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1.35,
};

const passwordHint = {
  marginTop: -4,
  color: "#cbd5e1",
  fontSize: 13,
  lineHeight: 1.55,
};

const sectionLabel = {
  marginTop: 6,
  color: "#93c5fd",
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
  background: "rgba(15,23,42,0.36)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
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
  color: "#cbd5e1",
  lineHeight: 1.65,
  fontSize: 14,
  maxWidth: 380,
};
const registerPhotoPreviewWrap = {
  width: 72,
  height: 72,
  borderRadius: 999,
  overflow: "hidden",
  border: "1px solid rgba(147,197,253,0.34)",
  background: "linear-gradient(135deg, rgba(15,23,42,0.82), rgba(30,64,175,0.34))",
  boxShadow: "0 14px 28px rgba(2,6,23,0.22)",
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
  color: "#bfdbfe",
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
  border: "1px solid rgba(147,197,253,0.22)",
  background: "rgba(15,23,42,0.36)",
  color: "#eff6ff",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
};

const providerCardActive = {
  background: "linear-gradient(135deg, rgba(37,99,235,0.34) 0%, rgba(15,23,42,0.5) 100%)",
  border: "1px solid #60a5fa",
  boxShadow: "0 12px 24px rgba(37,99,235,0.18)",
};

const primaryButton = {
  marginTop: 4,
  padding: "15px 16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #2563eb 0%, #0f172a 100%)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 16px 30px rgba(37, 99, 235, 0.28)",
};

const registerText = {
  marginTop: 18,
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: 14,
  textAlign: "center",
};

const registerLink = {
  color: "#93c5fd",
  fontWeight: 800,
  textDecoration: "none",
};
