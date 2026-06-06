import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logoPng from "../../assets/BookingHub-logo-auth.png";
import { resetPassword } from "./api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!token) nextErrors.token = "Линкът за смяна на парола е невалиден.";
    if (!newPassword.trim()) nextErrors.newPassword = "Въведи нова парола.";
    if (!confirmPassword.trim()) nextErrors.confirmPassword = "Потвърди новата парола.";
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Новата парола и потвърждението не съвпадат.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setMessage("");
    setLoading(true);

    try {
      const response = await resetPassword({ token, newPassword, confirmPassword });
      setMessage(response?.message || "Паролата беше сменена успешно.");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (error) {
      const backendErrors = error?.errors || {};
      setFieldErrors({
        token: backendErrors.token || "",
        newPassword: backendErrors.newPassword || "",
        confirmPassword: backendErrors.confirmPassword || error?.message || "Неуспешна смяна на парола",
      });
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
            <span style={eyebrow}>Нов достъп</span>
            <h2 style={title}>Нова парола</h2>
          </div>

          <form onSubmit={onSubmit} style={form}>
            {fieldErrors.token ? <div style={errorPanel}>{fieldErrors.token}</div> : null}

            <label style={label}>Нова парола</label>
            <input
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, newPassword: "", confirmPassword: "" }));
              }}
              type="password"
              placeholder="Поне 8 символа, главна буква и цифра"
              style={{ ...input, ...(fieldErrors.newPassword ? inputError : null) }}
              disabled={loading}
            />
            {fieldErrors.newPassword ? <div style={errorText}>{fieldErrors.newPassword}</div> : null}

            <label style={label}>Потвърди паролата</label>
            <input
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
              }}
              type="password"
              placeholder="Повтори новата парола"
              style={{ ...input, ...(fieldErrors.confirmPassword ? inputError : null) }}
              disabled={loading}
            />
            {fieldErrors.confirmPassword ? <div style={errorText}>{fieldErrors.confirmPassword}</div> : null}
            {message ? <div style={successText}>{message}</div> : null}

            <button type="submit" style={primaryButton} disabled={loading}>
              {loading ? "Запазване..." : "Запази новата парола"}
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
const errorPanel = { padding: 12, borderRadius: 14, background: "rgba(248,113,113,0.12)", color: "#fca5a5", fontSize: 13, fontWeight: 800, lineHeight: 1.45 };
const successText = { padding: 12, borderRadius: 14, background: "rgba(16,185,129,0.12)", color: "#a7f3d0", fontSize: 13, fontWeight: 800, lineHeight: 1.45 };
const primaryButton = { marginTop: 6, padding: "15px 16px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #2563eb 0%, #0f172a 100%)", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 16px 30px rgba(37, 99, 235, 0.28)" };
const footerText = { marginTop: 18, marginBottom: 0, color: "#cbd5e1", fontSize: 14, textAlign: "center" };
const link = { color: "#93c5fd", fontWeight: 800, textDecoration: "none" };
