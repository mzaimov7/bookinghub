import React from "react";

export default function Footer() {
  return (
    <div style={{ marginTop: 28, padding: "22px 16px", borderTop: "1px solid #e5e7eb", background: "#fff" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 18 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>За BookingHub</div>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            BookingHub е платформа за управление на резервации. Бизнесите публикуват свободни слотове, а клиентите изпращат заявки.
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Контакти</div>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            Email: support@bookinghub.dev
            <br />
            Тел: +359 88 000 0000
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Полезно</div>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
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
