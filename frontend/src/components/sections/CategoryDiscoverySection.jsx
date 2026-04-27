import React from "react";
import { categoryFallbackImage } from "../../lib/assets";

function categoryCaption(category) {
  if (category?.description?.trim()) return category.description.trim();
  return "Explore services in this category.";
}

export default function CategoryDiscoverySection({ categories = [], onPickCategory }) {
  if (!categories.length) return null;

  return (
    <section style={wrap}>
      <div style={header}>
        <div>
          <div style={eyebrow}>Discover</div>
          <h2 style={title}>Reserve by category</h2>
          <p style={subtitle}>Choose the kind of service you need and jump straight into the matching listings.</p>
        </div>
      </div>

      <div style={grid}>
        {categories.map((category) => (
          <button key={category.id} onClick={() => onPickCategory?.(category)} style={card}>
            <img src={categoryFallbackImage(category)} alt={category.name} style={image} />
            <div style={imageOverlay} />
            <div style={cardBody}>
              <div style={categoryName}>{category.name}</div>
              <div style={categoryDescription}>{categoryCaption(category)}</div>
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
  background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.94) 100%)",
  border: "1px solid #dbeafe",
  boxShadow: "0 24px 60px rgba(148,163,184,0.12)",
};
const header = { marginBottom: 16 };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#2563eb" };
const title = { margin: "10px 0 8px", fontSize: 34, lineHeight: 1.04, color: "#0f172a" };
const subtitle = { margin: 0, maxWidth: 640, color: "#475569", lineHeight: 1.7 };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};
const card = {
  position: "relative",
  overflow: "hidden",
  minHeight: 220,
  borderRadius: 22,
  border: "1px solid #e2e8f0",
  background: "#0f172a",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
};
const image = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const imageOverlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(15,23,42,0.10) 0%, rgba(15,23,42,0.74) 100%)",
};
const cardBody = {
  position: "relative",
  zIndex: 1,
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  padding: 16,
};
const categoryName = { fontSize: 22, fontWeight: 900, lineHeight: 1.08, color: "#fff" };
const categoryDescription = { marginTop: 8, color: "rgba(255,255,255,0.84)", lineHeight: 1.55, fontSize: 14 };
