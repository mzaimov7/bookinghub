import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, getRole, isLoggedIn, logoutLocal } from "../../lib/authStore";
import logoPng from "../../assets/BookingHub-logo-header.png";
import { resolveBackendImage } from "../../lib/assets";
import { getMyBusinessProfile } from "../../features/business/profile/api";
import { getMyProfile, getRecentSearches } from "../../features/client/api";
import { getCategories } from "../../features/home/api";

export default function Header({ categories, recentSearches, onCategoryPick, onSearchSubmit, onRecentSearchPick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const [openCats, setOpenCats] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openRecentSearches, setOpenRecentSearches] = useState(false);
  const [query, setQuery] = useState("");
  const [loadedCategories, setLoadedCategories] = useState([]);
  const [loadedRecentSearches, setLoadedRecentSearches] = useState([]);
  const [loadedProfilePhotoUrl, setLoadedProfilePhotoUrl] = useState(null);

  const role = getRole();
  const auth = getAuth();
  const effectiveCategories = Array.isArray(categories) && categories.length > 0 ? categories : loadedCategories;
  const effectiveRecentSearches = Array.isArray(recentSearches) && recentSearches.length > 0 ? recentSearches : loadedRecentSearches;
  const catItems = useMemo(() => effectiveCategories, [effectiveCategories]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!searchRef.current?.contains(event.target)) {
        setOpenRecentSearches(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadHeaderData() {
      const currentRole = getRole();
      const [nextCategories, nextRecentSearches, nextProfile] = await Promise.all([
        getCategories().catch(() => []),
        isLoggedIn() && currentRole === "CLIENT" ? getRecentSearches().catch(() => []) : Promise.resolve([]),
        isLoggedIn() && currentRole === "CLIENT"
          ? getMyProfile().catch(() => null)
          : isLoggedIn() && currentRole === "BUSINESS"
            ? getMyBusinessProfile().catch(() => null)
            : Promise.resolve(null),
      ]);

      if (!active) return;
      setLoadedCategories(nextCategories);
      setLoadedRecentSearches(nextRecentSearches);
      setLoadedProfilePhotoUrl(nextProfile?.photoUrl ?? null);
    }

    loadHeaderData();
    return () => {
      active = false;
    };
  }, [location.pathname, location.search]);

  function normalize(value) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setOpenRecentSearches(false);
    const nextFilters = {
      query: normalize(query),
    };

    if (onSearchSubmit) {
      onSearchSubmit(nextFilters);
      return;
    }

    const params = new URLSearchParams();
    if (nextFilters.query) params.set("query", nextFilters.query);
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function go(path) {
    setOpenCats(false);
    setOpenProfile(false);
    navigate(path);
  }

  function requireLogin(actionName) {
    if (!isLoggedIn()) {
      alert(`За "${actionName}" трябва първо да влезеш в профила си.`);
      go("/login");
      return true;
    }

    return false;
  }

  function labelForRecentSearch(item) {
    const parts = [item?.query, item?.city].filter(Boolean);
    const categoryName = effectiveCategories.find((category) => category.id === item?.categoryId)?.name || null;
    const priceRange = item?.minPrice != null || item?.maxPrice != null
      ? `${item?.minPrice != null ? `€${item.minPrice}` : "Без мин."} - ${item?.maxPrice != null ? `€${item.maxPrice}` : "Без макс."}`
      : null;
    return [...parts, categoryName, priceRange].filter(Boolean).join(" • ") || "Последно търсене";
  }

  const profilePhotoUrl = resolveBackendImage(auth?.profilePhotoUrl || loadedProfilePhotoUrl);

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(96,165,250,0.22)",
        background: "linear-gradient(180deg, rgba(5,13,28,0.97) 0%, rgba(8,18,36,0.95) 56%, rgba(9,22,45,0.93) 100%)",
        backdropFilter: "blur(14px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={logoPng} alt="BookingHub" style={{ height: 48, display: "block" }} />
        </Link>

        <div ref={searchRef} style={{ flex: 1, position: "relative" }}>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(96,165,250,0.42)",
                borderRadius: 999,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.96)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <input
                className="header-search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => {
                  if (role === "CLIENT" && effectiveRecentSearches.length > 0) {
                    setOpenRecentSearches(true);
                  }
                }}
                placeholder="Какво търсиш?"
                style={{ border: "none", outline: "none", width: "100%", fontSize: 14, background: "transparent", color: "#0f172a" }}
              />
              <button type="submit" title="Търсене" style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>
                🔎
              </button>
            </div>
          </form>

          {role === "CLIENT" && effectiveRecentSearches.length > 0 && openRecentSearches && (
            <div style={recentSearchDropdown}>
              <div style={recentSearchDropdownHeader}>Последни търсения</div>
              <div style={recentSearchDropdownList}>
                {effectiveRecentSearches.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setOpenRecentSearches(false);
                      setQuery(item?.query || "");
                      if (onRecentSearchPick) {
                        onRecentSearchPick(item);
                        return;
                      }

                      const params = new URLSearchParams();
                      if (item?.query) params.set("query", item.query);
                      if (item?.city) params.set("city", item.city);
                      if (item?.categoryId != null) params.set("categoryId", String(item.categoryId));
                      if (item?.minPrice != null) params.set("minPrice", String(item.minPrice));
                      if (item?.maxPrice != null) params.set("maxPrice", String(item.maxPrice));
                      navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
                    }}
                    style={recentSearchItem}
                    title={labelForRecentSearch(item)}
                  >
                    <span style={recentSearchIcon}>↺</span>
                    <span style={recentSearchText}>{labelForRecentSearch(item)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {role !== "BUSINESS" && (
            <>
              <button onClick={() => requireLogin("Любими") || go("/favorites")} title="Любими" style={iconBtn}>
                <span style={heartGlyph}>♥</span>
              </button>
              <button onClick={() => requireLogin("Резервации") || go("/my-bookings")} title="Моите резервации" style={iconBtn}>
                <span style={iconGlyph}>📘</span>
              </button>
            </>
          )}

          {role === "BUSINESS" && (
            <>
              <button onClick={() => go("/business")} title="Бизнес табло" style={iconBtn}>
                <span style={iconGlyph}>▦</span>
              </button>
              <button onClick={() => go("/business/services/new")} title="Добави обява" style={iconBtn}>
                <span style={iconGlyph}>＋</span>
              </button>
            </>
          )}

          <div style={{ position: "relative" }}>
            <button onClick={() => setOpenProfile((current) => !current)} title="Профил" style={iconBtn}>
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Профил" style={headerProfileImage} />
              ) : (
                <span style={iconGlyph}>👤</span>
              )}
            </button>

            {openProfile && (
              <div style={{ position: "absolute", right: 0, top: 48, width: 240, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 60 }}>
                {!isLoggedIn() ? (
                  <>
                    <MenuItem label="Вход" onClick={() => go("/login")} />
                    <MenuItem label="Регистрация" onClick={() => go("/register")} />
                  </>
                ) : (
                  <>
                    <div style={{ padding: "10px 12px", fontSize: 13, opacity: 0.8 }}>
                      @{auth?.username} • {role}
                      {auth?.devMode ? " • DEV" : ""}
                    </div>
                    <div style={{ height: 1, background: "#e5e7eb" }} />

                    {role === "CLIENT" && (
                      <>
                        <MenuItem label="Моят профил" onClick={() => go("/my-profile")} />
                        <MenuItem label="Моите резервации" onClick={() => go("/my-bookings")} />
                        <MenuItem label="Любими" onClick={() => go("/favorites")} />
                      </>
                    )}

                    {role === "BUSINESS" && (
                      <>
                        <MenuItem label="Моят профил" onClick={() => go("/business/profile")} />
                        <MenuItem label="Бизнес табло" onClick={() => go("/business")} />
                        <MenuItem label="Добави обява" onClick={() => go("/business/services/new")} />
                        <MenuItem label="Моите обяви" onClick={() => go("/business/services")} />
                        <MenuItem label="Персонал и екипи" onClick={() => go("/business/resources")} />
                        <MenuItem label="Заявки / резервации" onClick={() => go("/business/bookings")} />
                      </>
                    )}

                    {role === "ADMIN" && <MenuItem label="Админ панел" onClick={() => go("/admin")} />}

                    <div style={{ height: 1, background: "#e5e7eb" }} />
                    <MenuItem
                      label="Изход"
                      danger
                      onClick={() => {
                        logoutLocal();
                        go("/");
                      }}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(90deg, #0B1220 0%, #0B2A6F 45%, #2B6CB0 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpenCats((current) => !current)}
              style={{ background: "rgba(255,255,255,0.10)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", padding: "10px 14px", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}
            >
              <span>☰ Категории</span>
            </button>

            <div
              style={{
                ...categoryDropdownWrap,
                gridTemplateRows: openCats ? "1fr" : "0fr",
                opacity: openCats ? 1 : 0,
                pointerEvents: openCats ? "auto" : "none",
              }}
            >
              <div style={categoryDropdownInner}>
                <div
                  style={{
                    ...categoryDropdown,
                    transform: openCats ? "translateY(0)" : "translateY(-10px)",
                  }}
                >
                  <div style={categoryDropdownHeader}>Избери категория</div>
                  <div style={categoryDropdownList}>
                    {catItems.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (onCategoryPick) {
                            onCategoryPick(category);
                          } else {
                            navigate(`/search?categoryId=${category.id}`);
                          }
                          setOpenCats(false);
                        }}
                        style={categoryItem}
                      >
                        <span>{category.name}</span>
                        <span style={categoryItemArrow}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", textAlign: "left", padding: "12px 12px", border: "none", background: "#fff", cursor: "pointer", fontWeight: 700, color: danger ? "#dc2626" : "#111827" }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "#f8fafc";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "#fff";
      }}
    >
      {label}
    </button>
  );
}

const iconBtn = {
  border: "1px solid #dbeafe",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  borderRadius: 14,
  width: 44,
  height: 44,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.08)",
};

