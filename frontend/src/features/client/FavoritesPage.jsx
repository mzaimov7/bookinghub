import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ServiceGrid from "../../components/sections/ServiceGrid";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { addFavorite, getFavoriteIds, getFavoriteServices, removeFavorite } from "./api";
import { getCategories } from "../home/api";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [sortBy, setSortBy] = useState("saved");
  const [viewMode, setViewMode] = useState("list");
  const [form, setForm] = useState({
    categoryId: "",
    city: "",
    minPrice: "",
    maxPrice: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    categoryId: "",
    city: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      navigate("/");
      return;
    }

    async function load() {
      setLoading(true);
      const [favoriteServices, ids, loadedCategories] = await Promise.all([
        getFavoriteServices(),
        getFavoriteIds(),
        getCategories().catch(() => []),
      ]);
      setServices(favoriteServices);
      setFavoriteIds(ids);
      setCategories(loadedCategories);
      setLoading(false);
    }

    load();
  }, [navigate]);

  const activeCategory = useMemo(
    () => categories.find((item) => String(item.id) === appliedFilters.categoryId) || null,
    [categories, appliedFilters.categoryId]
  );

  const visibleServices = useMemo(() => {
    let items = services.filter((service) => {
      const serviceCity = normalize(service.city);
      const cityFilter = normalize(appliedFilters.city);
      const minPrice = Number(appliedFilters.minPrice || 0);
      const maxPrice = Number(appliedFilters.maxPrice || 0);
      const servicePrice = Number(service.price || 0);

      if (appliedFilters.categoryId && String(service.categoryId || "") !== appliedFilters.categoryId) {
        return false;
      }
      if (cityFilter && !serviceCity.includes(cityFilter)) {
        return false;
      }
      if (minPrice && servicePrice < minPrice) {
        return false;
      }
      if (maxPrice && servicePrice > maxPrice) {
        return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      items = items.slice().sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      items = items.slice().sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "duration-asc") {
      items = items.slice().sort((a, b) => Number(a.durationMinutes || 0) - Number(b.durationMinutes || 0));
    }

    return items;
  }, [services, appliedFilters, sortBy]);

  async function onToggleFavorite(serviceId) {
    const isFavorite = favoriteIds.includes(serviceId);

    if (isFavorite) {
      await removeFavorite(serviceId);
      setFavoriteIds((current) => current.filter((item) => item !== serviceId));
      setServices((current) => current.filter((item) => item.id !== serviceId));
      return;
    }

    await addFavorite(serviceId);
    setFavoriteIds((current) => [...current, serviceId]);
  }

  function onFieldChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function applyFilters() {
    setAppliedFilters(form);
  }

  function clearFilters() {
    const next = {
      categoryId: "",
      city: "",
      minPrice: "",
      maxPrice: "",
    };
    setForm(next);
    setAppliedFilters(next);
  }

  const hasActiveFilters = Boolean(
    appliedFilters.categoryId || appliedFilters.city || appliedFilters.minPrice || appliedFilters.maxPrice
  );

  return (
    <div style={page}>
      <Header />
      <div style={content}>
        <section style={hero}>
          <div style={heroCopy}>
            <h1 style={title}>Любими</h1>
          </div>

          <div style={heroStats}>
            <StatCard value={services.length} label="Запазени услуги" tone="blue" />
            <Link to="/" style={browseLink}>Открий още</Link>
          </div>
        </section>

        <div style={bodyLayout}>
        {services.length > 0 ? (
          <aside style={sidebar}>
            <div style={sidebarCard}>
              <div style={sidebarTop}>
                <div>
                  <div style={eyebrow}>Филтри</div>
                </div>
                <button onClick={clearFilters} style={clearButton}>Изчисти</button>
              </div>

              <FilterSection
                title="Категории"
                open={showCategories}
                onToggle={() => setShowCategories((current) => !current)}
              >
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Избери категория</span>
                  <select
                    value={form.categoryId}
                    onChange={(event) => onFieldChange("categoryId", event.target.value)}
                    style={fieldInput}
                  >
                    <option value="">Всички категории</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </FilterSection>

              <FilterSection
                title="Локация"
                open={showLocation}
                onToggle={() => setShowLocation((current) => !current)}
              >
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Град</span>
                  <input
                    value={form.city}
                    onChange={(event) => onFieldChange("city", event.target.value)}
                    placeholder="София"
                    style={fieldInput}
                  />
                </label>
              </FilterSection>

              <FilterSection
                title="Ценови диапазон"
                open={showPrice}
                onToggle={() => setShowPrice((current) => !current)}
              >
                <div style={priceGrid}>
                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Мин.</span>
                    <input
                      value={form.minPrice}
                      onChange={(event) => onFieldChange("minPrice", event.target.value)}
                      placeholder="20"
                      inputMode="numeric"
                      style={fieldInput}
                    />
                  </label>

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Макс.</span>
                    <input
                      value={form.maxPrice}
                      onChange={(event) => onFieldChange("maxPrice", event.target.value)}
                      placeholder="120"
                      inputMode="numeric"
                      style={fieldInput}
                    />
                  </label>
                </div>
              </FilterSection>

              {hasActiveFilters ? <div style={hintBox}>Показват се само запазените услуги, които отговарят на текущите филтри.</div> : null}

              <button onClick={applyFilters} style={applyButton}>Приложи филтрите</button>
            </div>
          </aside>
        ) : null}

        <main style={resultsArea}>
          {services.length === 0 ? (
            <div style={emptyCard}>
              <div style={emptyTitle}>Все още нямаш любими</div>
              <p style={emptyText}>Запази услуги от началната страница или от детайлите на услугата и те ще се появят тук.</p>
              <Link to="/" style={emptyLink}>Разгледай услугите</Link>
            </div>
          ) : (
            <section style={resultsShell}>
              <section style={toolbar}>
                <div style={toolbarLeft}>
                  <div style={toolbarCount}>{visibleServices.length} запазени обяви</div>
                  {activeCategory ? <ActiveChip label={`Категория: ${activeCategory.name}`} /> : null}
                  {appliedFilters.city ? <ActiveChip label={`Град: ${appliedFilters.city}`} /> : null}
                  {appliedFilters.minPrice ? <ActiveChip label={`Мин.: €${appliedFilters.minPrice}`} /> : null}
                  {appliedFilters.maxPrice ? <ActiveChip label={`Макс.: €${appliedFilters.maxPrice}`} /> : null}
                </div>

                <div style={toolbarRight}>
                  <label style={toolbarField}>
                    <span style={toolbarLabel}>Сортирай по</span>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={toolbarSelect}>
                      <option value="saved">Последно запазени</option>
                      <option value="price-asc">Цена: възходящо</option>
                      <option value="price-desc">Цена: низходящо</option>
                      <option value="duration-asc">Продължителност: най-кратки първо</option>
                    </select>
                  </label>

                  <div style={viewToggle}>
                    <button
                      onClick={() => setViewMode("grid")}
                      style={{ ...viewButton, ...(viewMode === "grid" ? activeViewButton : null) }}
                    >
                      Мрежа
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      style={{ ...viewButton, ...(viewMode === "list" ? activeViewButton : null) }}
                    >
                      Списък
                    </button>
                  </div>
                </div>
              </section>

              {visibleServices.length === 0 ? (
                <div style={emptyCard}>
                  <div style={emptyTitle}>Няма съвпадения в любимите</div>
                  <p style={emptyText}>Пробвай с друг град, по-широк ценови диапазон или изчисти текущите филтри.</p>
                  <button onClick={clearFilters} style={emptyButton}>Изчисти филтрите</button>
                </div>
              ) : (
                <section style={collectionWrap}>
                  <ServiceGrid
                    services={visibleServices}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={onToggleFavorite}
                    title={null}
                    viewMode={viewMode}
                  />
                </section>
              )}
            </section>
          )}
        </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ value, label, tone }) {
  const palette = {
    blue: { background: "rgba(255,255,255,0.72)", border: "rgba(191,219,254,0.9)", value: "#1d4ed8" },
  };

  return (
    <div style={{ ...statCard, background: palette[tone].background, borderColor: palette[tone].border }}>
      <div style={{ ...statValue, color: palette[tone].value }}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div style={filterSection}>
      <button onClick={onToggle} style={sectionToggle}>
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open ? <div style={sectionBody}>{children}</div> : null}
    </div>
  );
}

