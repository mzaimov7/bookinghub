import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "./api";
import logoPng from "../../assets/BookingHub-logo.png";

const initialForm = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
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

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

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
    } else {
      payload.providerType = providerType;
      payload.businessName = form.businessName.trim();
      payload.city = form.city.trim();
      payload.address = form.address.trim() || null;
      payload.businessPhone = form.businessPhone.trim() || null;
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
  background: "radial-gradient(circle at top left, #eff6ff 0%, #dbeafe 18%, #f8fafc 42%, #fffaf0 100%)",
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
  background: "rgba(245, 158, 11, 0.18)",
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
  background: "rgba(255,255,255,0.84)",
  border: "1px solid rgba(255,255,255,0.7)",
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.14)",
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
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  textAlign: "left",
  cursor: "pointer",
};

const roleCardActive = {
  border: "1px solid #2563eb",
  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.14)",
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
  border: "1px solid #cbd5e1",
  background: "rgba(255,255,255,0.9)",
  color: "#0f172a",
  outline: "none",
  fontSize: 15,
  boxSizing: "border-box",
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

const providerCard = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #dbeafe",
  background: "#f8fbff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
};

const providerCardActive = {
  background: "#eff6ff",
  border: "1px solid #2563eb",
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