const headerProfileImage = {
  width: 28,
  height: 28,
  borderRadius: 999,
  objectFit: "cover",
  display: "block",
  margin: "0 auto",
};

const iconGlyph = {
  display: "inline-block",
  fontSize: 18,
  color: "#1d4ed8",
  fontWeight: 900,
  lineHeight: 1,
};

const heartGlyph = {
  display: "inline-block",
  fontSize: 20,
  color: "#2563eb",
  fontWeight: 900,
  lineHeight: 1,
};

const categoryDropdownWrap = {
  position: "absolute",
  top: 48,
  left: 0,
  width: 360,
  display: "grid",
  gridTemplateRows: "0fr",
  transition: "grid-template-rows 220ms ease, opacity 220ms ease",
  zIndex: 50,
};

const categoryDropdownInner = {
  overflow: "hidden",
};

const categoryDropdown = {
  marginTop: 8,
  borderRadius: 18,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(8,18,36,0.98) 0%, rgba(17,36,71,0.98) 100%)",
  color: "#eff6ff",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 24px 60px rgba(2,6,23,0.3)",
  transition: "transform 220ms ease",
};

const categoryDropdownHeader = {
  padding: "12px 16px 10px",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#93c5fd",
  borderBottom: "1px solid rgba(96,165,250,0.18)",
  background: "linear-gradient(180deg, rgba(15,23,42,0.36) 0%, rgba(15,23,42,0.14) 100%)",
};

