import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/layout/Header";
import { resolveBackendImage } from "../../../lib/assets";
import { createServiceComment, getServiceComments, getServiceReviews } from "../../services/api";
import { listMyServices, listMyServiceStats } from "./api";

export default function BusinessServicesPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState([]);
  const [openedFeedbackService, setOpenedFeedbackService] = useState(null);
  const [feedback, setFeedback] = useState({ comments: [], reviews: [] });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [replyTextByKey, setReplyTextByKey] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [data, nextStats] = await Promise.all([listMyServices(), listMyServiceStats()]);
      setItems(data);
      setStats(nextStats);
    } catch (loadError) {
      setError(loadError?.message || "Неуспешно зареждане на обявите");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statsByServiceId = useMemo(() => {
    return Object.fromEntries(stats.map((item) => [item.serviceId, item]));
  }, [stats]);

  const topRated = useMemo(() => [...stats].sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount).slice(0, 5), [stats]);
  const mostBooked = useMemo(() => [...stats].sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5), [stats]);
  const mostCommented = useMemo(() => [...stats].sort((a, b) => b.commentCount - a.commentCount || b.reviewCount - a.reviewCount).slice(0, 5), [stats]);

  async function openFeedback(service) {
    setOpenedFeedbackService(service);
    setFeedbackLoading(true);
    setError("");
    try {
      const [comments, reviews] = await Promise.all([
        getServiceComments(service.id),
        getServiceReviews(service.id),
      ]);
      setFeedback({ comments, reviews });
    } catch (loadError) {
      setError(loadError?.message || "Неуспешно зареждане на коментарите");
      setFeedback({ comments: [], reviews: [] });
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function submitReply(serviceId, target) {
    const key = `${target.type}-${target.id}`;
    const text = (replyTextByKey[key] || "").trim();
    if (!text) return;

    try {
      const created = await createServiceComment(serviceId, {
        text,
        parentId: target.type === "comment" ? target.id : null,
        parentReviewId: target.type === "review" ? target.id : null,
      });
      setFeedback((current) => ({ ...current, comments: [created, ...current.comments] }));
      setReplyTextByKey((current) => ({ ...current, [key]: "" }));
    } catch (replyError) {
      setError(replyError?.message || "Неуспешно публикуване на отговор");
    }
  }

  if (loading) return <div style={{ padding: 24, color: "#e2e8f0" }}>Зареждане на обявите…</div>;

  return (
    <div style={{ minHeight: "100vh", background: pageBackground }}>
      <Header categories={[]} recentSearches={[]} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 16px 44px" }}>
        <div style={hero}>
          <div>
            <div style={eyebrow}>Бизнес обяви</div>
            <h2 style={{ margin: "8px 0 10px", fontSize: 34, lineHeight: 1.05, color: "#eff6ff" }}>Управлявай услугите, които клиентите ти могат да резервират.</h2>
            <p style={{ margin: 0, color: "rgba(226,232,240,0.8)", maxWidth: 720, lineHeight: 1.6 }}>
              Преглеждай активните обяви, отваряй публичната им страница и поддържай каталога си подреден, докато екипът ти расте.
            </p>
          </div>
          <Link to="/business/services/new" style={cta}>
            Създай нова обява
          </Link>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {!items.length ? (
          <div style={emptyState}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#eff6ff" }}>Все още няма обяви</div>
            <div style={{ color: "rgba(191,219,254,0.74)", maxWidth: 520 }}>
              Започни с една услуга, свържи правилния служител или екип и публикувай първите работещи часове за клиентите.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
          <section style={statsSection}>
            <StatsTable title="Най-добър рейтинг" rows={topRated} value={(item) => `${item.averageRating.toFixed(1)} / 5`} emptyValue="Няма отзиви" />
            <StatsTable title="Най-често резервирани" rows={mostBooked} value={(item) => `${item.bookingCount} резервации`} emptyValue="Няма резервации" />
            <StatsTable title="Най-коментирани" rows={mostCommented} value={(item) => `${item.commentCount + item.reviewCount} мнения`} emptyValue="Няма мнения" />
          </section>

          {openedFeedbackService ? (
            <section style={feedbackPanel}>
              <div style={feedbackHeader}>
                <div>
                  <div style={eyebrow}>Коментари и отзиви</div>
                  <h3 style={feedbackTitle}>{openedFeedbackService.title}</h3>
                </div>
                <button type="button" onClick={() => setOpenedFeedbackService(null)} style={closeButton}>Затвори</button>
              </div>
              {feedbackLoading ? (
                <div style={mutedPanelText}>Зареждане на мненията...</div>
              ) : (
                <FeedbackList
                  serviceId={openedFeedbackService.id}
                  comments={feedback.comments}
                  reviews={feedback.reviews}
                  replyTextByKey={replyTextByKey}
                  setReplyTextByKey={setReplyTextByKey}
                  submitReply={submitReply}
                />
              )}
            </section>
          ) : null}

          <div style={grid}>
            {items.map((service) => {
              const imageUrl = resolveBackendImage(service.coverImageUrl);
              const serviceStats = statsByServiceId[service.id] || {};
              const approvalStatus = service.approvalStatus || "PENDING";
              const statusLabel =
                approvalStatus === "APPROVED"
                  ? "Одобрена обява"
                  : approvalStatus === "REJECTED"
                    ? "Върната от админ"
                    : "Чака одобрение";
              return (
                <div key={service.id} style={card}>
                  <div style={imageWrap}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={service.title} style={image} />
                    ) : (
                    <div style={imagePlaceholder}>BookingHub</div>
                    )}
                    <div style={statusPill}>{statusLabel}</div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#eff6ff" }}>{service.title}</div>
                      <div style={previewDescription}>{service.description || "Все още няма описание."}</div>
                    </div>

                    <div style={metaRow}>
                      <span>{service.city}</span>
                      <span>{service.durationMinutes} min</span>
                      <span>€{service.price.toFixed(2)}</span>
                    </div>

                    <div style={serviceStatsRow}>
                      <Metric label="Рейтинг" value={serviceStats.averageRating ? serviceStats.averageRating.toFixed(1) : "0.0"} />
                      <Metric label="Резервации" value={serviceStats.bookingCount || 0} />
                      <Metric label="Мнения" value={(serviceStats.commentCount || 0) + (serviceStats.reviewCount || 0)} />
                    </div>

                    {approvalStatus !== "APPROVED" && service.approvalNote ? (
                      <div style={pendingNotice}>
                        <div style={{ fontWeight: 900, color: "#dbeafe" }}>
                          {approvalStatus === "REJECTED" ? "Админ бележка" : "Статус на одобрението"}
                        </div>
                        <div style={{ color: "rgba(226,232,240,0.82)", lineHeight: 1.6 }}>{service.approvalNote}</div>
                      </div>
                    ) : null}

                    {!service.active && service.adminDeletionReason ? (
                      <div style={adminNotice}>
                        <div style={{ fontWeight: 900, color: "#991b1b" }}>Премахната от админ</div>
                        <div style={{ color: "#7f1d1d", lineHeight: 1.6 }}>{service.adminDeletionReason}</div>
                      </div>
                    ) : null}

                    <div style={actions}>
                      <Link to={`/business/services/${service.id}/edit`} style={solidBtn}>
                        Редактирай обявата
                      </Link>
                      {approvalStatus === "APPROVED" ? (
                        <Link to={`/services/${service.id}`} style={ghostBtn}>
                          Отвори публичната страница
                        </Link>
                      ) : null}
                      <Link to="/business/bookings" style={softBtn}>
                        Виж входящите резервации
                      </Link>
                      <button type="button" onClick={() => openFeedback(service)} style={buttonLikeSoft}>
                        Разгледай коментарите
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsTable({ title, rows, value, emptyValue }) {
  return (
    <div style={statsCard}>
      <div style={statsTitle}>{title}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((item, index) => (
          <div key={`${title}-${item.serviceId}`} style={statsRow}>
            <span style={rankBadge}>{index + 1}</span>
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
            <strong>{Number(value(item).split(" ")[0]) === 0 ? emptyValue : value(item)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricBox}>
      <div style={metricValue}>{value}</div>
      <div style={metricLabel}>{label}</div>
    </div>
  );
}

function FeedbackList({ serviceId, comments, reviews, replyTextByKey, setReplyTextByKey, submitReply }) {
  const topLevelComments = comments.filter((comment) => comment.parentId == null && comment.parentReviewId == null);
  const commentsByParent = comments.reduce((acc, comment) => {
    if (comment.parentId != null) {
      acc[comment.parentId] = [...(acc[comment.parentId] || []), comment];
    }
    return acc;
  }, {});
  const commentsByReview = comments.reduce((acc, comment) => {
    if (comment.parentReviewId != null) {
      acc[comment.parentReviewId] = [...(acc[comment.parentReviewId] || []), comment];
    }
    return acc;
  }, {});

  if (!comments.length && !reviews.length) {
    return <div style={mutedPanelText}>Все още няма коментари или отзиви към тази обява.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {reviews.map((review) => (
        <FeedbackItem
          key={`review-${review.id}`}
          title={`${review.authorName} · ${review.rating}/5`}
          text={review.comment || "Отзив без текст."}
          replies={commentsByReview[review.id] || []}
          replyKey={`review-${review.id}`}
          replyTextByKey={replyTextByKey}
          setReplyTextByKey={setReplyTextByKey}
          onReply={() => submitReply(serviceId, { type: "review", id: review.id })}
        />
      ))}
      {topLevelComments.map((comment) => (
        <FeedbackItem
          key={`comment-${comment.id}`}
          title={`${comment.authorName} · коментар`}
          text={comment.text}
          replies={commentsByParent[comment.id] || []}
          replyKey={`comment-${comment.id}`}
          replyTextByKey={replyTextByKey}
          setReplyTextByKey={setReplyTextByKey}
          onReply={() => submitReply(serviceId, { type: "comment", id: comment.id })}
        />
      ))}
    </div>
  );
}

function FeedbackItem({ title, text, replies, replyKey, replyTextByKey, setReplyTextByKey, onReply }) {
  return (
    <article style={feedbackItem}>
      <div style={{ fontWeight: 900, color: "#eff6ff" }}>{title}</div>
      <div style={feedbackText}>{text}</div>
      {replies.length ? (
        <div style={replyList}>
          {replies.map((reply) => (
            <div key={reply.id} style={replyItem}>
              <strong>{reply.authorName}</strong>
              <span>{reply.text}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div style={replyBox}>
        <input
          value={replyTextByKey[replyKey] || ""}
          onChange={(event) => setReplyTextByKey((current) => ({ ...current, [replyKey]: event.target.value }))}
          placeholder="Отговори на клиента"
          style={replyInput}
        />
        <button type="button" onClick={onReply} style={replyButton}>Отговори</button>
      </div>
    </article>
  );
}

const pageBackground = "radial-gradient(circle at top left, rgba(96,165,250,0.24) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 16%, #eaf2ff 44%, #f6f9ff 100%)";
const hero = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 20, padding: "24px 26px", borderRadius: 28, background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", border: "1px solid rgba(96,165,250,0.24)" };
const eyebrow = { fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase", color: "#1d4ed8", fontWeight: 900 };
const cta = { textDecoration: "none", borderRadius: 16, padding: "14px 18px", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 18px 30px rgba(37, 99, 235, 0.2)" };
const errorBox = { marginBottom: 16, padding: 14, borderRadius: 16, border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239", fontWeight: 700 };
const emptyState = { minHeight: 280, display: "grid", gap: 8, placeContent: "center", padding: 24, borderRadius: 28, border: "1px dashed rgba(96,165,250,0.24)", background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 };
const statsSection = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 };
const statsCard = { padding: 16, borderRadius: 22, background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", border: "1px solid rgba(96,165,250,0.22)", display: "grid", gap: 12 };
const statsTitle = { fontSize: 15, fontWeight: 900, color: "#eff6ff" };
const statsRow = { display: "grid", gridTemplateColumns: "32px minmax(0,1fr) auto", gap: 10, alignItems: "center", color: "rgba(226,232,240,0.86)", fontSize: 13 };
const rankBadge = { width: 26, height: 26, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(37,99,235,0.28)", color: "#dbeafe", fontWeight: 900 };
const card = { display: "grid", gap: 16, padding: 18, borderRadius: 26, border: "1px solid rgba(96,165,250,0.22)", background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.96) 100%)", boxShadow: "0 22px 45px rgba(15, 23, 42, 0.18)" };
const previewDescription = {
  color: "rgba(226,232,240,0.8)",
  lineHeight: 1.55,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const imageWrap = { position: "relative", borderRadius: 22, overflow: "hidden", minHeight: 210, background: "linear-gradient(135deg, #dbeafe, #eff6ff)" };
const image = { width: "100%", height: 210, objectFit: "cover", display: "block" };
const imagePlaceholder = { minHeight: 210, display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900, letterSpacing: 1.4 };
const statusPill = { position: "absolute", top: 14, right: 14, padding: "8px 12px", borderRadius: 999, background: "rgba(15, 23, 42, 0.72)", color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase" };
const metaRow = { display: "flex", gap: 12, flexWrap: "wrap", color: "rgba(191,219,254,0.76)", fontWeight: 700 };
const serviceStatsRow = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 };
const metricBox = { padding: "10px 12px", borderRadius: 14, background: "rgba(15,23,42,0.34)", border: "1px solid rgba(96,165,250,0.16)", minWidth: 0 };
const metricValue = { color: "#eff6ff", fontWeight: 900, fontSize: 18 };
const metricLabel = { color: "rgba(191,219,254,0.72)", fontSize: 11, textTransform: "uppercase", fontWeight: 900 };
const actions = { display: "flex", gap: 10, flexWrap: "wrap" };
const pendingNotice = { padding: "12px 14px", borderRadius: 16, background: "rgba(15,23,42,0.42)", border: "1px solid rgba(96,165,250,0.18)" };
const adminNotice = { padding: "12px 14px", borderRadius: 16, background: "#fff1f2", border: "1px solid #fecdd3" };
const ghostBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(96,165,250,0.24)", color: "#eff6ff", fontWeight: 800, background: "rgba(15,23,42,0.34)" };
const solidBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontWeight: 900 };
const softBtn = { textDecoration: "none", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(96,165,250,0.2)", background: "rgba(15,23,42,0.28)", color: "#cbd5e1", fontWeight: 800 };
const buttonLikeSoft = { ...softBtn, cursor: "pointer", fontFamily: "inherit", fontSize: 14 };
const feedbackPanel = { padding: 18, borderRadius: 26, border: "1px solid rgba(96,165,250,0.22)", background: "linear-gradient(180deg, rgba(8,18,36,0.94) 0%, rgba(17,36,71,0.98) 100%)", display: "grid", gap: 14 };
const feedbackHeader = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" };
const feedbackTitle = { margin: "4px 0 0", color: "#eff6ff", fontSize: 24 };
const closeButton = { border: "1px solid rgba(96,165,250,0.24)", background: "rgba(15,23,42,0.34)", color: "#eff6ff", borderRadius: 14, padding: "10px 14px", fontWeight: 900, cursor: "pointer" };
const mutedPanelText = { color: "rgba(191,219,254,0.76)", fontWeight: 800 };
const feedbackItem = { display: "grid", gap: 10, padding: 14, borderRadius: 18, background: "rgba(15,23,42,0.34)", border: "1px solid rgba(96,165,250,0.16)" };
const feedbackText = { color: "rgba(226,232,240,0.84)", lineHeight: 1.55 };
const replyList = { display: "grid", gap: 8, paddingLeft: 12, borderLeft: "2px solid rgba(96,165,250,0.28)" };
const replyItem = { display: "grid", gap: 3, color: "rgba(226,232,240,0.82)", lineHeight: 1.45 };
const replyBox = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8 };
const replyInput = { minWidth: 0, borderRadius: 12, border: "1px solid rgba(96,165,250,0.2)", background: "rgba(15,23,42,0.52)", color: "#eff6ff", padding: "10px 12px" };
const replyButton = { border: "none", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontWeight: 900, padding: "10px 12px", cursor: "pointer" };
