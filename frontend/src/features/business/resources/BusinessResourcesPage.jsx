import React, { useEffect, useState } from "react";
import { createResource, listResources, updateResource } from "./api";

export default function BusinessResourcesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [create, setCreate] = useState({ type: "STAFF", name: "", photoUrl: "" });

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await listResources();
      setItems(data);
    } catch (loadError) {
      setError(loadError?.message || "Failed to load resources");
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
      await createResource({
        type: create.type,
        name: create.name.trim(),
        photoUrl: create.photoUrl?.trim() || null,
      });

      setCreate({ type: "STAFF", name: "", photoUrl: "" });
      await load();
    } catch (createError) {
      alert(createError?.message || "Create failed");
    }
  }

  async function toggleActive(resource) {
    try {
      await updateResource(resource.id, { active: !resource.active });
      await load();
    } catch (updateError) {
      alert(updateError?.message || "Update failed");
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
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
            <option value="STAFF">STAFF (служител)</option>
            <option value="TEAM">TEAM (екип)</option>
          </select>
          <input value={create.name} onChange={(event) => setCreate((current) => ({ ...current, name: event.target.value }))} style={input} placeholder="Име (пример: Иван Петров / Екип #1)" />
        </div>

        <input
          value={create.photoUrl}
          onChange={(event) => setCreate((current) => ({ ...current, photoUrl: event.target.value }))}
          style={input}
          placeholder="Снимка (URL) – по избор, пример: https://..."
        />

        <button type="submit" style={btn}>
          Добави
        </button>
      </form>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {items.map((resource) => (
          <div key={resource.id} style={{ padding: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src={resource.photoUrl || "https://via.placeholder.com/48?text=%F0%9F%91%A4"}
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
              </div>
            </div>

            <button onClick={() => toggleActive(resource)} style={smallBtn}>
              {resource.active ? "Деактивирай" : "Активирай"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const input = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 12 };
const btn = { padding: "12px 14px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer" };
const smallBtn = { border: "1px solid #cbd5e1", background: "#fff", borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontWeight: 800 };
