import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "./api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("CLIENT");
  const [providerType, setProviderType] = useState("COMPANY");
  const [form, setForm] = useState({
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
  });

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      role,
    };

    if (role === "CLIENT") {
      payload.firstName = form.firstName;
      payload.lastName = form.lastName;
      payload.phone = form.phone || null;
    } else {
      payload.providerType = providerType;
      payload.businessName = form.businessName;
      payload.city = form.city;
      payload.address = form.address;
      payload.businessPhone = form.businessPhone || null;
    }

    try {
      await register(payload);
      alert("Регистрацията е успешна. Можеш да влезеш.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Регистрация</h2>
        <p style={{ marginTop: 6, opacity: 0.75 }}>Създай акаунт като клиент или бизнес.</p>

        <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <label style={label}>Тип акаунт</label>
          <select value={role} onChange={(event) => setRole(event.target.value)} style={input}>
            <option value="CLIENT">Клиент</option>
            <option value="BUSINESS">Бизнес</option>
          </select>

          <label style={label}>Потребителско име</label>
          <input name="username" value={form.username} onChange={onChange} style={input} required />

          <label style={label}>Имейл</label>
          <input name="email" value={form.email} onChange={onChange} style={input} type="email" required />

          <label style={label}>Парола</label>
          <input name="password" value={form.password} onChange={onChange} style={input} type="password" required />

          {role === "CLIENT" ? (
            <>
              <hr style={{ margin: "16px 0", opacity: 0.2 }} />
              <label style={label}>Име</label>
              <input name="firstName" value={form.firstName} onChange={onChange} style={input} required />
              <label style={label}>Фамилия</label>
              <input name="lastName" value={form.lastName} onChange={onChange} style={input} required />
              <label style={label}>Телефон (по желание)</label>
              <input name="phone" value={form.phone} onChange={onChange} style={input} />
            </>
          ) : (
            <>
              <hr style={{ margin: "16px 0", opacity: 0.2 }} />
              <label style={label}>Тип доставчик</label>
              <select value={providerType} onChange={(event) => setProviderType(event.target.value)} style={input}>
                <option value="COMPANY">Фирма (COMPANY)</option>
                <option value="INDIVIDUAL">Индивидуален доставчик (INDIVIDUAL)</option>
              </select>
              <label style={label}>Име на бизнес</label>
              <input name="businessName" value={form.businessName} onChange={onChange} style={input} required />
              <label style={label}>Град</label>
              <input name="city" value={form.city} onChange={onChange} style={input} required />
              <label style={label}>Адрес</label>
              <input name="address" value={form.address} onChange={onChange} style={input} required />
              <label style={label}>Телефон (по желание)</label>
              <input name="businessPhone" value={form.businessPhone} onChange={onChange} style={input} />
            </>
          )}

          <button type="submit" style={btn}>
            Създай акаунт
          </button>

          <div style={{ marginTop: 12, fontSize: 14 }}>
            Имаш акаунт? <Link to="/login">Вход</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const wrap = { minHeight: "80vh", display: "grid", placeItems: "center", padding: 16 };
const card = { width: "min(520px, 100%)", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18 };
const label = { display: "block", marginTop: 10, marginBottom: 6, fontWeight: 700 };
const input = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1" };
const btn = { width: "100%", marginTop: 16, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 900, background: "#2563eb", color: "#fff" };
