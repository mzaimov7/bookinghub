import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuth } from "../../lib/authStore";
import { login, loginAsDev } from "./api";
import logoPng from "../../assets/BookingHub-logo-auth.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      alert("Въведи потребителско име или имейл и парола.");
      return;
    }

    setLoading(true);

    try {
      const auth = await login({
        identifier: identifier.trim(),
        password,
      });
      saveAuth(auth);
      navigate("/", { replace: true });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onDevLogin(role) {
    setLoading(true);

    try {
      const auth = await loginAsDev(role);
      saveAuth(auth);
      navigate("/", { replace: true });
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
              <span style={eyebrow}>Достъп до профила</span>
              <h2 style={title}>Вход</h2>
            </div>

            <form onSubmit={onSubmit} style={form}>
              <label style={label}>Потребителско име или имейл</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="martin или martin@email.com"
                style={input}
                disabled={loading}
              />

              <label style={label}>Парола</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Въведи паролата си"
                style={input}
                disabled={loading}
              />

              <button type="submit" style={primaryButton} disabled={loading}>
                {loading ? "Влизане..." : "Вход"}
              </button>
            </form>

            <p style={registerText}>
              Нямаш профил? <Link to="/register" style={registerLink}>Създай си</Link>
            </p>

            <div style={devBox}>
              <span style={devLabel}>Временен dev вход</span>
              <div style={devButtons}>
                <button type="button" style={devButton} disabled={loading} onClick={() => onDevLogin("admin")}>
                  Dev админ
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
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
  background: "rgba(37, 99, 235, 0.12)",
  filter: "blur(72px)",
};

const backdropGlowTwo = {
  position: "absolute",
  right: -140,
  bottom: -120,
  width: 360,
  height: 360,
  borderRadius: "50%",
  background: "rgba(14, 116, 184, 0.10)",
  filter: "blur(76px)",
};

const layout = {
  position: "relative",
  zIndex: 1,
  maxWidth: 560,
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
  width: "min(460px, 100%)",
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
  margin: "10px 0 8px",
  color: "#eff6ff",
  fontSize: 34,
  lineHeight: 1.05,
  textAlign: "center",
};

const form = {
  display: "grid",
  gap: 12,
};

const label = {
  marginTop: 4,
  color: "#dbeafe",
  fontSize: 13,
  fontWeight: 800,
};

const input = {
  padding: "14px 15px",
  borderRadius: 16,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(15,23,42,0.46)",
  color: "#eff6ff",
  outline: "none",
  fontSize: 15,
};

const primaryButton = {
  marginTop: 6,
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
};

const registerLink = {
  color: "#93c5fd",
  fontWeight: 800,
  textDecoration: "none",
};

const devBox = {
  marginTop: 18,
  padding: 12,
  borderRadius: 18,
  background: "rgba(37,99,235,0.10)",
  border: "1px dashed rgba(147,197,253,0.34)",
};

const devLabel = {
  display: "block",
  marginBottom: 10,
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const devButtons = {
  display: "flex",
};

const devButton = {
  width: "100%",
  padding: "10px 8px",
  borderRadius: 12,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(15,23,42,0.58)",
  color: "#eff6ff",
  fontWeight: 800,
  cursor: "pointer",
};
