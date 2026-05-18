import React from "react";

function categoryCaption(category) {
  if (category?.description?.trim()) return category.description.trim();
  return "Разгледай услугите в тази категория.";
}

function categoryIcon(category) {
  const name = (category?.name || "").toLowerCase();
  if (name.includes("крас") || name.includes("beaut") || name.includes("грим") || name.includes("коз") || name.includes("уелнес")) return "✨";
  if (name.includes("кос") || name.includes("barber") || name.includes("бръс") || name.includes("hair")) return "✂";
  if (name.includes("масаж") || name.includes("massage") || name.includes("спа")) return "🧖";
  if (name.includes("псих") || name.includes("терап")) return "🧠";
  if (name.includes("здрав") || name.includes("мед") || name.includes("health") || name.includes("doctor")) return "➕";
  if (name.includes("авто") || name.includes("car") || name.includes("сервиз")) return "🚗";
  if (name.includes("тату") || name.includes("пиърс")) return "🖊";
  if (name.includes("фитнес") || name.includes("sport") || name.includes("йога")) return "🏃";
  if (name.includes("дом") || name.includes("майстор") || name.includes("ремонт")) return "🛠";
  if (name.includes("почиств")) return "🧼";
  if (name.includes("обуч") || name.includes("уро") || name.includes("курс")) return "📚";
  if (name.includes("фото") || name.includes("видео") || name.includes("творч")) return "📸";
  if (name.includes("ветерин")) return "🐾";
  if (name.includes("финанс") || name.includes("счетов")) return "💼";
  if (name.includes("прав")) return "⚖";
  if (name.includes("транспорт") || name.includes("шофьор")) return "🚌";
  return "●";
}

export default function CategoryDiscoverySection({ categories = [], onPickCategory }) {
  if (!categories.length) return null;

  return (
    <section style={wrap}>
      <div style={header}>
        <div>
          <div style={eyebrow}>Открий</div>
          <h2 style={title}>Резервирай по категория</h2>
        </div>
      </div>

      <div style={grid}>
        {categories.map((category) => (
          <button key={category.id} onClick={() => onPickCategory?.(category)} style={card}>
            <div style={cardBody}>
              <div style={iconWrap}>{categoryIcon(category)}</div>
              <div style={copyWrap}>
                <div style={categoryName}>{category.name}</div>
                <div style={categoryDescription}>{categoryCaption(category)}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

const wrap = {
  marginTop: 18,
  padding: 22,
  borderRadius: 28,
  background: "linear-gradient(145deg, rgba(8,18,36,0.92) 0%, rgba(15,47,106,0.88) 38%, rgba(226,238,255,0.96) 100%)",
  border: "1px solid rgba(147,197,253,0.38)",
  boxShadow: "0 28px 70px rgba(15,23,42,0.18)",
};
const header = { marginBottom: 16 };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#93c5fd" };
const title = { margin: "10px 0 8px", fontSize: 34, lineHeight: 1.04, color: "#f8fbff" };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 14,
};
const card = {
  display: "block",
  borderRadius: 22,
  border: "1px solid rgba(147,197,253,0.22)",
  background: "linear-gradient(180deg, rgba(9,17,34,0.92) 0%, rgba(19,42,82,0.88) 100%)",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 18px 40px rgba(2,6,23,0.22)",
};
const cardBody = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  minHeight: 112,
  padding: "18px 18px 18px 16px",
};
const iconWrap = {
  width: 52,
  height: 52,
  flex: "0 0 52px",
  borderRadius: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, rgba(37,99,235,0.26) 0%, rgba(59,130,246,0.14) 100%)",
  border: "1px solid rgba(96,165,250,0.26)",
  color: "#dbeafe",
  fontSize: 24,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
};
const copyWrap = {
  minWidth: 0,
  display: "grid",
  gap: 6,
};
const categoryName = { fontSize: 22, fontWeight: 900, lineHeight: 1.08, color: "#fff" };
const categoryDescription = { color: "rgba(226,232,240,0.82)", lineHeight: 1.5, fontSize: 14 };
