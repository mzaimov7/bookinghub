import React from "react";

export default function PlatformStorySection() {
  return (
    <section style={wrap}>
      <div style={intro}>
        <div style={eyebrow}>За BookingHub</div>
        <h2 style={title}>Платформа за по-подредено търсене, записване и управление на услуги.</h2>
        <p style={lead}>
          BookingHub е създадена с идеята клиентът да намира по-лесно точната услуга, а бизнесът да управлява
          по-ясно своите обяви, слотове и резервации в един общ работен поток.
        </p>
      </div>

      <div style={grid}>
        <article style={card}>
          <h3 style={cardTitle}>За клиента</h3>
          <p style={cardText}>
            Търсене, филтри, любими, история и резервации се събират в едно място, за да е по-лесно да сравниш и
            избереш точната услуга.
          </p>
        </article>

        <article style={card}>
          <h3 style={cardTitle}>За бизнеса</h3>
          <p style={cardText}>
            Услуги, екипи, ресурси и клиентски заявки могат да се управляват по-последователно, без разпокъсана
            комуникация между различни канали.
          </p>
        </article>

        <article style={card}>
          <h3 style={cardTitle}>За развитието</h3>
          <p style={cardText}>
            Основата е подготвена за надграждане с нови категории, по-богати филтри, rating логика, online/on-site
            режими и по-завършен booking цикъл.
          </p>
        </article>
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

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
  marginTop: 18,
};

const card = {
  padding: "16px 16px 14px",
  borderRadius: 18,
  background: "linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(18,42,82,0.88) 100%)",
  border: "1px solid rgba(96,165,250,0.2)",
};

const cardTitle = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.2,
  color: "#eff6ff",
};

const cardText = {
  margin: "8px 0 0",
  color: "rgba(226,232,240,0.78)",
  lineHeight: 1.7,
  fontSize: 14,
};
