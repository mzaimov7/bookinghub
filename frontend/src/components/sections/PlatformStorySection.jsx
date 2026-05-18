import React from "react";

export default function PlatformStorySection() {
  return (
    <section style={wrap}>
      <div style={intro}>
        <div style={eyebrow}>За BookingHub</div>
        <h2 style={title}>Откривай, резервирай и управлявай бизнес услуги по-лесно с BookingHub.</h2>
        <p style={lead}>
          BookingHub помага на клиента бързо и удобно да открие точната услуга, да сравни различните предложения и
          да запази своя час без излишно лутане, а на бизнеса да представи услугите си по-ясно, да организира
          служителите и екипите си по-подредено и да работи без повече забравени и дублирани часове.
        </p>
      </div>
    </section>
  );
}

const wrap = {
  marginTop: 26,
  padding: "22px 22px 24px",
  borderRadius: 24,
  background: "linear-gradient(145deg, rgba(7,15,31,0.94) 0%, rgba(13,33,70,0.96) 52%, rgba(21,56,118,0.96) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 28px 62px rgba(2,6,23,0.24)",
};

const intro = {
  maxWidth: 920,
};

const eyebrow = {
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#60a5fa",
};

const title = {
  margin: "10px 0 10px",
  fontSize: 28,
  lineHeight: 1.14,
  color: "#eff6ff",
};

const lead = {
  margin: 0,
  color: "rgba(226,232,240,0.84)",
  lineHeight: 1.75,
  fontSize: 15,
};
