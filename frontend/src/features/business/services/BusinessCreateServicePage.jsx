import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createService, listActiveResources } from "./api";

export default function BusinessCreateServicePage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [openPicker, setOpenPicker] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    city: "",
    address: "",
    price: "",
    durationMinutes: "",
    active: true,
    date: "",
    slotMinutes: 30,
    resourceIds: [],
  });

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function toggleResource(resourceId) {
    setForm((current) => {
      const hasResource = current.resourceIds.includes(resourceId);
      return {
        ...current,
        resourceIds: hasResource
          ? current.resourceIds.filter((id) => id !== resourceId)
          : [...current.resourceIds, resourceId],
      };
    });
  }

  async function loadResources() {
    setLoadingResources(true);

    try {
      const data = await listActiveResources();
      setResources(data);
    } catch {
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();

    const payload = {
      categoryId: Number(form.categoryId),
      title: form.title.trim(),
      description: form.description?.trim() || null,
      city: form.city.trim(),
      address: form.address.trim(),
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      active: Boolean(form.active),
      resourceIds: form.resourceIds.map(Number),
      date: form.date,
      slotMinutes: Number(form.slotMinutes),
      imageUrls: [],
      coverIndex: 0,
    };

    if (!payload.categoryId || !payload.title || !payload.city || !payload.address) {
      alert("Моля попълни: categoryId, заглавие, град, адрес.");
      return;
    }

    if (!payload.price || payload.price <= 0) {
      alert("Цена трябва да е > 0");
      return;
    }

    if (!payload.durationMinutes || payload.durationMinutes <= 0) {
      alert("Продължителност трябва да е > 0");
      return;
    }

    if (!payload.date) {
      alert("Избери дата (YYYY-MM-DD).");
      return;
    }

    if (!payload.resourceIds.length) {
      alert("Избери поне един човек/екип.");
      return;
    }

    try {
      const data = await createService(payload);
      navigate(`/services/${data.id}`);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "18px 16px" }}>
      <h2 style={{ marginTop: 0 }}>Създай нова обява</h2>

      <form onSubmit={onSubmit} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, display: "grid", gap: 10 }}>
        <label style={label}>Категория (ID за момента)</label>
        <input name="categoryId" value={form.categoryId} onChange={onChange} style={input} placeholder="пример: 1" />

        <label style={label}>Заглавие</label>
        <input name="title" value={form.title} onChange={onChange} style={input} />

        <label style={label}>Описание</label>
        <textarea name="description" value={form.description} onChange={onChange} style={{ ...input, minHeight: 90 }} />

        <label style={label}>Град</label>
        <input name="city" value={form.city} onChange={onChange} style={input} />

        <label style={label}>Адрес</label>
        <input name="address" value={form.address} onChange={onChange} style={input} />

        <label style={label}>Цена (лв)</label>
        <input name="price" value={form.price} onChange={onChange} style={input} placeholder="пример: 25.00" />

        <label style={label}>Продължителност (минути)</label>
        <input name="durationMinutes" value={form.durationMinutes} onChange={onChange} style={input} placeholder="пример: 30" />

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
          <input type="checkbox" name="active" checked={form.active} onChange={onChange} />
          Активна обява
        </label>

        <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />

        <h3 style={{ margin: "0 0 6px" }}>Кой изпълнява услугата</h3>

        {loadingResources ? (
          <div style={{ opacity: 0.8 }}>Зареждам ресурси…</div>
        ) : resources.length === 0 ? (
          <div style={{ opacity: 0.8 }}>Нямаш активни ресурси. Добави от “Персонал и екипи”.</div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setOpenPicker((current) => !current)}
              style={{ width: "100%", textAlign: "left", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 12, background: "#fff", cursor: "pointer", fontWeight: 900 }}
            >
              {form.resourceIds.length ? `Избрани: ${form.resourceIds.length}` : "Избери персонал/екип"} ▾
            </button>

            {openPicker && (
              <div style={{ marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff", display: "grid", gap: 10 }}>
                {resources.map((resource) => (
                  <label key={resource.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="checkbox" checked={form.resourceIds.includes(resource.id)} onChange={() => toggleResource(resource.id)} />
                    <img src={resource.photoUrl || "https://via.placeholder.com/36?text=%F0%9F%91%A4"} alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" }} />
                    <span style={{ fontWeight: 900 }}>{resource.name}</span>
                    <span style={{ opacity: 0.7 }}>({resource.type})</span>
                  </label>
                ))}

                <button type="button" onClick={() => setOpenPicker(false)} style={smallBtn}>
                  Готово
                </button>
              </div>
            )}
          </div>
        )}

        <label style={label}>Дата</label>
        <input type="date" name="date" value={form.date} onChange={onChange} style={input} />

        <label style={label}>Slot (минути)</label>
        <input name="slotMinutes" value={form.slotMinutes} onChange={onChange} style={input} />

        <button type="submit" style={btn}>
          Публикувай
        </button>
      </form>
    </div>
  );
}

const label = { fontWeight: 800 };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 12 };
const btn = { marginTop: 10, padding: "12px 14px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer" };
const smallBtn = { width: "fit-content", border: "1px solid #cbd5e1", background: "#fff", borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontWeight: 800 };
