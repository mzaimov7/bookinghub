import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ServiceGrid from "../../components/sections/ServiceGrid";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { addFavorite, getFavoriteIds, getRecentSearches, removeFavorite, saveRecentSearch } from "../client/api";
import { getCategories, searchServices } from "../home/api";

function normalize(value) {
  if (value == null) return "";
  return String(value).trim();
}

function readFilters(params) {
  return {
    query: normalize(params.get("query")),
    city: normalize(params.get("city")),
    categoryId: normalize(params.get("categoryId")),
    minPrice: normalize(params.get("minPrice")),
    maxPrice: normalize(params.get("maxPrice")),
  };
}

function hasFilters(filters) {
  return Boolean(
    filters.query ||
    filters.city ||
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice
  );
}

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  const [openCategoryPicker, setOpenCategoryPicker] = useState(false);
  const [openSortPicker, setOpenSortPicker] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");
  const [viewMode, setViewMode] = useState("grid");
  const [form, setForm] = useState(() => readFilters(searchParams));

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const activeCategory = useMemo(
    () => categories.find((item) => String(item.id) === filters.categoryId) || null,
    [categories, filters.categoryId]
  );
  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === form.categoryId) || null,
    [categories, form.categoryId]
  );
  const sortLabel = useMemo(() => {
    if (sortBy === "price-asc") return "Цена: възходящо";
    if (sortBy === "price-desc") return "Цена: низходящо";
    if (sortBy === "top-rated") return "Най-високо оценени";
    return "Най-подходящи";
  }, [sortBy]);

  useEffect(() => {
    setForm(filters);
  }, [filters]);

  useEffect(() => {
    if (!isLoggedIn() || getRole() !== "CLIENT") {
      setFavoritesOnly(false);
    }
  }, []);

  useEffect(() => {
    async function loadInitial() {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);

      if (isLoggedIn() && getRole() === "CLIENT") {
        const [loadedRecentSearches, loadedFavoriteIds] = await Promise.all([
          getRecentSearches().catch(() => []),
          getFavoriteIds().catch(() => []),
        ]);
        setRecentSearches(loadedRecentSearches);
        setFavoriteIds(loadedFavoriteIds);
      }
    }

    loadInitial();
  }, []);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      const data = await searchServices(filters);
      setServices(data);

      if (isLoggedIn() && getRole() === "CLIENT" && hasFilters(filters)) {
        await saveRecentSearch({
          query: filters.query || null,
          city: filters.city || null,
          categoryId: filters.categoryId ? Number(filters.categoryId) : null,
          minPrice: filters.minPrice ? Number(filters.minPrice) : null,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
        }).catch(() => {});
        setRecentSearches(await getRecentSearches().catch(() => []));
      }

      setLoading(false);
    }

    loadResults();
  }, [filters]);

  function writeFilters(next) {
    const params = new URLSearchParams();

    if (next.query) params.set("query", next.query);
    if (next.city) params.set("city", next.city);
    if (next.categoryId) params.set("categoryId", next.categoryId);
    if (next.minPrice) params.set("minPrice", next.minPrice);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    setSearchParams(params);
  }

  function onHeaderSearchSubmit(next) {
    writeFilters({
      query: normalize(next.query),
      city: normalize(next.city),
      categoryId: normalize(next.categoryId),
      minPrice: normalize(next.minPrice),
      maxPrice: normalize(next.maxPrice),
    });
  }

  function onHeaderCategoryPick(category) {
    writeFilters({
      ...filters,
      categoryId: String(category.id),
    });
  }

  function onHeaderRecentSearchPick(item) {
    writeFilters({
      query: item.query || "",
      city: item.city || "",
      categoryId: item.categoryId != null ? String(item.categoryId) : "",
      minPrice: item.minPrice != null ? String(item.minPrice) : "",
      maxPrice: item.maxPrice != null ? String(item.maxPrice) : "",
    });
  }

  function onFieldChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function applySidebarFilters() {
    writeFilters(form);
  }

  function clearFilters() {
    const next = {
      query: filters.query,
      city: "",
      categoryId: "",
      minPrice: "",
      maxPrice: "",
    };
    setForm(next);
    writeFilters(next);
  }

  async function onToggleFavorite(serviceId) {
    const isFavorite = favoriteIds.includes(serviceId);

    if (isFavorite) {
      await removeFavorite(serviceId);
      setFavoriteIds((current) => current.filter((item) => item !== serviceId));
      return;
    }

    await addFavorite(serviceId);
    setFavoriteIds((current) => [...current, serviceId]);
  }

  const visibleServices = useMemo(() => {
    let items = services.slice();

    if (favoritesOnly) {
      items = items.filter((item) => favoriteIds.includes(item.id));
    }

    if (sortBy === "price-asc") {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "top-rated") {
      items.sort((a, b) => {
        const scoreA = Number(a.price || 0) + Number(a.durationMinutes || 0);
        const scoreB = Number(b.price || 0) + Number(b.durationMinutes || 0);
        return scoreA - scoreB;
      });
    }

    return items;
  }, [services, favoritesOnly, favoriteIds, sortBy]);

  const heading = filters.query
    ? `Резултати за "${filters.query}"`
    : activeCategory
      ? `${activeCategory.name} услуги`
      : "Резултати от търсенето";

  return (
    <div style={page}>
      <Header
        categories={categories}
        recentSearches={recentSearches}
        onCategoryPick={onHeaderCategoryPick}
        onSearchSubmit={onHeaderSearchSubmit}
        onRecentSearchPick={onHeaderRecentSearchPick}
      />

      <div style={content}>
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
                <div style={pickerWrap}>
                  <button
                    type="button"
                    onClick={() => setOpenCategoryPicker((current) => !current)}
                    style={pickerTrigger}
                  >
                    <span>{selectedCategory?.name || "Всички категории"}</span>
                  </button>

                  <div
                    style={{
                      ...pickerDropdownWrap,
                      gridTemplateRows: openCategoryPicker ? "1fr" : "0fr",
                      opacity: openCategoryPicker ? 1 : 0,
                      pointerEvents: openCategoryPicker ? "auto" : "none",
                    }}
                  >
                    <div style={pickerDropdownInner}>
                      <div
                        style={{
                          ...pickerDropdown,
                          transform: openCategoryPicker ? "translateY(0)" : "translateY(-8px)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onFieldChange("categoryId", "");
                            setOpenCategoryPicker(false);
                          }}
                          style={pickerItem}
                        >
                          <span>Всички категории</span>
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              onFieldChange("categoryId", String(category.id));
                              setOpenCategoryPicker(false);
                            }}
                            style={pickerItem}
                          >
                            <span>{category.name}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            onFieldChange("categoryId", "OTHER");
                            setOpenCategoryPicker(false);
                          }}
                          style={pickerItem}
                        >
                          <span>Други</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </label>

              {form.categoryId === "OTHER" && (
                <div style={hintBox}>
                  `Other` ще има пълна логика, когато вържем custom/pending category flow към самите обяви.
                </div>
              )}
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

            <FilterSection
              title="Любими"
              open={showFavorites}
              onToggle={() => setShowFavorites((current) => !current)}
            >
              <label style={modeOption}>
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(event) => setFavoritesOnly(event.target.checked)}
                  disabled={!isLoggedIn() || getRole() !== "CLIENT"}
                />
                  <span>Само любими</span>
              </label>
              {!isLoggedIn() || getRole() !== "CLIENT" ? (
                <div style={hintBox}>Филтърът за любими е наличен, когато си влязъл като клиент.</div>
              ) : null}
            </FilterSection>

            <button onClick={applySidebarFilters} style={applyButton}>Приложи филтрите</button>
          </div>
        </aside>

        <main style={resultsArea}>
          <section style={resultsHero}>
            <div>
              <h1 style={resultsTitle}>{heading}</h1>
              <p style={resultsSubtitle}>
                {loading
                  ? "Търсим подходящи услуги..."
                  : `Намерени са ${visibleServices.length} резултата според активните филтри.`}
              </p>
            </div>

            <div style={activeFilterWrap}>
              {filters.city && <ActiveChip label={`Град: ${filters.city}`} />}
              {activeCategory && <ActiveChip label={`Категория: ${activeCategory.name}`} />}
              {filters.minPrice && <ActiveChip label={`Мин.: €${filters.minPrice}`} />}
              {filters.maxPrice && <ActiveChip label={`Макс.: €${filters.maxPrice}`} />}
            </div>
          </section>

          <section style={toolbar}>
            <div style={toolbarLeft}>
              <div style={toolbarCount}>{visibleServices.length} обяви</div>
              {favoritesOnly ? <ActiveChip label="Само любими" /> : null}
            </div>

            <div style={toolbarRight}>
              <label style={toolbarField}>
                <span style={toolbarLabel}>Сортирай по</span>
                <div style={toolbarPickerWrap}>
                  <button type="button" onClick={() => setOpenSortPicker((current) => !current)} style={toolbarPickerTrigger}>
                    <span>{sortLabel}</span>
                  </button>
                  <div
                    style={{
                      ...toolbarPickerDropdownWrap,
                      gridTemplateRows: openSortPicker ? "1fr" : "0fr",
                      opacity: openSortPicker ? 1 : 0,
                      pointerEvents: openSortPicker ? "auto" : "none",
                    }}
                  >
                    <div style={toolbarPickerDropdownInner}>
                      <div
                        style={{
                          ...toolbarPickerDropdown,
                          transform: openSortPicker ? "translateY(0)" : "translateY(-8px)",
                        }}
                      >
                        <button type="button" onClick={() => { setSortBy("relevant"); setOpenSortPicker(false); }} style={toolbarPickerItem}>Най-подходящи</button>
                        <button type="button" onClick={() => { setSortBy("price-asc"); setOpenSortPicker(false); }} style={toolbarPickerItem}>Цена: възходящо</button>
                        <button type="button" onClick={() => { setSortBy("price-desc"); setOpenSortPicker(false); }} style={toolbarPickerItem}>Цена: низходящо</button>
                        <button type="button" onClick={() => { setSortBy("top-rated"); setOpenSortPicker(false); }} style={toolbarPickerItem}>Най-високо оценени</button>
                      </div>
                    </div>
                  </div>
                </div>
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

          {loading ? (
            <div style={loadingCard}>Зареждане на резултатите...</div>
          ) : visibleServices.length === 0 ? (
            <div style={emptyCard}>
              <div style={emptyTitle}>Няма намерени услуги</div>
              <p style={emptyText}>Пробвай с друг град, по-широк ценови диапазон или различна категория.</p>
              <button onClick={() => navigate("/")} style={homeButton}>Към началната страница</button>
            </div>
          ) : (
            <ServiceGrid
              services={visibleServices}
              favoriteIds={favoriteIds}
              onToggleFavorite={onToggleFavorite}
              title={null}
              viewMode={viewMode}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div style={filterSection}>
      <button onClick={onToggle} style={sectionToggle}>
        <span>{title}</span>
        <span
          style={{
            ...sectionIndicator,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ⌄
        </span>
      </button>
      <div
        style={{
          ...sectionBodyWrap,
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0.55,
        }}
      >
        <div style={sectionBodyInner}>
          <div
            style={{
              ...sectionBody,
              transform: open ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveChip({ label }) {
  return <div style={activeChip}>{label}</div>;
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 14%, #eaf2ff 42%, #f6f9ff 100%)",
};
const content = {
  maxWidth: 1260,
  margin: "0 auto",
  padding: "18px 16px 28px",
  display: "grid",
  gridTemplateColumns: "300px minmax(0, 1fr)",
  gap: 20,
  alignItems: "start",
};
const sidebar = { position: "sticky", top: 128 };
const sidebarCard = {
  background: "linear-gradient(180deg, rgba(8,18,36,0.94) 0%, rgba(17,36,71,0.96) 100%)",
  border: "1px solid rgba(96,165,250,0.24)",
  borderRadius: 26,
  padding: 18,
  boxShadow: "0 24px 60px rgba(2,6,23,0.24)",
};
const sidebarTop = { display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, marginBottom: 12 };
const sidebarTitle = { margin: "8px 0 0", fontSize: 28, lineHeight: 1.05, color: "#0f172a" };
const clearButton = {
  border: "none",
  background: "transparent",
  color: "#93c5fd",
  cursor: "pointer",
  fontWeight: 800,
};
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#93c5fd" };
const filterSection = { paddingTop: 12, borderTop: "1px solid rgba(96,165,250,0.18)" };
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
  color: "#eff6ff",
  fontSize: 16,
};
const sectionIndicator = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  borderRadius: 999,
  background: "rgba(15,23,42,0.34)",
  border: "1px solid rgba(96,165,250,0.2)",
  color: "#93c5fd",
  fontSize: 15,
  lineHeight: 1,
  transition: "transform 180ms ease, background 180ms ease",
};
const sectionBodyWrap = {
  display: "grid",
  gridTemplateRows: "0fr",
  transition: "grid-template-rows 220ms ease, opacity 220ms ease",
};
const sectionBodyInner = {
  overflow: "hidden",
};
const sectionBody = {
  marginTop: 12,
  display: "grid",
  gap: 12,
  transition: "transform 220ms ease",
};
const fieldWrap = { display: "grid", gap: 10 };
const fieldLabel = { fontWeight: 800, color: "#cbd5e1", fontSize: 13 };
const fieldInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.24)",
  background: "rgba(15,23,42,0.44)",
  color: "#eff6ff",
};
const pickerWrap = {
  position: "relative",
};
const pickerTrigger = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.24)",
  background: "rgba(15,23,42,0.44)",
  color: "#eff6ff",
  textAlign: "left",
  fontWeight: 700,
  cursor: "pointer",
};
const pickerDropdownWrap = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  display: "grid",
  gridTemplateRows: "0fr",
  transition: "grid-template-rows 220ms ease, opacity 220ms ease",
  zIndex: 6,
};
const pickerDropdownInner = {
  overflow: "hidden",
};
const pickerDropdown = {
  borderRadius: 16,
  overflow: "hidden",
  maxHeight: 320,
  overflowY: "auto",
  background: "linear-gradient(180deg, rgba(8,18,36,0.98) 0%, rgba(17,36,71,0.98) 100%)",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 20px 46px rgba(2,6,23,0.28)",
  transition: "transform 220ms ease",
};
const pickerItem = {
  width: "100%",
  padding: "12px 13px",
  border: "none",
  borderBottom: "1px solid rgba(96,165,250,0.12)",
  background: "transparent",
  color: "#eff6ff",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: 700,
};
const priceGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 };
const hintBox = {
  padding: "12px 13px",
  borderRadius: 14,
  background: "rgba(15,23,42,0.42)",
  border: "1px dashed rgba(96,165,250,0.24)",
  color: "rgba(226,232,240,0.78)",
  lineHeight: 1.6,
  fontSize: 13,
};
const modeList = { display: "grid", gap: 10 };
const modeOption = { display: "flex", gap: 10, alignItems: "center", color: "#eff6ff", fontWeight: 700 };
const modeOptionDisabled = { display: "flex", gap: 10, alignItems: "center", color: "#64748b", fontWeight: 700 };
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
const resultsArea = { minWidth: 0 };
const resultsHero = {
  padding: 22,
  borderRadius: 28,
  background: "linear-gradient(135deg, rgba(7,15,31,0.94) 0%, rgba(13,33,70,0.96) 62%, rgba(24,64,132,0.92) 100%)",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 24px 60px rgba(2,6,23,0.24)",
};
const resultsTitle = { margin: "10px 0 8px", fontSize: 36, lineHeight: 1.04, color: "#eff6ff" };
const resultsSubtitle = { margin: 0, color: "rgba(226,232,240,0.8)", lineHeight: 1.7 };
const activeFilterWrap = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 };
const activeChip = {
  padding: "9px 12px",
  borderRadius: 999,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(96,165,250,0.28)",
  color: "#bfdbfe",
  fontWeight: 800,
  fontSize: 13,
};
const toolbar = {
  marginTop: 16,
  padding: "14px 16px",
  borderRadius: 20,
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  boxShadow: "0 14px 34px rgba(2,6,23,0.22)",
};
const toolbarLeft = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
const toolbarRight = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };
const toolbarCount = { fontWeight: 900, color: "#eff6ff" };
const toolbarField = { display: "flex", alignItems: "center", gap: 8 };
const toolbarLabel = { fontSize: 13, fontWeight: 800, color: "#cbd5e1" };
const toolbarPickerWrap = {
  position: "relative",
  minWidth: 210,
};
const toolbarPickerTrigger = {
  border: "1px solid rgba(96,165,250,0.24)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "rgba(15,23,42,0.44)",
  color: "#eff6ff",
  textAlign: "left",
  width: "100%",
  fontWeight: 700,
  cursor: "pointer",
};
const toolbarPickerDropdownWrap = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  display: "grid",
  gridTemplateRows: "0fr",
  transition: "grid-template-rows 220ms ease, opacity 220ms ease",
  zIndex: 8,
};
const toolbarPickerDropdownInner = {
  overflow: "hidden",
};
const toolbarPickerDropdown = {
  borderRadius: 16,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(8,18,36,0.98) 0%, rgba(17,36,71,0.98) 100%)",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 20px 46px rgba(2,6,23,0.28)",
  transition: "transform 220ms ease",
};
const toolbarPickerItem = {
  width: "100%",
  padding: "12px 13px",
  border: "none",
  borderBottom: "1px solid rgba(96,165,250,0.12)",
  background: "transparent",
  color: "#eff6ff",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: 700,
};
const viewToggle = {
  display: "inline-flex",
  padding: 4,
  borderRadius: 14,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(96,165,250,0.24)",
};
const viewButton = {
  border: "none",
  background: "transparent",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 800,
  color: "#bfdbfe",
};
const activeViewButton = {
  background: "#2563eb",
  color: "#fff",
};
const loadingCard = {
  marginTop: 18,
  padding: 22,
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(8,18,36,0.9) 0%, rgba(17,36,71,0.92) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  color: "rgba(226,232,240,0.78)",
};
const emptyCard = {
  marginTop: 18,
  padding: 28,
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 20px 46px rgba(2,6,23,0.22)",
};
const emptyTitle = { fontSize: 24, fontWeight: 900, color: "#eff6ff" };
const emptyText = { marginTop: 10, color: "rgba(226,232,240,0.78)", lineHeight: 1.7, maxWidth: 520 };
const homeButton = {
  marginTop: 16,
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};
