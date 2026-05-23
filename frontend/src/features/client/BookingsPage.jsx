import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { getRole, isLoggedIn } from "../../lib/authStore";
import { cancelMyBooking, getMyBookings, saveBookingReview } from "./api";
import { resolveBackendImage, serviceFallbackImage } from "../../lib/assets";

function bookingImage(item) {
  return resolveBackendImage(item?.coverImageUrl) || serviceFallbackImage(item);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [cancelReasonById, setCancelReasonById] = useState({});
  const [cancelOpenId, setCancelOpenId] = useState(null);
  const [cancelSavingId, setCancelSavingId] = useState(null);
  const [reviewOpenId, setReviewOpenId] = useState(null);
  const [reviewDraftById, setReviewDraftById] = useState({});
  const [reviewSavingId, setReviewSavingId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      navigate("/");
      return;
    }

    getMyBookings().then(setBookings).catch(() => setBookings([]));
  }, [navigate]);

  const summary = useMemo(() => {
    const now = new Date();
    return bookings.reduce(
      (acc, item) => {
        acc.total += 1;
        const startAt = new Date(item.startAt);
        if (startAt >= now && (item.status === "PENDING" || item.status === "CONFIRMED")) {
          acc.upcoming += 1;
        }
        if (item.status === "PENDING") acc.pending += 1;
        if (item.status === "CONFIRMED") acc.confirmed += 1;
        if (item.status === "COMPLETED") acc.completed += 1;
        if (item.status === "REJECTED" || item.status === "CANCELED") acc.closed += 1;
        return acc;
      },
      { total: 0, upcoming: 0, pending: 0, confirmed: 0, completed: 0, closed: 0 }
    );
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    const now = new Date();

    if (activeFilter === "upcoming") {
      return bookings.filter((item) => new Date(item.startAt) >= now && (item.status === "PENDING" || item.status === "CONFIRMED"));
    }
    if (activeFilter === "pending") {
      return bookings.filter((item) => item.status === "PENDING");
    }
    if (activeFilter === "confirmed") {
      return bookings.filter((item) => item.status === "CONFIRMED");
    }
    if (activeFilter === "completed") {
      return bookings.filter((item) => item.status === "COMPLETED");
    }
    if (activeFilter === "closed") {
      return bookings.filter((item) => item.status === "REJECTED" || item.status === "CANCELED");
    }
    return bookings;
  }, [activeFilter, bookings]);

  async function onCancelBooking(bookingId) {
    const reason = (cancelReasonById[bookingId] || "").trim();
    if (!reason) {
      alert("Въведи причина за отказа от услугата.");
      return;
    }

    setCancelSavingId(bookingId);
    try {
      const updated = await cancelMyBooking(bookingId, { reason });
      setBookings((current) => current.map((item) => (item.id === bookingId ? updated : item)));
      setCancelReasonById((current) => ({ ...current, [bookingId]: "" }));
      setCancelOpenId(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setCancelSavingId(null);
    }
  }

  async function onSaveReview(item) {
    const draft = reviewDraftById[item.id] || {};
    const rating = Number(draft.rating || item.reviewRating || 5);
    const comment = (draft.comment ?? item.reviewComment ?? "").trim();

    if (!rating || rating < 1 || rating > 5) {
      alert("Избери оценка от 1 до 5.");
      return;
    }

    setReviewSavingId(item.id);
    try {
      const saved = await saveBookingReview(item.id, { rating, comment: comment || null });
      setBookings((current) => current.map((booking) => (
        booking.id === item.id
          ? { ...booking, reviewId: saved.id, reviewRating: saved.rating, reviewComment: saved.comment }
          : booking
      )));
      setReviewOpenId(null);
      setReviewDraftById((current) => ({ ...current, [item.id]: { rating: saved.rating, comment: saved.comment } }));
    } catch (error) {
      alert(error.message);
    } finally {
      setReviewSavingId(null);
    }
  }

  return (
    <div style={page}>
      <Header />
      <div style={content}>
        <section style={hero}>
          <div style={heroIntro}>
            <div style={eyebrow}>Хронология на резервациите</div>
            <h1 style={title}>Моите резервации</h1>
            <p style={subtitle}>
              Следи всяка заявка за резервация от първото действие до крайния ѝ статус в една ясна хронология.
            </p>
          </div>

          <div style={summaryGrid}>
            <SummaryCard value={summary.upcoming} label="Предстоящи" tone="slate" active={activeFilter === "upcoming"} onClick={() => setActiveFilter("upcoming")} />
            <SummaryCard value={summary.pending} label="Изчакващи" tone="amber" active={activeFilter === "pending"} onClick={() => setActiveFilter("pending")} />
            <SummaryCard value={summary.confirmed} label="Потвърдени" tone="green" active={activeFilter === "confirmed"} onClick={() => setActiveFilter("confirmed")} />
            <SummaryCard value={summary.completed} label="Завършени" tone="blue" active={activeFilter === "completed"} onClick={() => setActiveFilter("completed")} />
            <SummaryCard value={summary.closed} label="Отказани/отменени" tone="slate" active={activeFilter === "closed"} onClick={() => setActiveFilter("closed")} />
          </div>
        </section>

        {bookings.length === 0 ? (
          <div style={emptyCard}>
              <div style={emptyTitle}>Все още нямаш резервации</div>
              <p style={emptyText}>Когато резервираш час, хронологията на заявките ти ще започне оттук.</p>
              <Link to="/" style={emptyLink}>Резервирай първата си услуга</Link>
          </div>
        ) : (
          <section style={timelineWrap}>
            <div style={sectionHeader}>
              <div>
                <div style={sectionTitle}>{filterTitle(activeFilter)}</div>
              </div>
            </div>

            {visibleBookings.length === 0 ? (
              <div style={emptyFilteredCard}>За този изглед в момента няма резервации.</div>
            ) : (
              <>
                <div style={timelineList}>
                  {visibleBookings.map((item) => {
                    const canCancel = (item.status === "PENDING" || item.status === "CONFIRMED") && new Date(item.startAt) > new Date();
                    const isCancelOpen = cancelOpenId === item.id;
                    const canReview = item.status === "COMPLETED";
                    const isReviewOpen = reviewOpenId === item.id;
                    const reviewDraft = reviewDraftById[item.id] || {
                      rating: item.reviewRating || 5,
                      comment: item.reviewComment || "",
                    };
                    return (
                      <article key={item.id} style={bookingCard}>
                        <div style={timelineRail}>
                          <div style={timelineDot(item.status)} />
                          <div style={timelineLine} />
                        </div>

                        <div style={dateCard}>
                          <div style={dateDay}>{formatDate(item.startAt)}</div>
                          <div style={dateTime}>
                            {formatTime(item.startAt)} - {formatTime(item.endAt)}
                          </div>
                          <div style={dateMeta}>{item.durationMinutes} min</div>
                        </div>

                        <div style={bookingMain}>
                          <div style={bookingTop}>
                            <div>
                              <div style={locationLine}>{item.city}{item.address ? ` • ${item.address}` : ""}</div>
                              <div style={bookingTitle}>{item.title}</div>
                            </div>
                            <div style={statusBadge(item.status)}>{formatStatus(item.status)}</div>
                          </div>

                          <div style={bookingBody}>
                            <img
                              src={bookingImage(item)}
                              alt={item.title}
                              style={bookingImageStyle}
                              onError={(event) => {
                                event.currentTarget.src = serviceFallbackImage(item);
                              }}
                            />

                            <div style={bookingInfo}>
                              <div style={infoGrid}>
                                <InfoPill label="Цена" value={`€${item.price}`} />
                                <InfoPill label="Продължителност" value={`${item.durationMinutes} мин`} />
                                <InfoPill label="Заявена на" value={formatDate(item.createdAt)} />
                                <InfoPill label="Статус" value={formatStatus(item.status)} />
                              </div>

                              {item.clientNote ? (
                                <div style={noteBox}>
                                  <div style={noteLabel}>Твоя бележка</div>
                                  <div style={noteText}>{item.clientNote}</div>
                                </div>
                              ) : (
                                <div style={noteBoxMuted}>
                                  <div style={noteLabel}>Твоя бележка</div>
                                  <div style={noteText}>Няма добавена допълнителна бележка към тази заявка.</div>
                                </div>
                              )}

                              {item.statusReason ? (
                                <div style={statusReasonBox(item.status)}>
                                  <div style={noteLabel}>Промяна по статуса</div>
                                  <div style={noteText}>{item.statusReason}</div>
                                </div>
                              ) : null}

                              <div style={ctaRow}>
                                <Link to={`/services/${item.serviceId}`} style={primaryAction}>
                                  Отвори услугата
                                </Link>
                                {canCancel ? (
                                  <button
                                    type="button"
                                    onClick={() => setCancelOpenId((current) => (current === item.id ? null : item.id))}
                                    style={cancelActionButton}
                                  >
                                    Откажи резервацията
                                  </button>
                                ) : null}
                                {canReview ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewOpenId((current) => (current === item.id ? null : item.id));
                                      setReviewDraftById((current) => ({
                                        ...current,
                                        [item.id]: current[item.id] || { rating: item.reviewRating || 5, comment: item.reviewComment || "" },
                                      }));
                                    }}
                                    style={reviewActionButton}
                                  >
                                    {item.reviewId ? "Редактирай отзива" : "Остави отзив"}
                                  </button>
                                ) : null}
                              </div>

                              {isCancelOpen ? (
                                <div style={cancelBox}>
                                  <div style={noteLabel}>Причина за отказ</div>
                                  <textarea
                                    value={cancelReasonById[item.id] || ""}
                                    onChange={(event) => setCancelReasonById((current) => ({ ...current, [item.id]: event.target.value }))}
                                    placeholder="Напиши защо отказваш тази услуга"
                                    style={cancelTextarea}
                                  />
                                  <div style={cancelActions}>
                                    <button type="button" onClick={() => onCancelBooking(item.id)} disabled={cancelSavingId === item.id} style={dangerConfirmButton}>
                                      {cancelSavingId === item.id ? "Отказване..." : "Потвърди отказа"}
                                    </button>
                                    <button type="button" onClick={() => setCancelOpenId(null)} style={cancelSecondaryButton}>
                                      Назад
                                    </button>
                                  </div>
                                </div>
                              ) : null}

                              {isReviewOpen ? (
                                <div style={reviewBox}>
                                  <div style={noteLabel}>Оценка за услугата</div>
                                  <div style={ratingPicker}>
                                    {[1, 2, 3, 4, 5].map((value) => (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() => setReviewDraftById((current) => ({ ...current, [item.id]: { ...reviewDraft, rating: value } }))}
                                        style={{
                                          ...ratingButton,
                                          background: value <= Number(reviewDraft.rating || 0) ? "#2563eb" : "rgba(15,23,42,0.42)",
                                          color: value <= Number(reviewDraft.rating || 0) ? "#fff" : "#bfdbfe",
                                        }}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={reviewDraft.comment}
                                    onChange={(event) => setReviewDraftById((current) => ({ ...current, [item.id]: { ...reviewDraft, comment: event.target.value } }))}
                                    placeholder="Разкажи накратко как мина услугата"
                                    style={cancelTextarea}
                                  />
                                  <div style={cancelActions}>
                                    <button type="button" onClick={() => onSaveReview(item)} disabled={reviewSavingId === item.id} style={reviewConfirmButton}>
                                      {reviewSavingId === item.id ? "Запазване..." : "Запази отзива"}
                                    </button>
                                    <button type="button" onClick={() => setReviewOpenId(null)} style={cancelSecondaryButton}>
                                      Назад
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div style={sectionFooterAction}>
                  <Link to="/" style={sectionAction}>Намери друга услуга</Link>
                </div>
              </>
            )}
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}

function SummaryCard({ value, label, tone, active, onClick }) {
  const palette = {
    slate: { background: "rgba(15,23,42,0.46)", border: "rgba(148,163,184,0.24)", value: "#e2e8f0" },
    amber: { background: "rgba(66,32,6,0.58)", border: "rgba(251,191,36,0.22)", value: "#fbbf24" },
    green: { background: "rgba(8,37,34,0.56)", border: "rgba(52,211,153,0.22)", value: "#6ee7b7" },
    blue: { background: "rgba(17,40,84,0.58)", border: "rgba(96,165,250,0.24)", value: "#93c5fd" },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...summaryCard,
        background: palette[tone].background,
        borderColor: active ? "#bfdbfe" : palette[tone].border,
        boxShadow: active ? "0 18px 40px rgba(37,99,235,0.18)" : "none",
      }}
    >
      <div style={{ ...summaryValue, color: palette[tone].value }}>{value}</div>
      <div style={summaryLabel}>{label}</div>
    </button>
  );
}

function filterTitle(activeFilter) {
  if (activeFilter === "upcoming") return "Предстоящи посещения";
  if (activeFilter === "pending") return "Изчакващи заявки";
  if (activeFilter === "confirmed") return "Потвърдени резервации";
  if (activeFilter === "completed") return "Завършени посещения";
  if (activeFilter === "closed") return "Отказани и отменени заявки";
  return "Моите резервации";
}

function InfoPill({ label, value }) {
  return (
    <div style={infoPill}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{value}</div>
    </div>
  );
}

function formatStatus(status) {
  if (status === "PENDING") return "Изчакваща";
  if (status === "CONFIRMED") return "Потвърдена";
  if (status === "COMPLETED") return "Завършена";
  if (status === "REJECTED") return "Отказана";
  if (status === "CANCELED") return "Отменена";
  return status;
}

function statusBadge(status) {
  const palette = {
    PENDING: { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    CONFIRMED: { background: "#ecfdf5", color: "#047857", border: "#bbf7d0" },
    COMPLETED: { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    REJECTED: { background: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    CANCELED: { background: "#f8fafc", color: "#475569", border: "#cbd5e1" },
  };

  return {
    padding: "9px 13px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    border: "1px solid",
    ...palette[status],
  };
}

function timelineDot(status) {
  const colors = {
    PENDING: "#f97316",
    CONFIRMED: "#10b981",
    COMPLETED: "#2563eb",
    REJECTED: "#ef4444",
    CANCELED: "#94a3b8",
  };

  return {
    width: 16,
    height: 16,
    borderRadius: 999,
    background: colors[status] || "#2563eb",
    boxShadow: `0 0 0 5px ${status === "PENDING" ? "rgba(249,115,22,0.16)" : status === "CONFIRMED" ? "rgba(16,185,129,0.16)" : status === "REJECTED" ? "rgba(239,68,68,0.14)" : "rgba(148,163,184,0.16)"}`,
  };
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 14%, #eaf2ff 42%, #f6f9ff 100%)",
};
const content = { maxWidth: 1180, margin: "0 auto", padding: "18px 16px 28px" };
const hero = {
  display: "grid",
  gap: 20,
  padding: 24,
  borderRadius: 32,
  background: "linear-gradient(135deg, rgba(7,15,31,0.94) 0%, rgba(13,33,70,0.96) 55%, rgba(24,64,132,0.92) 100%)",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 28px 80px rgba(2,6,23,0.24)",
};
const heroIntro = { display: "grid", gap: 10, maxWidth: 760 };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#93c5fd" };
const title = { margin: "12px 0 10px", fontSize: 42, lineHeight: 1.02, color: "#eff6ff" };
const subtitle = { margin: 0, maxWidth: 560, color: "rgba(226,232,240,0.78)", lineHeight: 1.75, fontSize: 16 };
const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  alignContent: "start",
};
const summaryCard = { border: "1px solid", borderRadius: 22, padding: "18px 18px 16px", backdropFilter: "blur(10px)", textAlign: "left", cursor: "pointer" };
const summaryValue = { fontSize: 30, fontWeight: 900, lineHeight: 1 };
const summaryLabel = { marginTop: 8, color: "#cbd5e1", fontWeight: 700 };
const emptyCard = {
  marginTop: 18,
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  borderRadius: 28,
  padding: "34px 28px",
  boxShadow: "0 24px 60px rgba(2,6,23,0.22)",
};
const emptyTitle = { fontWeight: 900, fontSize: 24, color: "#eff6ff" };
const emptyText = { marginTop: 10, color: "rgba(226,232,240,0.78)", lineHeight: 1.7, maxWidth: 520 };
const emptyLink = {
  display: "inline-flex",
  marginTop: 16,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
};
const timelineWrap = { marginTop: 18 };
const emptyFilteredCard = {
  padding: "22px 24px",
  borderRadius: 22,
  background: "rgba(15,23,42,0.42)",
  border: "1px dashed rgba(96,165,250,0.22)",
  color: "rgba(226,232,240,0.74)",
  lineHeight: 1.7,
};
const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 18,
  marginBottom: 16,
};
const sectionFooterAction = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 18,
};
const sectionTitle = {
  marginTop: 8,
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.24)",
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  boxShadow: "0 14px 30px rgba(2,6,23,0.18)",
  fontSize: 30,
  fontWeight: 900,
  color: "#ffffff",
};
const sectionAction = {
  textDecoration: "none",
  color: "#eff6ff",
  fontWeight: 800,
  padding: "10px 14px",
  borderRadius: 999,
  background: "linear-gradient(180deg, rgba(37,99,235,0.94) 0%, rgba(29,78,216,0.98) 100%)",
  border: "1px solid rgba(147,197,253,0.34)",
  boxShadow: "0 14px 30px rgba(37,99,235,0.18)",
};

const cancelActionButton = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "1px solid rgba(248,113,113,0.28)",
  background: "rgba(255,241,242,0.9)",
  color: "#be123c",
  fontWeight: 900,
  cursor: "pointer",
};

const reviewActionButton = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(37,99,235,0.16)",
  color: "#bfdbfe",
  fontWeight: 900,
  cursor: "pointer",
};

const reviewBox = {
  marginTop: 14,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(15,23,42,0.34)",
  display: "grid",
  gap: 10,
};

const ratingPicker = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const ratingButton = {
  width: 42,
  height: 42,
  borderRadius: 12,
  border: "1px solid rgba(96,165,250,0.22)",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 900,
};

const reviewConfirmButton = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const cancelBox = {
  marginTop: 14,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(248,113,113,0.22)",
  background: "rgba(255,241,242,0.08)",
  display: "grid",
  gap: 10,
};

const cancelTextarea = {
  width: "100%",
  minHeight: 90,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(248,113,113,0.18)",
  background: "rgba(15,23,42,0.28)",
  color: "#eff6ff",
  boxSizing: "border-box",
  resize: "vertical",
  font: "inherit",
};

const cancelActions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const dangerConfirmButton = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #be123c, #9f1239)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const cancelSecondaryButton = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.26)",
  background: "rgba(15,23,42,0.22)",
  color: "#eff6ff",
  fontWeight: 900,
  cursor: "pointer",
};
const timelineList = { display: "grid", gap: 18 };
const bookingCard = {
  display: "grid",
  gridTemplateColumns: "28px minmax(120px, 170px) minmax(0, 1fr)",
  gap: 16,
  alignItems: "start",
  padding: 20,
  borderRadius: 28,
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  border: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 24px 60px rgba(2,6,23,0.22)",
};
const timelineRail = { display: "grid", justifyItems: "center", alignSelf: "stretch" };
const timelineLine = { width: 2, flex: 1, minHeight: 120, background: "linear-gradient(180deg, #bfdbfe 0%, #e2e8f0 100%)", marginTop: 10 };
const dateCard = {
  padding: "16px 14px",
  borderRadius: 22,
  background: "#0f172a",
  color: "#fff",
  display: "grid",
  gap: 8,
  alignContent: "start",
};
const dateDay = { fontWeight: 900, fontSize: 18, lineHeight: 1.2 };
const dateTime = { color: "rgba(255,255,255,0.88)", fontWeight: 700 };
const dateMeta = {
  marginTop: 2,
  display: "inline-flex",
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.1)",
  fontSize: 12,
  fontWeight: 800,
};
const bookingMain = { display: "grid", gap: 16 };
const bookingTop = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" };
const locationLine = { color: "#94a3b8", fontSize: 13, fontWeight: 700 };
const bookingTitle = { marginTop: 8, fontSize: 28, lineHeight: 1.08, fontWeight: 900, color: "#eff6ff" };
const bookingBody = { display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 16 };
const bookingImageStyle = {
  width: "100%",
  height: 220,
  borderRadius: 22,
  objectFit: "cover",
  boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
};
const bookingInfo = { display: "grid", gap: 14, alignContent: "start" };
const infoGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 };
const infoPill = {
  padding: "13px 14px",
  borderRadius: 16,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(96,165,250,0.18)",
};
const infoLabel = { fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" };
const infoValue = { marginTop: 5, fontWeight: 800, color: "#eff6ff" };
const noteBox = {
  padding: "15px 16px",
  borderRadius: 18,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(96,165,250,0.18)",
};
const noteBoxMuted = {
  padding: "15px 16px",
  borderRadius: 18,
  background: "rgba(15,23,42,0.3)",
  border: "1px solid rgba(96,165,250,0.12)",
};
function statusReasonBox(status) {
  const palette = status === "CANCELED"
    ? { background: "#fff7ed", border: "#fed7aa" }
    : status === "REJECTED"
      ? { background: "#fff1f2", border: "#fecdd3" }
      : { background: "#f8fafc", border: "#e2e8f0" };

  return { padding: "15px 16px", borderRadius: 18, background: palette.background, border: `1px solid ${palette.border}` };
}
const noteLabel = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" };
const noteText = { marginTop: 8, color: "rgba(226,232,240,0.78)", lineHeight: 1.7 };
const ctaRow = { display: "flex", gap: 10, flexWrap: "wrap" };
const primaryAction = {
  textDecoration: "none",
  textAlign: "center",
  padding: "13px 16px",
  borderRadius: 16,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 900,
  boxShadow: "0 18px 40px rgba(37,99,235,0.2)",
};
