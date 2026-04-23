import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { resolveBackendImage } from "../../lib/assets";
import { getServiceById } from "./api";
import { addFavorite, createBooking, getAvailableSlots, getFavoriteIds, removeFavorite } from "../client/api";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);

      const [data, loadedSlots, loadedFavoriteIds] = await Promise.all([
        getServiceById(id),
        getAvailableSlots(id).catch(() => []),
        isLoggedIn() && getRole() === "CLIENT" ? getFavoriteIds().catch(() => []) : Promise.resolve([]),
      ]);
      if (!data) setNotFound(true);

      setService(data);
      setSlots(loadedSlots);
      setFavoriteIds(loadedFavoriteIds);
      setSelectedSlotId(loadedSlots[0]?.id ? String(loadedSlots[0].id) : "");
      setLoading(false);
    }

    load();
  }, [id]);

  async function onReserve() {
    if (!isLoggedIn()) {
      alert("You need an account to reserve. Please login first.");
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      alert("Reservations are available for client accounts.");
      return;
    }
    if (!selectedSlotId) {
      alert("Choose an available slot first.");
      return;
    }

    setSubmitting(true);

    try {
      await createBooking({
        serviceId: Number(id),
        slotId: Number(selectedSlotId),
        clientNote: note.trim() || null,
      });
      alert("Reservation request created successfully.");
      navigate("/my-bookings");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onToggleFavorite() {
    if (!isLoggedIn()) {
      alert("Login first to save favorites.");
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      alert("Favorites are available for client accounts.");
      return;
    }

    const serviceId = Number(id);
    const isFavorite = favoriteIds.includes(serviceId);

    if (isFavorite) {
      await removeFavorite(serviceId);
      setFavoriteIds((current) => current.filter((item) => item !== serviceId));
      return;
    }

    await addFavorite(serviceId);
    setFavoriteIds((current) => [...current, serviceId]);
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (notFound) return <div style={{ padding: 24 }}>Service not found. <Link to="/">Back</Link></div>;

  const imageUrl = resolveBackendImage(service?.coverImageUrl);
  const isFavorite = favoriteIds.includes(Number(id));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/" style={{ textDecoration: "none" }}>← Back</Link>

      {imageUrl && (
        <img src={imageUrl} alt={service.title} style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 16, marginTop: 14, display: "block" }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginTop: 12 }}>
        <h2 style={{ margin: 0 }}>{service.title}</h2>
        <button onClick={onToggleFavorite} style={{ ...favoriteBtn, color: isFavorite ? "#dc2626" : "#64748b" }}>
          ♥
        </button>
      </div>
      <div style={{ opacity: 0.85, marginBottom: 16 }}>{service.description}</div>

      <div style={{ display: "grid", gap: 8 }}>
        <div>📍 <b>{service.city}</b> — {service.address}</div>
        <div>⏱ <b>{service.durationMinutes}</b> minutes</div>
        <div>💰 <b>{service.price}</b> лв</div>
      </div>

      <div style={{ marginTop: 22, padding: 18, borderRadius: 18, border: "1px solid #e2e8f0", background: "#fff" }}>
        <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>Available slots</div>

        {slots.length === 0 ? (
          <div style={{ color: "#64748b" }}>No available slots at the moment.</div>
        ) : (
          <>
            <select value={selectedSlotId} onChange={(event) => setSelectedSlotId(event.target.value)} style={slotSelect}>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {new Date(slot.startAt).toLocaleString()} - {new Date(slot.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </option>
              ))}
            </select>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note for the business"
              style={noteInput}
            />

            <button onClick={onReserve} style={reserveButton} disabled={submitting}>
              {submitting ? "Saving..." : "Reserve"}
            </button>
          </>
        )}
      </div>

      {!isLoggedIn() && (
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          You’re browsing as guest. To reserve, <Link to="/login">login</Link>.
        </p>
      )}
    </div>
  );
}

const slotSelect = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
};

const noteInput = {
  width: "100%",
  minHeight: 96,
  marginTop: 12,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  resize: "vertical",
  boxSizing: "border-box",
};

const reserveButton = {
  marginTop: 12,
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const favoriteBtn = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 999,
  width: 42,
  height: 42,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 18,
};
