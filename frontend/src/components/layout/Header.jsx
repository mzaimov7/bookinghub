import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, getRole, isLoggedIn, logoutLocal } from "../../lib/authStore";
import logoPng from "../../assets/BookingHub-logo.png";

export default function Header({ categories = [], onCategoryPick, onSearchSubmit }) {
  const navigate = useNavigate();
  const [openCats, setOpenCats] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const role = getRole();
  const auth = getAuth();
  const catItems = useMemo(() => categories.slice(0, 10), [categories]);

  function normalize(value) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSearchSubmit?.({
      query: normalize(query),
      city: normalize(city),
    });
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

  return (
    <div style={{ borderBottom: "1px solid #e5e7eb", background: "#fff", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={logoPng} alt="BookingHub" style={{ height: 40, display: "block" }} />
        </Link>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", border: "2px solid #2563eb", borderRadius: 999, padding: "8px 12px" }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Какво търсиш днес?"
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14 }}
            />
            <button type="submit" title="Search" style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>
              🔎
            </button>
          </div>

          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Град..."
            style={{ width: 160, border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", outline: "none" }}
          />
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {role !== "BUSINESS" && (
            <>
              <button onClick={() => requireLogin("Любими") || alert("Любими: ще го добавим след малко.")} title="Favorites" style={iconBtn}>
                ❤️
              </button>
              <button onClick={() => requireLogin("Резервации") || alert("Резервации: ще го добавим след малко.")} title="My bookings" style={iconBtn}>
                📅
              </button>
            </>
          )}

          <div style={{ position: "relative" }}>
            <button onClick={() => setOpenProfile((current) => !current)} title="Profile" style={iconBtn}>
              👤
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
                    </div>
                    <div style={{ height: 1, background: "#e5e7eb" }} />

                    {role === "CLIENT" && (
                      <>
                        <MenuItem label="Моите резервации" onClick={() => go("/my-bookings")} />
                        <MenuItem label="Любими" onClick={() => go("/favorites")} />
                      </>
                    )}

                    {role === "BUSINESS" && (
                      <>
                        <MenuItem label="Бизнес табло" onClick={() => go("/business")} />
                        <MenuItem label="Създай нова обява" onClick={() => go("/business/services/new")} />
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
              ☰ Категории
            </button>

            {openCats && (
              <div style={{ position: "absolute", top: 44, left: 0, width: 340, background: "#fff", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.12)", zIndex: 50 }}>
                {catItems.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryPick?.(category);
                      setOpenCats(false);
                    }}
                    style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", background: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = "#fff";
                    }}
                  >
                    <span>{category.name}</span>
                    <span style={{ opacity: 0.6 }}>›</span>
                  </button>
                ))}
              </div>
            )}
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
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 12,
  width: 42,
  height: 42,
  cursor: "pointer",
  fontSize: 18,
};
