import React, { useEffect, useMemo, useState } from "react";
import bannerBarber from "../../assets/banners/Barber_Banner.png";
import bannerCar from "../../assets/banners/CarRepair_Banner.png";
import bannerBusiness from "../../assets/banners/Business_Banner.png";


export default function HeroCarousel({ onSlideAction }) {
  const slides = useMemo(
    () => [
      {
        id: "barber",
        ctaLabel: "Запиши своя час",
        img: bannerBarber,
        accent: "#2563eb",
        accentSoft: "rgba(37,99,235,0.18)",
        imagePosition: "center center",
        backgroundPosition: "58% 24%",
      },
      {
        id: "business",
        ctaLabel: "Качи своята обява",
        img: bannerBusiness,
        accent: "#2563eb",
        accentSoft: "rgba(37,99,235,0.16)",
        imagePosition: "center center",
        backgroundPosition: "52% 26%",
      },
      {
        id: "car",
        ctaLabel: "Разгледай обявите",
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

          <div style={copyWrap}>
            <h2 style={title}>{slide.title}</h2>
            <p style={subtitle}>{slide.subtitle}</p>

            <div style={ctaRow}>
              <button
                style={{ ...primaryButton, background: slide.accent }}
                onClick={() => onSlideAction?.(slide.id)}
              >
                {slide.ctaLabel || "Разгледай"}
              </button>
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
  gridTemplateColumns: "minmax(700px, 1.54fr) minmax(0, 0.48fr)",
  gap: 12,
  alignItems: "center",
  minHeight: 470,
  padding: "30px 34px 28px",
};

const copyWrap = {
  maxWidth: 310,
  padding: "18px 10px 18px 0",
  borderRadius: 28,
  background: "transparent",
  border: "none",
  backdropFilter: "none",
  boxShadow: "none",
};

const title = {
  margin: "0 0 14px",
  fontSize: 44,
  lineHeight: 1.02,
  color: "#ffffff",
  maxWidth: 420,
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
  marginTop: 400,
  display: "flex",
  justifyContent: "center",
  gap: 10,
  flexWrap: "wrap",
};

const primaryButton = {
  border: "none",
  color: "#fff",
  padding: "13px 18px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 900,
  boxShadow: "0 18px 40px rgba(15,23,42,0.2)",
};

const visualColumn = {
  display: "grid",
  gap: 10,
  justifyItems: "center",
};

const visualFrame = {
  position: "relative",
  minHeight: 452,
  width: "min(100%, 980px)",
  borderRadius: 28,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
  boxShadow: "0 34px 80px rgba(2,6,23,0.24)",
};

const visualImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
  padding: "0 22px",
  boxSizing: "border-box",
  filter: "saturate(0.92) contrast(0.98)",
  transform: "scale(1.1)",
};

const visualMask = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.14) 0%, rgba(15,23,42,0.03) 28%, rgba(15,23,42,0.28) 100%)",
};

const metaRow = {
  display: "flex",
  justifyContent: "center",
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
