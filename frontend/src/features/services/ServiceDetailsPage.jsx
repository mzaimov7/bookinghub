import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isLoggedIn } from "../../lib/authStore";
import { resolveBackendImage } from "../../lib/assets";
import { getServiceById } from "./api";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);

      const data = await getServiceById(id);
      if (!data) setNotFound(true);

      setService(data);
      setLoading(false);
    }

    load();
  }, [id]);

  function onReserve() {
    if (!isLoggedIn()) {
      alert("You need an account to reserve. Please login first.");
      navigate("/login");
      return;
    }

    alert("Reserve flow will be implemented next (booking API).");
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (notFound) return <div style={{ padding: 24 }}>Service not found. <Link to="/">Back</Link></div>;

  const imageUrl = resolveBackendImage(service?.coverImageUrl);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/" style={{ textDecoration: "none" }}>← Back</Link>

      {imageUrl && (
        <img src={imageUrl} alt={service.title} style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 16, marginTop: 14, display: "block" }} />
      )}

      <h2 style={{ marginTop: 12, marginBottom: 6 }}>{service.title}</h2>
      <div style={{ opacity: 0.85, marginBottom: 16 }}>{service.description}</div>

      <div style={{ display: "grid", gap: 8 }}>
        <div>📍 <b>{service.city}</b> — {service.address}</div>
        <div>⏱ <b>{service.durationMinutes}</b> minutes</div>
        <div>💰 <b>{service.price}</b> лв</div>
      </div>

      <button onClick={onReserve} style={{ marginTop: 18, padding: "10px 14px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 800 }}>
        Reserve
      </button>

      {!isLoggedIn() && (
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          You’re browsing as guest. To reserve, <Link to="/login">login</Link>.
        </p>
      )}
    </div>
  );
}
