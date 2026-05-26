import React, { useEffect, useState } from "react";
import Header from "../../../components/layout/Header";
import { resolveBackendImage } from "../../../lib/assets";
import { getAvailableSlots } from "../../client/api";
import { listMyServices } from "../services/api";
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

function normalizeDateList(values = []) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function formatDayOffDate(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function expandDateRange(fromValue, toValue) {
  if (!fromValue) return [];

  let start = new Date(`${fromValue}T00:00:00`);
  let end = new Date(`${(toValue || fromValue)}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (end < start) {
    [start, end] = [end, start];
  }

  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(toDateInputValue(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function BusinessResourcesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [create, setCreate] = useState({ type: "STAFF", name: "", photoUrl: "", photoFile: null, weeklyOffDays: [] });
  const [previewUrl, setPreviewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForms, setEditForms] = useState({});
  const [scheduleCards, setScheduleCards] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

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

  async function loadSchedule() {
    setScheduleLoading(true);
    try {
      const [services, resourceList] = await Promise.all([listMyServices(), listResources()]);
      const resourceById = new Map(resourceList.map((resource) => [resource.id, resource]));
      const published = services.filter((item) => item.active && item.approvalStatus === "APPROVED").slice(0, 4);
      const cards = await Promise.all(
        published.map(async (service) => {
          const slots = await getAvailableSlots(service.id).catch(() => []);
          const assignedResources = (service.resourceIds || [])
            .map((resourceId) => resourceById.get(resourceId))
            .filter(Boolean);
          const dateMap = new Map();
          slots.forEach((slot) => {
            const dateKey = new Date(slot.startAt).toLocaleDateString("bg-BG", { day: "2-digit", month: "short" });
            const timeValue = new Date(slot.startAt).toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
            if (!dateMap.has(dateKey)) {
              dateMap.set(dateKey, []);
            }
            const current = dateMap.get(dateKey);
            if (current.length < 4) current.push(timeValue);
          });

          return {
            serviceId: service.id,
            title: service.title,
            assignedResources,
            dates: Array.from(dateMap.entries()).slice(0, 3),
            totalSlots: slots.length,
          };
        })
      );
      setScheduleCards(cards);
    } catch {
      setScheduleCards([]);
    } finally {
      setScheduleLoading(false);
    }
  }

  useEffect(() => {
    load();
    loadSchedule();
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
      await loadSchedule();
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
      await loadSchedule();
    } catch (updateError) {
      alert(updateError?.message || "Неуспешно обновяване");
    }
  }

  function startEdit(resource) {
    setEditingId(resource.id);
    setEditForms((current) => ({
      ...current,
      [resource.id]: {
        type: resource.type,
        name: resource.name,
        photoUrl: resource.photoUrl || "",
        photoFile: null,
        previewUrl: "",
        weeklyOffDays: resource.weeklyOffDays || [],
        dayOffDates: resource.dayOffDates || [],
        dayOffFrom: "",
        dayOffTo: "",
      },
    }));
  }

  function cancelEdit(resourceId) {
    setEditingId(null);
    setEditForms((current) => {
      const next = { ...current };
      delete next[resourceId];
      return next;
    });
  }

  function updateEditForm(resourceId, updates) {
    setEditForms((current) => ({
      ...current,
      [resourceId]: { ...(current[resourceId] || {}), ...updates },
    }));
  }

  function onEditFileChange(resourceId, event) {
    const file = event.target.files?.[0] || null;
    updateEditForm(resourceId, {
      photoFile: file,
      previewUrl: file ? URL.createObjectURL(file) : "",
    });
  }

  function toggleEditWeeklyOffDay(resourceId, dayValue) {
    setEditForms((current) => {
      const form = current[resourceId] || { weeklyOffDays: [] };
      const days = form.weeklyOffDays || [];
      return {
        ...current,
        [resourceId]: {
          ...form,
          weeklyOffDays: days.includes(dayValue)
            ? days.filter((item) => item !== dayValue)
            : [...days, dayValue].sort((a, b) => a - b),
        },
      };
    });
  }

  async function saveEdit(resource) {
    const form = editForms[resource.id];
    if (!form?.name?.trim()) {
      alert("Въведи име");
      return;
    }

    try {
      let uploadedPhotoUrl = form.photoUrl?.trim() || null;
      if (form.photoFile) {
        uploadedPhotoUrl = await uploadResourcePhoto(form.photoFile);
      }

      await updateResource(resource.id, {
        type: form.type,
        name: form.name.trim(),
        photoUrl: uploadedPhotoUrl,
        weeklyOffDays: form.weeklyOffDays || [],
        dayOffDates: form.dayOffDates || [],
      });

      cancelEdit(resource.id);
      await load();
      await loadSchedule();
    } catch (updateError) {
      alert(updateError?.message || "Неуспешно обновяване");
    }
  }

  if (loading) return <div style={{ padding: 24, color: "#e2e8f0" }}>Зареждане…</div>;

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

  function addEditDayOffDate(resourceId) {
    setEditForms((current) => {
      const form = current[resourceId] || { dayOffDates: [], dayOffFrom: "", dayOffTo: "" };
      const rangeDates = expandDateRange(form.dayOffFrom, form.dayOffTo);
      if (!rangeDates.length) return current;
      return {
        ...current,
        [resourceId]: {
          ...form,
          dayOffDates: normalizeDateList([...(form.dayOffDates || []), ...rangeDates]),
          dayOffFrom: "",
          dayOffTo: "",
        },
      };
    });
  }

  function removeEditDayOffDate(resourceId, dateValue) {
    setEditForms((current) => {
      const form = current[resourceId] || { dayOffDates: [] };
      return {
        ...current,
        [resourceId]: {
          ...form,
          dayOffDates: (form.dayOffDates || []).filter((item) => item !== dateValue),
        },
      };
    });
  }

  async function toggleWeeklyOffDay(resource, dayValue) {
    const nextWeeklyOffDays = resource.weeklyOffDays.includes(dayValue)
      ? resource.weeklyOffDays.filter((item) => item !== dayValue)
      : [...resource.weeklyOffDays, dayValue].sort((a, b) => a - b);

    try {
      await updateResource(resource.id, { weeklyOffDays: nextWeeklyOffDays });
      await load();
      await loadSchedule();
    } catch (updateError) {
      alert(updateError?.message || "Неуспешно обновяване");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBackground }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>
        <h2 style={{ marginTop: 0, color: "#eff6ff" }}>Персонал и екипи</h2>

        {error && (
          <div style={{ padding: 12, border: "1px solid #fecaca", background: "#fff1f2", borderRadius: 12, marginBottom: 12 }}>
            <b>Грешка:</b> {error}
          </div>
        )}

        <form onSubmit={onCreate} style={{ display: "grid", gap: 10, padding: 18, border: "1px solid rgba(96,165,250,0.22)", borderRadius: 20, background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", boxShadow: "0 22px 45px rgba(15,23,42,0.18)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
            <select value={create.type} onChange={(event) => setCreate((current) => ({ ...current, type: event.target.value }))} style={input}>
              <option value="STAFF">СЛУЖИТЕЛ</option>
              <option value="TEAM">ЕКИП</option>
            </select>
            <input value={create.name} onChange={(event) => setCreate((current) => ({ ...current, name: event.target.value }))} style={input} placeholder="Име (пример: Иван Петров / Екип #1)" />
          </div>

        <label style={uploadWrap}>
          <span style={{ fontWeight: 800, color: "#eff6ff" }}>Добави снимка на служител</span>
          <input type="file" accept="image/*" onChange={onFileChange} style={{ marginTop: 8 }} />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 800, color: "#eff6ff" }}>Редовен график: седмични почивни дни</div>
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

        <div style={{ marginTop: 18, marginBottom: 10, fontSize: 24, fontWeight: 900, color: "#eff6ff" }}>
          Твоите служители и екипи
        </div>

        <div style={{ marginBottom: 18, padding: 18, borderRadius: 20, border: "1px solid rgba(96,165,250,0.22)", background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", boxShadow: "0 18px 34px rgba(15,23,42,0.16)", display: "grid", gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#eff6ff" }}>Актуален работен график</div>
          <div style={{ color: "rgba(191,219,254,0.78)", lineHeight: 1.6 }}>
            Виж обявите и хората, които ги обслужват.
          </div>
          {scheduleLoading ? (
            <div style={{ color: "#cbd5e1" }}>Зареждане на свободните часове…</div>
          ) : !scheduleCards.length ? (
            <div style={{ color: "#cbd5e1" }}>Все още няма публикувани активни обяви със свободни часове.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {scheduleCards.map((card) => (
                <div key={card.serviceId} style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(96,165,250,0.18)", background: "rgba(15,23,42,0.28)", display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900, color: "#eff6ff" }}>{card.title}</div>
                    <div style={{ color: "#93c5fd", fontWeight: 800 }}>{card.totalSlots} свободни часа</div>
                  </div>
                  <div style={assignedWrap}>
                    <span style={assignedLabel}>Обслужват</span>
                    {!card.assignedResources.length ? (
                      <span style={{ color: "rgba(191,219,254,0.72)" }}>Няма избран служител или екип.</span>
                    ) : (
                      <div style={assignedList}>
                        {card.assignedResources.map((resource) => (
                          <span key={resource.id} style={assignedChip}>
                            <img
                              src={resolveBackendImage(resource.photoUrl) || "https://via.placeholder.com/24?text=%F0%9F%91%A4"}
                              alt=""
                              style={assignedAvatar}
                            />
                            <span>{resource.name}</span>
                            <span style={{ color: "rgba(191,219,254,0.62)", fontSize: 11 }}>
                              {resource.type === "TEAM" ? "екип" : "служител"}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {items.map((resource) => (
            <div key={resource.id} style={resourceCard}>
              {editingId === resource.id ? (
                <EditResourceCard
                  form={editForms[resource.id]}
                  resource={resource}
                  onChange={(updates) => updateEditForm(resource.id, updates)}
                  onFileChange={(event) => onEditFileChange(resource.id, event)}
                  onToggleDay={(dayValue) => toggleEditWeeklyOffDay(resource.id, dayValue)}
                  onAddDayOffDate={() => addEditDayOffDate(resource.id)}
                  onRemoveDayOffDate={(dateValue) => removeEditDayOffDate(resource.id, dateValue)}
                  onSave={() => saveEdit(resource)}
                  onCancel={() => cancelEdit(resource.id)}
                />
              ) : (
              <>
                <div style={resourceDetails}>
                <img
                  src={resolveBackendImage(resource.photoUrl) || "https://via.placeholder.com/48?text=%F0%9F%91%A4"}
                  alt=""
                  style={resourceAvatar}
                />

                <div style={resourceBody}>
                  <div style={{ fontWeight: 900, color: "#eff6ff" }}>
                    {resource.name} <span style={{ opacity: 0.6, fontWeight: 700 }}>({resource.type})</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.75, color: "rgba(191,219,254,0.76)" }}>
                    Статус: {resource.active ? "Активен" : "Неактивен"}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={scheduleLabel}>Редовен график</span>
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
                            background: active ? "rgba(127,29,29,0.3)" : "rgba(15,23,42,0.3)",
                            borderColor: active ? "#fda4af" : "rgba(96,165,250,0.22)",
                            color: active ? "#fda4af" : "#cbd5e1",
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={summaryLine}>
                    <span style={scheduleLabel}>Почивен ден / отпуск</span>
                    {(resource.dayOffDates || []).length ? (
                      <span>{resource.dayOffDates.map(formatDayOffDate).join(", ")}</span>
                    ) : (
                      <span>Няма</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={resourceActions}>
                <button onClick={() => startEdit(resource)} style={smallBtn}>
                  Редактирай
                </button>
                <button onClick={() => toggleActive(resource)} style={smallBtn}>
                  {resource.active ? "Деактивирай" : "Активирай"}
                </button>
              </div>
              </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditResourceCard({ form, resource, onChange, onFileChange, onToggleDay, onAddDayOffDate, onRemoveDayOffDate, onSave, onCancel }) {
  const current = form || {
    type: resource.type,
    name: resource.name,
    photoUrl: resource.photoUrl || "",
    previewUrl: "",
    weeklyOffDays: resource.weeklyOffDays || [],
    dayOffDates: resource.dayOffDates || [],
    dayOffFrom: "",
    dayOffTo: "",
  };
  const imageUrl = current.previewUrl || resolveBackendImage(current.photoUrl);

  return (
    <div style={editCard}>
      <div style={editHeader}>
        <img
          src={imageUrl || "https://via.placeholder.com/72?text=%F0%9F%91%A4"}
          alt=""
          style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover", border: "1px solid rgba(96,165,250,0.28)" }}
        />
        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          <select value={current.type} onChange={(event) => onChange({ type: event.target.value })} style={input}>
            <option value="STAFF">СЛУЖИТЕЛ</option>
            <option value="TEAM">ЕКИП</option>
          </select>
          <input value={current.name} onChange={(event) => onChange({ name: event.target.value })} style={input} placeholder="Име" />
        </div>
      </div>

      <label style={uploadWrap}>
        <span style={{ fontWeight: 800, color: "#eff6ff" }}>Смени снимката</span>
        <input type="file" accept="image/*" onChange={onFileChange} style={{ marginTop: 8, color: "#cbd5e1" }} />
      </label>

      {imageUrl ? (
        <button type="button" onClick={() => onChange({ photoUrl: "", photoFile: null, previewUrl: "" })} style={smallBtn}>
          Махни снимката
        </button>
      ) : null}

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 800, color: "#eff6ff" }}>Редовен график: седмични почивни дни</div>
        <div style={dayChipWrap}>
          {weekdayOptions.map((day) => {
            const active = current.weeklyOffDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => onToggleDay(day.value)}
                style={{
                  ...dayChip,
                  background: active ? "rgba(127,29,29,0.3)" : "rgba(15,23,42,0.3)",
                  borderColor: active ? "#fda4af" : "rgba(96,165,250,0.22)",
                  color: active ? "#fda4af" : "#cbd5e1",
                }}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 800, color: "#eff6ff" }}>Конкретни почивни дати</div>
        <div style={datePickerRow}>
          <label style={dateField}>
            <span style={dateFieldLabel}>От</span>
            <input
              type="date"
              value={current.dayOffFrom || ""}
              onChange={(event) => onChange({ dayOffFrom: event.target.value })}
              onInput={(event) => onChange({ dayOffFrom: event.target.value })}
              style={{ ...input, ...dateInput }}
            />
          </label>
          <label style={dateField}>
            <span style={dateFieldLabel}>До</span>
            <input
              type="date"
              value={current.dayOffTo || ""}
              onChange={(event) => onChange({ dayOffTo: event.target.value })}
              onInput={(event) => onChange({ dayOffTo: event.target.value })}
              style={{ ...input, ...dateInput }}
            />
          </label>
          <button type="button" onClick={onAddDayOffDate} style={{ ...smallBtn, ...dateAddButton }}>
            Добави период
          </button>
        </div>
        <DayOffDateList dates={current.dayOffDates || []} onRemove={onRemoveDayOffDate} emptyText="Няма добавени конкретни почивни дати." />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={smallBtn}>Откажи</button>
        <button type="button" onClick={onSave} style={btn}>Запази</button>
      </div>
    </div>
  );
}

function DayOffDateList({ dates, onRemove, emptyText }) {
  const normalizedDates = normalizeDateList(dates || []);

  if (!normalizedDates.length) {
    return <div style={emptyDatesText}>{emptyText}</div>;
  }

  return (
    <div style={dateChipWrap}>
      {normalizedDates.map((dateValue) => (
        <span key={dateValue} style={dateChip}>
          <span>{formatDayOffDate(dateValue)}</span>
          <button type="button" onClick={() => onRemove(dateValue)} style={dateRemoveButton} aria-label="Премахни дата">
            x
          </button>
        </span>
      ))}
    </div>
  );
}

const pageBackground = "radial-gradient(circle at top left, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 16%, #eaf2ff 44%, #f6f9ff 100%)";
const input = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid rgba(96,165,250,0.22)", borderRadius: 12, background: "rgba(15,23,42,0.3)", color: "#eff6ff" };
const btn = { padding: "12px 14px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer" };
const smallBtn = { boxSizing: "border-box", border: "1px solid rgba(96,165,250,0.22)", background: "rgba(15,23,42,0.34)", color: "#eff6ff", borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontWeight: 800 };
const uploadWrap = { display: "grid", padding: 12, border: "1px dashed rgba(96,165,250,0.24)", borderRadius: 14, background: "rgba(15,23,42,0.26)" };
const dayChipWrap = { display: "flex", gap: 8, flexWrap: "wrap" };
const dayChip = { border: "1px solid rgba(96,165,250,0.22)", borderRadius: 999, padding: "8px 12px", fontWeight: 800, cursor: "pointer", background: "rgba(15,23,42,0.3)" };
const resourceCard = {
  padding: 14,
  border: "1px solid rgba(96,165,250,0.22)",
  borderRadius: 14,
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 14,
  alignItems: "stretch",
  boxShadow: "0 18px 34px rgba(15,23,42,0.16)",
};
const resourceDetails = { display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 };
const resourceAvatar = { width: 48, height: 48, borderRadius: 999, objectFit: "cover", border: "1px solid rgba(96,165,250,0.22)", flex: "0 0 auto" };
const resourceBody = { display: "grid", gap: 0, minWidth: 0, width: "100%" };
const resourceActions = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignSelf: "end" };
const datePickerRow = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, alignItems: "end" };
const dateField = { display: "grid", gap: 5, minWidth: 0 };
const dateFieldLabel = { color: "#93c5fd", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 };
const dateInput = { minWidth: 0, height: 40 };
const dateAddButton = { width: "100%", minHeight: 40, whiteSpace: "normal", textAlign: "center", lineHeight: 1.2 };
const dateChipWrap = { display: "flex", gap: 8, flexWrap: "wrap" };
const dateChip = { display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 8px 7px 11px", borderRadius: 999, border: "1px solid rgba(96,165,250,0.22)", background: "rgba(37,99,235,0.14)", color: "#dbeafe", fontWeight: 800, fontSize: 13 };
const dateRemoveButton = { width: 22, height: 22, borderRadius: 999, border: "1px solid rgba(191,219,254,0.28)", background: "rgba(15,23,42,0.34)", color: "#eff6ff", cursor: "pointer", fontWeight: 900, lineHeight: 1 };
const emptyDatesText = { color: "rgba(191,219,254,0.68)", fontSize: 13 };
const scheduleLabel = { color: "#93c5fd", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, marginRight: 2 };
const summaryLine = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, color: "rgba(191,219,254,0.76)", fontSize: 13 };
const editCard = { width: "100%", display: "grid", gap: 12 };
const editHeader = { display: "grid", gridTemplateColumns: "72px minmax(0, 1fr)", gap: 12, alignItems: "center" };
const assignedWrap = {
  display: "grid",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(8,18,36,0.34)",
};
const assignedLabel = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.4,
  textTransform: "uppercase",
};
const assignedList = { display: "flex", gap: 8, flexWrap: "wrap" };
const assignedChip = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "6px 10px 6px 6px",
  borderRadius: 999,
  border: "1px solid rgba(96,165,250,0.2)",
  background: "rgba(37,99,235,0.12)",
  color: "#eff6ff",
  fontWeight: 850,
  fontSize: 13,
};
const assignedAvatar = {
  width: 24,
  height: 24,
  borderRadius: 999,
  objectFit: "cover",
  border: "1px solid rgba(147,197,253,0.35)",
};
