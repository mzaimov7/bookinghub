import React from "react";

export default function Footer() {
  return (
    <div
      style={{
        marginTop: 28,
        padding: "24px 16px",
        borderTop: "1px solid rgba(96,165,250,0.24)",
        background: "linear-gradient(180deg, rgba(8,18,36,0.88) 0%, rgba(13,33,70,0.94) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 18 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#eff6ff" }}>За BookingHub</div>
          <p style={{ marginTop: 8, color: "rgba(226,232,240,0.78)" }}>
            BookingHub свързва бизнеси и клиенти чрез онлайн резервации. Бизнес профилите управляват услуги,
            персонал и график, а клиентите търсят, сравняват и запазват час.
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#eff6ff" }}>Контакти</div>
          <p style={{ marginTop: 8, color: "rgba(226,232,240,0.78)" }}>
            Email: bookinghub.support@gmail.com
            <br />
            Тел: 0892729438
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#eff6ff" }}>Полезно</div>
          <p style={{ marginTop: 8, color: "rgba(226,232,240,0.78)" }}>
            Общи условия
            <br />
            Политика за поверителност
            <br />
            Помощ
          </p>
        </div>
      </div>
    </div>
  );
}
