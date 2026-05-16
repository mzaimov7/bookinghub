import React, { useEffect, useState } from "react";
import Header from "../../../components/layout/Header";
import { resolveBackendImage } from "../../../lib/assets";
import { createResource, listResources, updateResource, uploadResourcePhoto } from "./api";

const weekdayOptions = [
  { value: 1, label: "Пон" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чет" },
  { value: 5, label: "Пет" },
  { value: 6, label: "Съб" },
  { value: 7, label: "Нед" },
];

export default function BusinessResourcesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [create, setCreate] = useState({ type: "STAFF", name: "", photoUrl: "", photoFile: null, weeklyOffDays: [] });
  const [previewUrl, setPreviewUrl] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await listResources();
      setItems(data);
    } catch (loadError) {
      setError(loadError?.message || "Неуспешно зареждане на ресурсите");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(event) {
    event.preventDefault();

    if (!create.name.trim()) {
      alert("Въведи име");
      return;
    }

    try {
      setSubmitting(true);
      let uploadedPhotoUrl = create.photoUrl?.trim() || null;

      if (create.photoFile) {
        uploadedPhotoUrl = await uploadResourcePhoto(create.photoFile);
      }

      await createResource({
        type: create.type,
        name: create.name.trim(),
        photoUrl: uploadedPhotoUrl,
        weeklyOffDays: create.weeklyOffDays,
      });

      setCreate({ type: "STAFF", name: "", photoUrl: "", photoFile: null, weeklyOffDays: [] });
      setPreviewUrl("");
      await load();
    } catch (createError) {
      alert(createError?.message || "Неуспешно създаване");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(resource) {
    try {
      await updateResource(resource.id, { active: !resource.active });
      await load();
    } catch (updateError) {
      alert(updateError?.message || "Неуспешно обновяване");
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Зареждане…</div>;

  function onFileChange(event) {
    const file = event.target.files?.[0] || null;
    setCreate((current) => ({ ...current, photoFile: file }));
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  function toggleCreateWeeklyOffDay(dayValue) {
    setCreate((current) => ({
      ...current,
      weeklyOffDays: current.weeklyOffDays.includes(dayValue)
        ? current.weeklyOffDays.filter((item) => item !== dayValue)
        : [...current.weeklyOffDays, dayValue].sort((a, b) => a - b),
    }));
  }

  async function toggleWeeklyOffDay(resource, dayValue) {
    const nextWeeklyOffDays = resource.weeklyOffDays.includes(dayValue)
      ? resource.weeklyOffDays.filter((item) => item !== dayValue)
      : [...resource.weeklyOffDays, dayValue].sort((a, b) => a - b);

    try {
      await updateResource(resource.id, { weeklyOffDays: nextWeeklyOffDays });
      await load();
    } catch (updateError) {
      alert(updateError?.message || "Неуспешно обновяване");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(96,165,250,0.2) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, rgba(13,43,99,0.08) 0%, rgba(237,244,255,0.9) 20%, #f7faff 100%)" }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>
        <h2 style={{ marginTop: 0 }}>Персонал и екипи</h2>

        {error && (
          <div style={{ padding: 12, border: "1px solid #fecaca", background: "#fff1f2", borderRadius: 12, marginBottom: 12 }}>
            <b>Грешка:</b> {error}
          </div>
        )}

        <form onSubmit={onCreate} style={{ display: "grid", gap: 10, padding: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
            <select value={create.type} onChange={(event) => setCreate((current) => ({ ...current, type: event.target.value }))} style={input}>
              <option value="STAFF">СЛУЖИТЕЛ</option>
              <option value="TEAM">ЕКИП</option>
            </select>
            <input value={create.name} onChange={(event) => setCreate((current) => ({ ...current, name: event.target.value }))} style={input} placeholder="Име (пример: Иван Петров / Екип #1)" />
          </div>

        <label style={uploadWrap}>
          <span style={{ fontWeight: 800, color: "#0f172a" }}>Добави снимка на служител</span>
          <input type="file" accept="image/*" onChange={onFileChange} style={{ marginTop: 8 }} />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 800, color: "#0f172a" }}>Седмични почивни дни</div>
          <div style={dayChipWrap}>
            {weekdayOptions.map((day) => {
              const active = create.weeklyOffDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleCreateWeeklyOffDay(day.value)}
                  style={{
                    ...dayChip,
                    background: active ? "#dbeafe" : "#fff",
                    borderColor: active ? "#60a5fa" : "#cbd5e1",
                    color: active ? "#1d4ed8" : "#334155",
                  }}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {(previewUrl || create.photoUrl) && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={previewUrl || resolveBackendImage(create.photoUrl)}
              alt="Преглед"
              style={{ width: 64, height: 64, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" }}
            />
            <button
              type="button"
              onClick={() => {
                setCreate((current) => ({ ...current, photoUrl: "", photoFile: null }));
                setPreviewUrl("");
              }}
              style={smallBtn}
            >
              Махни снимката
            </button>
          </div>
        )}

          <button type="submit" style={btn} disabled={submitting}>
            {submitting ? "Качване..." : "Добави"}
          </button>
        </form>

        <div style={{ marginTop: 18, marginBottom: 10, fontSize: 24, fontWeight: 900, color: "#0f172a" }}>
          Твоите служители и екипи
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {items.map((resource) => (
            <div key={resource.id} style={{ padding: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={resolveBackendImage(resource.photoUrl) || "https://via.placeholder.com/48?text=%F0%9F%91%A4"}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" }}
                />

                <div>
                  <div style={{ fontWeight: 900 }}>
                    {resource.name} <span style={{ opacity: 0.6, fontWeight: 700 }}>({resource.type})</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>
                    Статус: {resource.active ? "Активен" : "Неактивен"}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {weekdayOptions.map((day) => {
                      const active = resource.weeklyOffDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWeeklyOffDay(resource, day.value)}
                          style={{
                            ...dayChip,
                            padding: "6px 8px",
                            fontSize: 12,
                            background: active ? "#fee2e2" : "#fff",
                            borderColor: active ? "#fda4af" : "#dbe4f0",
                            color: active ? "#be123c" : "#475569",
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button onClick={() => toggleActive(resource)} style={smallBtn}>
                {resource.active ? "Деактивирай" : "Активирай"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const input = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 12 };
const btn = { padding: "12px 14px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer" };
const smallBtn = { border: "1px solid #cbd5e1", background: "#fff", borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontWeight: 800 };
const uploadWrap = { display: "grid", padding: 12, border: "1px dashed #cbd5e1", borderRadius: 14, background: "#f8fafc" };
const dayChipWrap = { display: "flex", gap: 8, flexWrap: "wrap" };
const dayChip = { border: "1px solid #cbd5e1", borderRadius: 999, padding: "8px 12px", fontWeight: 800, cursor: "pointer", background: "#fff" };
