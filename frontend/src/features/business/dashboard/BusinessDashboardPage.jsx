import React from "react";
import { Link } from "react-router-dom";

export default function BusinessDashboardPage() {
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px" }}>
      <h2 style={{ marginTop: 0 }}>Бизнес табло</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
        <Card title="➕ Създай нова обява" text="Публикувай услуга и започни да получаваш заявки." to="/business/services/new" />
        <Card title="📌 Моите обяви" text="Виж и управлявай активните си услуги." to="/business/services" />
        <Card title="📥 Заявки / Резервации" text="Прегледай заявки от клиенти (pending/approved/rejected)." to="/business/bookings" />
      </div>
    </div>
  );
}

function Card({ title, text, to }) {
  return (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
        <div style={{ marginTop: 8, opacity: 0.8 }}>{text}</div>
      </div>
    </Link>
  );
}
