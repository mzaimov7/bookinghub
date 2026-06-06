import { resolveBackendImage } from "../../../lib/assets";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/layout/Header";
import { getCategories } from "../../home/api";
import {
  createService,
  getMyService,
  listActiveResources,
  updateService,
  uploadServiceImage,
} from "./api";

export default function BusinessCreateServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const todayKey = new Date().toISOString().split("T")[0];
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingService, setLoadingService] = useState(isEditMode);
  const [uploading, setUploading] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [openCategoryPicker, setOpenCategoryPicker] = useState(false);
  const [openSuggestionForm, setOpenSuggestionForm] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    city: "",
    address: "",
    price: "",
    durationMinutes: "",
    opensAt: "09:00",
    closesAt: "18:00",
    slotIntervalMinutes: 30,
    bookingHorizonDays: 90,
    resourceIds: [],
    categorySuggestion: "",
  });

  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === form.categoryId) || null,
    [categories, form.categoryId]
  );

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
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
    setFieldErrors((current) => ({ ...current, resourceIds: "" }));
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

  async function loadCategories() {
    setLoadingCategories(true);

    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadResources();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setLoadingService(false);
      return;
    }

    let active = true;

    async function loadService() {
      setLoadingService(true);
      setError("");

      try {
        const data = await getMyService(id);
        if (!active) return;

        setForm((current) => ({
          ...current,
          categoryId: data.categoryId ? String(data.categoryId) : "",
          title: data.title ?? "",
          description: data.description ?? "",
          city: data.city ?? "",
          address: data.address ?? "",
          price: data.price ? String(data.price) : "",
          durationMinutes: data.durationMinutes ? String(data.durationMinutes) : "",
          opensAt: data.opensAt || "09:00",
          closesAt: data.closesAt || "18:00",
          slotIntervalMinutes: data.slotIntervalMinutes ? String(data.slotIntervalMinutes) : "30",
          bookingHorizonDays: data.bookingHorizonDays ? String(data.bookingHorizonDays) : "90",
          resourceIds: Array.isArray(data.resourceIds) ? data.resourceIds : [],
          categorySuggestion: data.categorySuggestion ?? "",
        }));
        setExistingImages(Array.isArray(data.imageUrls) ? data.imageUrls.filter(Boolean) : []);
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.message || "Failed to load listing");
      } finally {
        if (active) setLoadingService(false);
      }
    }

    loadService();

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      categoryId: Number(form.categoryId),
      categorySuggestion: form.categorySuggestion.trim() || null,
      title: form.title.trim(),
      description: form.description?.trim() || null,
      city: form.city.trim(),
      address: form.address.trim(),
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      opensAt: form.opensAt,
      closesAt: form.closesAt,
      slotIntervalMinutes: Number(form.slotIntervalMinutes),
      bookingHorizonDays: Number(form.bookingHorizonDays),
      active: true,
      resourceIds: form.resourceIds.map(Number),
      imageUrls: isEditMode ? null : [],
      coverIndex,
    };

    const nextFieldErrors = {};
    if (!payload.categoryId) nextFieldErrors.categoryId = "Избери категория.";
    if (!payload.title) nextFieldErrors.title = "Въведи заглавие.";
    if (!payload.city) nextFieldErrors.city = "Въведи град.";
    if (!payload.address) nextFieldErrors.address = "Въведи адрес.";
    if (!payload.price || payload.price <= 0) nextFieldErrors.price = "Цената трябва да е по-голяма от 0.";
    if (!payload.durationMinutes || payload.durationMinutes <= 0) nextFieldErrors.durationMinutes = "Продължителността трябва да е по-голяма от 0.";
    if (!payload.resourceIds.length) nextFieldErrors.resourceIds = "Избери поне един служител или екип.";

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }
    setFieldErrors({});

    try {
      setUploading(true);
      if (imageFiles.length > 3) {
        throw new Error("You can upload up to 3 images.");
      }

      if (imageFiles.length) {
        const uploadedUrls = [];
        for (const file of imageFiles) {
          const imageUrl = await uploadServiceImage(file);
          if (imageUrl) uploadedUrls.push(imageUrl);
        }
        payload.imageUrls = uploadedUrls;
      }

      const data = isEditMode ? await updateService(id, payload) : await createService(payload);
      navigate(`/business/services${data?.id ? `#service-${data.id}` : ""}`);
    } catch (error) {
      setFieldErrors(fieldErrorsForServiceForm(error));
      if (!Object.keys(fieldErrorsForServiceForm(error)).length) {
        setError(error.message);
      }
    } finally {
      setUploading(false);
    }
  }

  function onImagesChange(event) {
    const files = Array.from(event.target.files || []).slice(0, 3);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    setCoverIndex(0);
  }

  if (loadingService) {
    return <div style={{ padding: 24 }}>Зареждане на обявата…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBackground }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 44px" }}>
        <div style={heroCard}>
          <h2 style={{ margin: "8px 0 10px", fontSize: 34, lineHeight: 1.05, color: "#eff6ff" }}>
            {isEditMode ? "Редактирай обявата си и добавяй още служители по-късно." : "Добави обява"}
          </h2>
          <p style={{ margin: 0, maxWidth: 620, color: "rgba(226,232,240,0.8)", fontSize: 16, lineHeight: 1.6 }}>
            {isEditMode
              ? "Обнови детайлите на услугата, свържи нови хора или екипи и контролирай графика, по който клиентите резервират."
              : "Добави обявата, свържи правилния служител или екип и задай работния график за резервации."}
          </p>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={onSubmit} style={formCard}>
        <label style={label}>Категория</label>
        {loadingCategories ? (
          <div style={categoryLoadingCard}>Зареждане на категории...</div>
        ) : (
          <div style={categoryPickerWrap}>
            <button
              type="button"
              onClick={() => setOpenCategoryPicker((current) => !current)}
              style={categoryPickerTrigger}
            >
              <span>Избери категория</span>
              <span
                style={{
                  ...categoryPickerArrow,
                  transform: openCategoryPicker ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▾
              </span>
            </button>

            <div
              style={{
                ...categoryPickerDropdownWrap,
                gridTemplateRows: openCategoryPicker ? "1fr" : "0fr",
                opacity: openCategoryPicker ? 1 : 0,
                pointerEvents: openCategoryPicker ? "auto" : "none",
              }}
            >
              <div style={categoryPickerDropdownInner}>
                <div
                  style={{
                    ...categoryPickerDropdown,
                    transform: openCategoryPicker ? "translateY(0)" : "translateY(-8px)",
                  }}
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setForm((current) => ({ ...current, categoryId: String(category.id) }));
                        setFieldErrors((current) => ({ ...current, categoryId: "" }));
                        setOpenCategoryPicker(false);
                      }}
                      style={categoryPickerItem}
                    >
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={selectedCategoryCard}>
              <div style={selectedCategoryTitle}>Избрана категория</div>
              <div style={selectedCategoryName}>{selectedCategory?.name || "Все още няма избрана категория"}</div>
              <div style={selectedCategoryText}>
                {selectedCategory?.description?.trim() || "Избери категория, за да видиш какви услуги най-често попадат в нея."}
              </div>
            </div>
            {fieldErrors.categoryId ? <div style={fieldErrorText}>{fieldErrors.categoryId}</div> : null}

            <div style={categorySuggestionWrap}>
              <button type="button" onClick={() => setOpenSuggestionForm((current) => !current)} style={categorySuggestionToggle}>
                Не намираш подходяща категория?
              </button>

              {openSuggestionForm ? (
                <div style={categorySuggestionCard}>
                  <label style={label}>Опиши липсващата категория</label>
                  <textarea
                    name="categorySuggestion"
                    value={form.categorySuggestion}
                    onChange={onChange}
                    style={{ ...input, minHeight: 110 }}
                    placeholder="Например: Детски аниматори, организиране на рождени дни и забавления за деца."
                  />

                  <div style={categorySuggestionHint}>
                    Текстът ще се запази към тази обява. Ако админът прецени, по-късно ще създаде нова категория ръчно.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <label style={label}>Заглавие</label>
        <input name="title" value={form.title} onChange={onChange} style={{ ...input, ...(fieldErrors.title ? inputError : null) }} />
        {fieldErrors.title ? <div style={fieldErrorText}>{fieldErrors.title}</div> : null}

        <label style={label}>Описание</label>
        <textarea name="description" value={form.description} onChange={onChange} style={{ ...input, minHeight: 90 }} />

        <label style={label}>Град</label>
        <input name="city" value={form.city} onChange={onChange} style={{ ...input, ...(fieldErrors.city ? inputError : null) }} />
        {fieldErrors.city ? <div style={fieldErrorText}>{fieldErrors.city}</div> : null}

        <label style={label}>Адрес</label>
        <input name="address" value={form.address} onChange={onChange} style={{ ...input, ...(fieldErrors.address ? inputError : null) }} />
        {fieldErrors.address ? <div style={fieldErrorText}>{fieldErrors.address}</div> : null}

        <div style={metricBlock}>
          <div style={metricField}>
            <label style={label}>Цена</label>
            <span style={metricHint}>В евро</span>
            <input name="price" value={form.price} onChange={onChange} style={{ ...input, ...(fieldErrors.price ? inputError : null) }} placeholder="25.00" />
            {fieldErrors.price ? <div style={fieldErrorText}>{fieldErrors.price}</div> : null}
          </div>
          <div style={metricField}>
            <label style={label}>Продължителност</label>
            <span style={metricHint}>В минути</span>
            <input name="durationMinutes" value={form.durationMinutes} onChange={onChange} style={{ ...input, ...(fieldErrors.durationMinutes ? inputError : null) }} placeholder="60" />
            {fieldErrors.durationMinutes ? <div style={fieldErrorText}>{fieldErrors.durationMinutes}</div> : null}
          </div>
        </div>

        <div style={timeBlock}>
          <label style={label}>Работно време</label>
          <div style={timeRow}>
            <div style={timeField}>
              <span style={timeFieldLabel}>Начало</span>
              <input type="time" name="opensAt" value={form.opensAt} onChange={onChange} style={input} />
            </div>
            <div style={timeDivider}>→</div>
            <div style={timeField}>
              <span style={timeFieldLabel}>Край</span>
              <input type="time" name="closesAt" value={form.closesAt} onChange={onChange} style={input} />
            </div>
          </div>
        </div>

        <div style={metricBlock}>
          <div style={metricField}>
            <label style={label}>Интервал за резервации</label>
            <span style={metricHint}>В минути</span>
            <input name="slotIntervalMinutes" value={form.slotIntervalMinutes} onChange={onChange} style={input} placeholder="30" />
          </div>
          <div style={metricField}>
            <label style={label}>Хоризонт за резервации</label>
            <span style={metricHint}>В дни</span>
            <input name="bookingHorizonDays" value={form.bookingHorizonDays} onChange={onChange} style={input} placeholder="90" />
          </div>
        </div>

        <div style={divider} />

        <div style={sectionTitleWrap}>
          <div style={sectionLead}>Галерия</div>
          {isEditMode ? <h3 style={sectionSubtleTitle}>Запази или замени снимките на обявата</h3> : null}
        </div>

        <label style={uploadWrap}>
          <span style={{ fontWeight: 700, color: "rgba(191,219,254,0.72)" }}>Добави снимки към обявата</span>
          <input type="file" accept="image/*" multiple onChange={onImagesChange} style={{ marginTop: 8, color: "transparent", maxWidth: 132 }} />
        </label>

        {!imagePreviews.length && existingImages.length > 0 && (
        <div style={previewGrid}>
            {existingImages.map((src, index) => (
              <div key={`${src}-${index}`} style={previewCardStatic}>
                <img src={resolveBackendImage(src)} alt={`Current ${index + 1}`} style={previewImage} />
                <div style={previewFooter}>
                  <span>{index === 0 ? "Текуща корица" : `Текуща снимка ${index + 1}`}</span>
                  <strong>Запазена</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {imagePreviews.length > 0 && (
          <div style={previewGrid}>
            {imagePreviews.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setCoverIndex(index)}
                style={{
                  ...previewCard,
                  borderColor: coverIndex === index ? "#2563eb" : "#dbe4f0",
                  boxShadow: coverIndex === index ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
                }}
              >
                <img src={src} alt={`Preview ${index + 1}`} style={previewImage} />
                <div style={previewFooter}>
                  <span>{coverIndex === index ? "Основна снимка" : `Снимка ${index + 1}`}</span>
                  {coverIndex === index ? <strong>Корица</strong> : <span>Задай като корица</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={sectionTitleWrap}>
          <div style={sectionLead}>Разпределение</div>
          <h3 style={sectionSubtleTitle}>Кой ще обслужва тази обява</h3>
        </div>

        {loadingResources ? (
          <div style={{ opacity: 0.8, color: "rgba(191,219,254,0.74)" }}>Зареждане на активни служители и екипи...</div>
        ) : resources.length === 0 ? (
          <div style={{ opacity: 0.8, color: "rgba(191,219,254,0.74)" }}>Все още нямаш активни хора или екипи. Добави ги от „Персонал и екипи“.</div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setOpenPicker((current) => !current)}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "1px solid rgba(96,165,250,0.22)", borderRadius: 16, background: "rgba(15,23,42,0.3)", color: "#eff6ff", cursor: "pointer", fontWeight: 900 }}
            >
              {form.resourceIds.length ? `Избрани: ${form.resourceIds.length}` : "Избери служител или екип"} ▾
            </button>

            {openPicker && (
              <div style={{ marginTop: 10, border: "1px solid rgba(96,165,250,0.22)", borderRadius: 16, padding: 12, background: "rgba(8,18,36,0.94)", display: "grid", gap: 10 }}>
                {resources.map((resource) => (
                  <label key={resource.id} style={pickerRow}>
                    <input type="checkbox" checked={form.resourceIds.includes(resource.id)} onChange={() => toggleResource(resource.id)} />
                    <img src={resolveBackendImage(resource.photoUrl) || "https://via.placeholder.com/36?text=%F0%9F%91%A4"} alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: "cover", border: "1px solid rgba(96,165,250,0.22)" }} />
                    <span style={{ fontWeight: 900 }}>{resource.name}</span>
                    <span style={{ opacity: 0.7, color: "rgba(191,219,254,0.74)" }}>{resource.type === "TEAM" ? "Екип" : "Служител"}</span>
                  </label>
                ))}

                <button type="button" onClick={() => setOpenPicker(false)} style={smallBtn}>
                  Готово
                </button>
              </div>
            )}
          </div>
        )}
        {fieldErrors.resourceIds ? <div style={fieldErrorText}>{fieldErrors.resourceIds}</div> : null}

        <div style={divider} />

        <div style={sectionTitleWrap}>
          <div style={sectionLead}>График на резервациите</div>
        </div>

        <div style={scheduleHintList}>
          <div style={scheduleHintItem}>• Интервалът определя през колко минути да се показват часовете за резервация.</div>
          <div style={scheduleHintItem}>• Хоризонтът определя колко дни напред клиентите могат да резервират.</div>
          <div style={scheduleHintItem}>• Почивките и работните дни на служителите се управляват от менюто за персонала.</div>
        </div>

        <button type="submit" style={btn}>
          {uploading ? (isEditMode ? "Запазване..." : "Публикуване...") : isEditMode ? "Запази промените по обявата" : "Публикувай обявата"}
        </button>
        </form>
      </div>
    </div>
  );
}

function fieldErrorsForServiceForm(error) {
  if (error?.errors) return error.errors;
  const message = error?.message || "";
  if (message.includes("categoryId") || message.toLowerCase().includes("category")) return { categoryId: message };
  if (message.toLowerCase().includes("title") || message.includes("заглав")) return { title: message };
  if (message.includes("град") || message.toLowerCase().includes("city")) return { city: message };
  if (message.includes("адрес") || message.toLowerCase().includes("address")) return { address: message };
  if (message.includes("Цена") || message.toLowerCase().includes("price")) return { price: message };
  if (message.includes("Продължителност") || message.toLowerCase().includes("duration")) return { durationMinutes: message };
  if (message.includes("resource") || message.includes("служител") || message.includes("екип")) return { resourceIds: message };
  return {};
}

const pageBackground = "radial-gradient(circle at top left, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 16%, #eaf2ff 44%, #f6f9ff 100%)";
const label = { fontWeight: 800, color: "#eff6ff" };
const input = { width: "100%", padding: "12px 14px", border: "1px solid rgba(96,165,250,0.22)", borderRadius: 14, boxSizing: "border-box", background: "rgba(15,23,42,0.3)", color: "#eff6ff" };
const inputError = { border: "1px solid rgba(248,113,113,0.72)", boxShadow: "0 0 0 3px rgba(248,113,113,0.12)" };
const fieldErrorText = { color: "#fca5a5", fontSize: 12, fontWeight: 800, lineHeight: 1.35 };
const btn = { marginTop: 6, padding: "14px 18px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontWeight: 900, cursor: "pointer" };
const smallBtn = { width: "fit-content", border: "1px solid rgba(96,165,250,0.22)", background: "rgba(15,23,42,0.34)", color: "#eff6ff", borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontWeight: 800 };
const grid2 = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const divider = { borderTop: "1px solid rgba(96,165,250,0.18)", margin: "4px 0" };
const sectionTitleWrap = { display: "grid", gap: 2 };
const sectionEyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 1.6, fontWeight: 900, color: "rgba(191,219,254,0.72)" };
const sectionTitle = { margin: 0, fontSize: 20, color: "#eff6ff" };
const sectionLead = { fontSize: 18, fontWeight: 900, color: "rgba(226,232,240,0.8)" };
const sectionSubtleTitle = { margin: 0, fontSize: 14, color: "rgba(191,219,254,0.72)", fontWeight: 700, lineHeight: 1.5 };
const formCard = { background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", border: "1px solid rgba(96,165,250,0.22)", boxShadow: "0 22px 45px rgba(15, 23, 42, 0.18)", borderRadius: 24, padding: 22, display: "grid", gap: 12 };
const heroCard = { marginBottom: 18, padding: "22px 24px", borderRadius: 28, background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", border: "1px solid rgba(96,165,250,0.24)" };
const errorBox = { marginBottom: 16, padding: 14, borderRadius: 16, border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", fontWeight: 700 };
const pickerRow = { display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 10, alignItems: "center", padding: "8px 4px", color: "#eff6ff" };
const metricBlock = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};
const metricField = {
  display: "grid",
  gap: 8,
};
const metricHint = {
  fontSize: 13,
  color: "rgba(191,219,254,0.72)",
  fontWeight: 700,
};
const timeBlock = { display: "grid", gap: 10 };
const timeRow = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
  gap: 12,
  alignItems: "end",
};
const timeField = { display: "grid", gap: 8 };
const timeFieldLabel = {
  fontSize: 13,
  fontWeight: 800,
  color: "rgba(191,219,254,0.72)",
  textTransform: "uppercase",
  letterSpacing: 0.6,
};
const timeDivider = {
  paddingBottom: 12,
  color: "rgba(191,219,254,0.72)",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};
const scheduleHintList = {
  display: "grid",
  gap: 6,
  color: "rgba(226,232,240,0.8)",
  fontSize: 14,
  lineHeight: 1.6,
};
const scheduleHintItem = {
  color: "rgba(226,232,240,0.8)",
};
const categoryLoadingCard = {
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(15,23,42,0.34)",
  color: "rgba(191,219,254,0.72)",
  fontWeight: 700,
};
const categoryPickerWrap = {
  display: "grid",
  gap: 10,
};
const categoryPickerTrigger = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  textAlign: "left",
  padding: "13px 14px",
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(15,23,42,0.3)",
  color: "#eff6ff",
  fontWeight: 900,
  cursor: "pointer",
};
const categoryPickerArrow = {
  color: "rgba(191,219,254,0.86)",
  fontSize: 16,
  lineHeight: 1,
  transition: "transform 180ms ease",
};
const categoryPickerDropdownWrap = {
  display: "grid",
  transition: "grid-template-rows 180ms ease, opacity 180ms ease",
};
const categoryPickerDropdownInner = {
  overflow: "hidden",
};
const categoryPickerDropdown = {
  maxHeight: 280,
  overflowY: "auto",
  display: "grid",
  gap: 6,
  padding: 10,
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(8,18,36,0.96)",
  boxShadow: "0 18px 40px rgba(2,6,23,0.28)",
  transition: "transform 180ms ease",
};
const categoryPickerItem = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid transparent",
  background: "rgba(15,23,42,0.48)",
  color: "#eff6ff",
  textAlign: "left",
  fontWeight: 800,
  cursor: "pointer",
};
const selectedCategoryCard = {
  display: "grid",
  gap: 6,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.2)",
  background: "rgba(15,23,42,0.22)",
};
const selectedCategoryTitle = {
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(191,219,254,0.72)",
  textTransform: "uppercase",
  letterSpacing: 0.9,
};
const selectedCategoryName = {
  fontSize: 15,
  fontWeight: 900,
  color: "#eff6ff",
};
const selectedCategoryText = {
  color: "rgba(226,232,240,0.78)",
  lineHeight: 1.6,
  fontSize: 14,
};
const categorySuggestionWrap = {
  display: "grid",
  gap: 10,
};
const categorySuggestionToggle = {
  width: "fit-content",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(96,165,250,0.2)",
  background: "rgba(15,23,42,0.22)",
  color: "#bfdbfe",
  fontWeight: 800,
  cursor: "pointer",
};
const categorySuggestionCard = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.22)",
};
const categorySuggestionHint = {
  color: "rgba(191,219,254,0.72)",
  lineHeight: 1.6,
  fontSize: 13,
};
const categorySuggestionButton = {
  width: "fit-content",
  padding: "12px 14px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
const categorySuggestionSuccess = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(74,222,128,0.22)",
  background: "rgba(20,83,45,0.22)",
  color: "#dcfce7",
  fontWeight: 700,
};
const uploadWrap = { display: "grid", padding: 12, border: "1px dashed rgba(96,165,250,0.24)", borderRadius: 14, background: "rgba(15,23,42,0.28)" };
const previewGrid = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 };
const previewCard = { padding: 0, overflow: "hidden", borderRadius: 18, border: "1px solid rgba(96,165,250,0.22)", background: "rgba(15,23,42,0.34)", cursor: "pointer", textAlign: "left" };
const previewCardStatic = { padding: 0, overflow: "hidden", borderRadius: 18, border: "1px solid rgba(96,165,250,0.22)", background: "rgba(15,23,42,0.34)", textAlign: "left" };
const previewImage = { width: "100%", height: 180, objectFit: "cover", display: "block" };
const previewFooter = { display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", fontSize: 13, color: "#e2e8f0" };