const categoryDropdownList = {
  maxHeight: 420,
  overflowY: "auto",
  display: "grid",
};

const categoryItem = {
  width: "100%",
  textAlign: "left",
  padding: "13px 16px",
  border: "none",
  borderBottom: "1px solid rgba(96,165,250,0.12)",
  background: "transparent",
  color: "#eff6ff",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 14,
  fontWeight: 700,
};

const categoryItemArrow = {
  color: "#93c5fd",
  opacity: 0.84,
};

const recentSearchDropdown = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 54,
  background: "#fff",
  border: "1px solid #dbeafe",
  borderRadius: 20,
  boxShadow: "0 24px 60px rgba(15,23,42,0.14)",
  overflow: "hidden",
  zIndex: 70,
};

const recentSearchDropdownHeader = {
  padding: "12px 16px 10px",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#64748b",
  background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
  borderBottom: "1px solid #eff6ff",
};

const recentSearchDropdownList = {
  display: "grid",
};

const recentSearchItem = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  textAlign: "left",
  padding: "13px 16px",
  border: "none",
  background: "#fff",
  cursor: "pointer",
  color: "#0f172a",
};

const recentSearchIcon = {
  color: "#2563eb",
  fontWeight: 900,
  flexShrink: 0,
};

const recentSearchText = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 700,
};
