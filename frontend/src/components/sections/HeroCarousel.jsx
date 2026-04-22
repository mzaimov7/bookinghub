import React, { useEffect, useMemo, useState } from "react";
import bannerBarber from "../../assets/banners/Barber_Banner.png";
import bannerBusiness from "../../assets/banners/Business_Banner.png";
import bannerCar from "../../assets/banners/CarRepair_Banner.png";

export default function HeroCarousel({ onBrowse, onLearnMore }) {
  const slides = useMemo(
    () => [
      {
        id: "barber",
        title: "Запази час за услуга за секунди",
        subtitle: "Откривай свободни слотове и удобни бизнеси в твоя град.",
        img: bannerBarber,
        primaryBg: "#E11D48",
        primaryText: "#ffffff",
        secondaryBorder: "rgba(255,255,255,0.85)",
        overlay: "linear-gradient(90deg, rgba(2,6,23,0.70), rgba(2,6,23,0.15))",
      },
      {
        id: "business",
        title: "Подреди бизнеса си на едно място",
        subtitle: "Услуги, екипи, слотове и заявки в един общ поток.",
        img: bannerBusiness,
        primaryBg: "#F59E0B",
        primaryText: "#111827",
        secondaryBorder: "rgba(255,255,255,0.85)",
        overlay: "linear-gradient(90deg, rgba(2,6,23,0.68), rgba(2,6,23,0.18))",
      },
      {
        id: "car",
        title: "BookingHub работи и за сервизни услуги",
        subtitle: "Платформата е подготвена за различни категории и модели на работа.",
        img: bannerCar,
        primaryBg: "#2563EB",
        primaryText: "#ffffff",
        secondaryBorder: "rgba(255,255,255,0.85)",
        overlay: "linear-gradient(90deg, rgba(2,6,23,0.65), rgba(2,6,23,0.10))",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb", background: "#0b1220" }}>
        <div style={{ width: "100%", height: 460, position: "relative", background: "#0b1220" }}>
          <img src={slide.img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        </div>

        <div style={{ position: "absolute", inset: 0, background: slide.overlay }} />

        <div style={{ position: "absolute", left: 24, top: 294, color: "#fff", maxWidth: 620 }}>
          <h2 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>{slide.title}</h2>
          <p style={{ marginTop: 10, fontSize: 16, opacity: 0.95 }}>{slide.subtitle}</p>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={{ border: "none", background: slide.primaryBg, color: slide.primaryText, padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 900 }}
              onClick={() => onBrowse?.()}
            >
              Разгледай услуги
            </button>
            <button
              style={{ border: `1px solid ${slide.secondaryBorder}`, background: "rgba(255,255,255,0.06)", color: "#fff", padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 900, backdropFilter: "blur(4px)" }}
              onClick={() => onLearnMore?.()}
            >
              Научи повече
            </button>
          </div>
        </div>

        <button onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)} style={{ ...arrowBtn, left: 12 }}>
          ‹
        </button>
        <button onClick={() => setIndex((current) => (current + 1) % slides.length)} style={{ ...arrowBtn, right: 12 }}>
          ›
        </button>

        <div style={{ position: "absolute", right: 16, bottom: 12, display: "flex", gap: 8 }}>
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              style={{ width: 10, height: 10, borderRadius: 999, border: "none", background: itemIndex === index ? "#fff" : "rgba(255,255,255,0.55)", cursor: "pointer" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const arrowBtn = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 44,
  height: 44,
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  background: "rgba(255,255,255,0.85)",
  fontSize: 26,
  lineHeight: "44px",
};
