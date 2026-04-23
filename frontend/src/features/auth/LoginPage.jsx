import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuth } from "../../lib/authStore";
import { login, loginAsDev } from "./api";
import logoPng from "../../assets/BookingHub-logo.png";

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
              <span style={eyebrow}>Account Access</span>
              <h2 style={title}>Login</h2>
            </div>

            <form onSubmit={onSubmit} style={form}>
              <label style={label}>Username or email</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="martin or martin@email.com"
                style={input}
                disabled={loading}
              />

              <label style={label}>Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Enter your password"
                style={input}
                disabled={loading}
              />

              <button type="submit" style={primaryButton} disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div style={dividerRow}>
              <div style={divider} />
              <span style={dividerLabel}>Dev Access</span>
              <div style={divider} />
            </div>

            <div style={devGrid}>
              <DevRoleCard title="Dev Client" onClick={() => onDevLogin("CLIENT")} disabled={loading} />
              <DevRoleCard title="Dev Business" onClick={() => onDevLogin("BUSINESS")} disabled={loading} />
              <DevRoleCard title="Dev Admin" onClick={() => onDevLogin("ADMIN")} disabled={loading} />
            </div>

            <p style={registerText}>
              No account? <Link to="/register" style={registerLink}>Create one</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function DevRoleCard({ title, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} style={devCard} disabled={disabled}>
      <span style={devCardTitle}>{title}</span>
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
  height: 60,
  marginBottom: 6,
};

const formPanel = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const card = {
  width: "min(460px, 100%)",
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
  margin: "10px 0 8px",
  color: "#0f172a",
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
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 800,
};

const input = {
  padding: "14px 15px",
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  background: "rgba(255,255,255,0.9)",
  color: "#0f172a",
  outline: "none",
  fontSize: 15,
};

const primaryButton = {
  marginTop: 6,
  padding: "15px 16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 16px 30px rgba(37, 99, 235, 0.28)",
};

const dividerRow = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginTop: 24,
  marginBottom: 18,
};

const divider = {
  height: 1,
  background: "rgba(148, 163, 184, 0.35)",
  flex: 1,
};

const dividerLabel = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const devGrid = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
};

const devCard = {
  width: "100%",
  padding: "14px 12px",
  borderRadius: 18,
  border: "1px solid #dbeafe",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  textAlign: "center",
  cursor: "pointer",
};

const devCardTitle = {
  color: "#0f172a",
  fontWeight: 900,
  fontSize: 14,
};

const registerText = {
  marginTop: 18,
  marginBottom: 0,
  color: "#475569",
  fontSize: 14,
};

const registerLink = {
  color: "#2563eb",
  fontWeight: 800,
  textDecoration: "none",
};
