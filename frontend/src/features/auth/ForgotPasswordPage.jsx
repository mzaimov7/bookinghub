import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoPng from "../../assets/BookingHub-logo-auth.png";
import { requestPasswordReset } from "./api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setFieldError("Въведи имейл адрес.");
      return;
    }

    setFieldError("");
    setLoading(true);

    try {
      const response = await requestPasswordReset({ email: email.trim() });
      setMessage(response?.message || "Ако има профил с този имейл, ще получите линк за смяна на паролата.");
    } catch (error) {
      setFieldError(error?.errors?.email || error?.message || "Неуспешна заявка за смяна на парола");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={shell}>
      <div style={layout}>
        <img src={logoPng} alt="BookingHub" style={logoStyle} />
        <section style={card}>
          <div style={formHeader}>
            <span style={eyebrow}>Възстановяване на достъп</span>
            <h2 style={title}>Забравена парола</h2>
          </div>

          <form onSubmit={onSubmit} style={form}>
            <label style={label}>Имейл адрес</label>
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldError("");
                setMessage("");
              }}
              type="email"
              placeholder="martin@email.com"
              style={{ ...input, ...(fieldError ? inputError : null) }}
              disabled={loading}
            />
            {fieldError ? <div style={errorText}>{fieldError}</div> : null}
            {message ? <div style={successText}>{message}</div> : null}

            <button type="submit" style={primaryButton} disabled={loading}>
              {loading ? "Изпращане..." : "Изпрати линк"}
            </button>
          </form>

          <p style={footerText}>
            <Link to="/login" style={link}>Назад към вход</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

const shell = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 18% 12%, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0) 30%), linear-gradient(145deg, #020617 0%, #061225 44%, #08245a 100%)",
};
const layout = { maxWidth: 560, margin: "0 auto", minHeight: "100vh", padding: "32px 20px", display: "grid", gap: 18, alignContent: "center", justifyItems: "center" };
const logoStyle = { display: "block", height: 72, marginBottom: 8, borderRadius: 18, boxShadow: "0 18px 45px rgba(2,6,23,0.28)" };
const card = { width: "min(460px, 100%)", padding: 28, borderRadius: 26, background: "linear-gradient(180deg, rgba(5,13,28,0.96) 0%, rgba(9,25,55,0.94) 100%)", border: "1px solid rgba(147,197,253,0.24)", boxShadow: "0 28px 90px rgba(2,6,23,0.34)" };
const formHeader = { marginBottom: 18 };
const eyebrow = { display: "inline-block", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd" };
const title = { margin: "10px 0 8px", color: "#eff6ff", fontSize: 34, lineHeight: 1.05, textAlign: "center" };
const form = { display: "grid", gap: 12 };
const label = { marginTop: 4, color: "#dbeafe", fontSize: 13, fontWeight: 800 };
const input = { padding: "14px 15px", borderRadius: 16, border: "1px solid rgba(147,197,253,0.28)", background: "rgba(15,23,42,0.46)", color: "#eff6ff", outline: "none", fontSize: 15 };
const inputError = { border: "1px solid rgba(248,113,113,0.72)", boxShadow: "0 0 0 3px rgba(248,113,113,0.12)" };
const errorText = { marginTop: -6, color: "#fca5a5", fontSize: 12, fontWeight: 800, lineHeight: 1.35 };
const successText = { padding: 12, borderRadius: 14, background: "rgba(16,185,129,0.12)", color: "#a7f3d0", fontSize: 13, fontWeight: 800, lineHeight: 1.45 };
const primaryButton = { marginTop: 6, padding: "15px 16px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #2563eb 0%, #0f172a 100%)", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 16px 30px rgba(37, 99, 235, 0.28)" };
const footerText = { marginTop: 18, marginBottom: 0, color: "#cbd5e1", fontSize: 14, textAlign: "center" };
const link = { color: "#93c5fd", fontWeight: 800, textDecoration: "none" };
