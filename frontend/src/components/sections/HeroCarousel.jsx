import React, { useEffect, useMemo, useState } from "react";
import bannerBarber from "../../assets/banners/Barber_Banner.png";
import bannerBusiness from "../../assets/banners/Business_Banner.png";
import bannerCar from "../../assets/banners/CarRepair_Banner.png";

export default function HeroCarousel({ onBrowse, onLearnMore }) {
  const slides = useMemo(
    () => [
      {
        id: "barber",
        kicker: "Бързо записване",
        title: "Запази час по-лесно.",
        subtitle: "Търси, избери и резервирай без излишно лутане.",
        img: bannerBarber,
        accent: "#e11d48",
        accentSoft: "rgba(225,29,72,0.16)",
        imagePosition: "center center",
        backgroundPosition: "58% 24%",
      },
      {
        id: "business",
        kicker: "За бизнеса",
        title: "Подреди услугите си.",
        subtitle: "Управлявай екипи, слотове и заявки на едно място.",
        img: bannerBusiness,
        accent: "#f59e0b",
        accentSoft: "rgba(245,158,11,0.16)",
        imagePosition: "center center",
        backgroundPosition: "52% 26%",
      },
      {
        id: "car",
        kicker: "Различни категории",
        title: "Работи и за сервизни услуги.",
        subtitle: "Един booking модел за повече типове обяви.",
        img: bannerCar,
        accent: "#2563eb",
        accentSoft: "rgba(37,99,235,0.16)",
        imagePosition: "center center",
        backgroundPosition: "62% 18%",
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
      <section style={shell}>
        <div
          style={{
            ...backgroundLayer,
            backgroundImage: `
              radial-gradient(circle at top right, ${slide.accentSoft} 0%, rgba(15,23,42,0) 34%),
              linear-gradient(110deg, rgba(2,6,23,0.92) 0%, rgba(15,23,42,0.88) 34%, rgba(15,23,42,0.54) 62%, rgba(15,23,42,0.82) 100%),
              url(${slide.img})
            `,
            backgroundPosition: `center center, center center, ${slide.backgroundPosition}`,
          }}
        />

        <div style={content}>
          <div style={copyWrap}>
            <div style={{ ...kicker, color: slide.accent }}>{slide.kicker}</div>
            <h2 style={title}>{slide.title}</h2>
            <p style={subtitle}>{slide.subtitle}</p>

            <div style={ctaRow}>
              <button
                style={{ ...primaryButton, background: slide.accent }}
                onClick={() => onBrowse?.()}
              >
                Разгледай
              </button>
              <button style={secondaryButton} onClick={() => onLearnMore?.()}>
                Повече
              </button>
            </div>
          </div>

          <div style={visualColumn}>
            <div style={visualFrame}>
              <img
                src={slide.img}
                alt=""
                style={{
                  ...visualImage,
                  objectPosition: slide.imagePosition,
                }}
              />
              <div style={visualMask} />
              <div style={visualGlow(slide.accentSoft)} />
            </div>

            <div style={metaRow}>
              <div style={dots}>
                {slides.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(itemIndex)}
                    style={{
                      ...dot,
                      background: itemIndex === index ? slide.accent : "rgba(255,255,255,0.28)",
                      width: itemIndex === index ? 26 : 10,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
          style={{ ...arrowBtn, left: 16 }}
        >
          ‹
        </button>
        <button onClick={() => setIndex((current) => (current + 1) % slides.length)} style={{ ...arrowBtn, right: 16 }}>
          ›
        </button>
      </section>
    </div>
  );
}

function visualGlow(color) {
  return {
    position: "absolute",
    right: -40,
    bottom: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    background: color,
    filter: "blur(18px)",
    pointerEvents: "none",
  };
}

const shell = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 30,
  minHeight: 470,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "#0b1220",
  boxShadow: "0 28px 70px rgba(15,23,42,0.18)",
};

const backgroundLayer = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  filter: "saturate(0.9) blur(2px)",
  transform: "scale(1.04)",
};

const content = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.84fr) minmax(430px, 1.16fr)",
  gap: 14,
  alignItems: "center",
  minHeight: 470,
  padding: "30px 34px 28px",
};

const copyWrap = {
  maxWidth: 500,
  padding: "22px 22px 20px",
  borderRadius: 28,
  background: "linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.4) 100%)",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 24px 60px rgba(2,6,23,0.16)",
};

const kicker = {
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
};

const title = {
  margin: "14px 0 12px",
  fontSize: 36,
  lineHeight: 1.06,
  color: "#ffffff",
  maxWidth: 430,
  textWrap: "balance",
};

const subtitle = {
  margin: 0,
  color: "rgba(255,255,255,0.86)",
  fontSize: 14,
  lineHeight: 1.58,
  maxWidth: 360,
};

const ctaRow = {
  marginTop: 20,
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const primaryButton = {
  border: "none",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 900,
  boxShadow: "0 18px 40px rgba(15,23,42,0.2)",
};

const secondaryButton = {
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 900,
  backdropFilter: "blur(8px)",
};

const visualColumn = {
  display: "grid",
  gap: 10,
  justifyItems: "stretch",
};

const visualFrame = {
  position: "relative",
  minHeight: 430,
  borderRadius: 28,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
  boxShadow: "0 30px 70px rgba(2,6,23,0.2)",
};

const visualImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
  padding: 0,
  boxSizing: "border-box",
  filter: "saturate(0.92) contrast(0.98)",
};

const visualMask = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.14) 0%, rgba(15,23,42,0.03) 28%, rgba(15,23,42,0.28) 100%)",
};

const metaRow = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
};

const dots = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const dot = {
  height: 10,
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  transition: "all 160ms ease",
};

const arrowBtn = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 46,
  height: 46,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  cursor: "pointer",
  background: "rgba(255,255,255,0.10)",
  color: "#fff",
  backdropFilter: "blur(10px)",
  fontSize: 28,
  lineHeight: "42px",
  zIndex: 2,
};