function ActiveChip({ label }) {
  return <div style={activeChip}>{label}</div>;
}

const page = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #f8fbff 0%, #eef4fb 26%, #f8fafc 100%)",
};
const content = {
  maxWidth: 1260,
  margin: "0 auto",
  padding: "18px 16px 28px",
  display: "grid",
  gap: 18,
};
const bodyLayout = { display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", gap: 18, alignItems: "start" };
const resultsArea = { minWidth: 0 };
const sidebar = { position: "sticky", top: 128 };
const sidebarCard = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,249,255,0.98) 100%)",
  border: "1px solid rgba(203,213,225,0.9)",
  borderRadius: 24,
  padding: 18,
  boxShadow: "0 20px 48px rgba(148,163,184,0.12)",
};
const sidebarTop = { display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, marginBottom: 12 };
const sidebarTitle = { margin: "8px 0 0", fontSize: 24, lineHeight: 1.05, color: "#0f172a" };
const clearButton = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 800,
};
const hero = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 16,
  padding: "18px 20px",
  borderRadius: 24,
  background: "linear-gradient(135deg, rgba(228,239,255,0.95) 0%, rgba(255,255,255,0.98) 70%, rgba(241,245,249,0.95) 100%)",
  border: "1px solid rgba(191,219,254,0.75)",
  boxShadow: "0 18px 40px rgba(148,163,184,0.12)",
  alignItems: "center",
};
const heroCopy = { maxWidth: 620 };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#2563eb" };
const title = { margin: "8px 0 4px", fontSize: 34, lineHeight: 1.02, color: "#0f172a" };
const heroMeta = { color: "#64748b", fontWeight: 600, lineHeight: 1.5 };
const heroStats = { display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" };
const statCard = { border: "1px solid", borderRadius: 18, padding: "14px 16px 12px", backdropFilter: "blur(10px)", minWidth: 132 };
const statValue = { fontSize: 25, fontWeight: 900, lineHeight: 1 };
const statLabel = { marginTop: 6, color: "#475569", fontWeight: 700, fontSize: 13 };
const browseLink = {
  textDecoration: "none",
  padding: "13px 16px",
  borderRadius: 16,
  background: "#0f172a",
  color: "#fff",
  fontWeight: 900,
  textAlign: "center",
  boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
};
const resultsShell = {
  padding: 16,
  borderRadius: 26,
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(226,232,240,0.95)",
  boxShadow: "0 22px 54px rgba(148,163,184,0.1)",
  backdropFilter: "blur(10px)",
};
const toolbar = {
  padding: "14px 16px",
  borderRadius: 20,
  background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)",
  border: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  boxShadow: "0 10px 24px rgba(148,163,184,0.08)",
};
const toolbarLeft = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
const toolbarRight = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };
const toolbarCount = { fontWeight: 900, color: "#0f172a" };
const toolbarField = { display: "flex", alignItems: "center", gap: 8 };
const toolbarLabel = { fontSize: 13, fontWeight: 800, color: "#475569" };
const toolbarSelect = {
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "10px 12px",
  background: "#fff",
};
const viewToggle = {
  display: "inline-flex",
  padding: 4,
  borderRadius: 14,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
};
const viewButton = {
  border: "none",
  background: "transparent",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 800,
  color: "#1d4ed8",
};
const activeViewButton = {
  background: "#2563eb",
  color: "#fff",
};
const activeChip = {
  padding: "9px 12px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontWeight: 800,
  fontSize: 13,
};
const emptyCard = {
  marginTop: 16,
  background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: "34px 28px",
  boxShadow: "0 24px 60px rgba(148,163,184,0.12)",
};
const emptyTitle = { fontWeight: 900, fontSize: 24, color: "#0f172a" };
const emptyText = { marginTop: 10, color: "#64748b", lineHeight: 1.7, maxWidth: 520 };
const emptyLink = {
  display: "inline-flex",
  marginTop: 16,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
};
const emptyButton = {
  marginTop: 16,
  border: "none",
  padding: "12px 16px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};
const collectionWrap = { marginTop: 14 };
const filterSection = { paddingTop: 12, borderTop: "1px solid #e2e8f0" };
const sectionToggle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "transparent",
  border: "none",
  padding: "4px 0",
  cursor: "pointer",
  fontWeight: 900,
  color: "#0f172a",
  fontSize: 16,
};
const sectionBody = { marginTop: 12, display: "grid", gap: 12 };
const fieldWrap = { display: "grid", gap: 6 };
const fieldLabel = { fontWeight: 800, color: "#334155", fontSize: 13 };
const fieldInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#fff",
};
const priceGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 };
const hintBox = {
  padding: "12px 13px",
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px dashed #cbd5e1",
  color: "#64748b",
  lineHeight: 1.6,
  fontSize: 13,
};
const applyButton = {
  marginTop: 16,
  width: "100%",
  padding: "13px 16px",
  borderRadius: 16,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 18px 40px rgba(37,99,235,0.18)",
};
