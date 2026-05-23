import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getRole, getUserId, isLoggedIn } from "../../lib/authStore";
import { resolveBackendImage } from "../../lib/assets";
import { createReport, createServiceComment, deleteServiceComment, getServiceById, getServiceComments, getServiceReviews, updateServiceComment } from "./api";
import { addFavorite, createBooking, getAvailableSlots, getFavoriteIds, removeFavorite } from "../client/api";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlotKey, setSelectedSlotKey] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);

      const [data, loadedSlots, loadedFavoriteIds, loadedComments, loadedReviews] = await Promise.all([
        getServiceById(id),
        getAvailableSlots(id).catch(() => []),
        isLoggedIn() && getRole() === "CLIENT" ? getFavoriteIds().catch(() => []) : Promise.resolve([]),
        getServiceComments(id).catch(() => []),
        getServiceReviews(id).catch(() => []),
      ]);
      if (!data) setNotFound(true);

      setService(data);
      setSlots(loadedSlots);
      setFavoriteIds(loadedFavoriteIds);
      setComments(loadedComments);
      setReviews(loadedReviews);
      setSelectedImageIndex(0);

      const firstResourceId = loadedSlots[0]?.resourceId ? String(loadedSlots[0].resourceId) : "";
      const firstSlot = firstResourceId
        ? loadedSlots.find((slot) => String(slot.resourceId) === firstResourceId)
        : loadedSlots[0];

      setSelectedResourceId(firstResourceId);
      setSelectedDate(firstSlot ? localDateKey(firstSlot.startAt) : "");
      setSelectedSlotKey(firstSlot?.bookingKey ?? "");
      setLoading(false);
    }

    load();
  }, [id]);

  async function onReserve() {
    if (!isLoggedIn()) {
      alert("За да резервираш, трябва първо да влезеш в профила си.");
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      alert("Резервации могат да правят само клиентски профили.");
      return;
    }
    const selectedSlot = slots.find((slot) => slot.bookingKey === selectedSlotKey);
    if (!selectedSlot) {
      alert("Първо избери свободен час.");
      return;
    }

    setSubmitting(true);

    try {
      await createBooking({
        serviceId: Number(id),
        resourceId: selectedSlot.resourceId,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        clientNote: note.trim() || null,
      });
      alert("Заявката за резервация беше създадена успешно.");
      navigate("/my-bookings");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onToggleFavorite() {
    if (!isLoggedIn()) {
      alert("Първо влез в профила си, за да запазваш любими.");
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      alert("Любимите са налични само за клиентски профили.");
      return;
    }

    const serviceId = Number(id);
    const isFavorite = favoriteIds.includes(serviceId);

    if (isFavorite) {
      await removeFavorite(serviceId);
      setFavoriteIds((current) => current.filter((item) => item !== serviceId));
      return;
    }

    await addFavorite(serviceId);
    setFavoriteIds((current) => [...current, serviceId]);
  }

  async function onSubmitComment() {
    if (!isLoggedIn()) {
      alert("За да коментираш, трябва първо да влезеш в профила си.");
      navigate("/login");
      return;
    }
    if (getRole() !== "CLIENT") {
      alert("Коментари могат да публикуват само клиентски профили.");
      return;
    }
    if (!commentText.trim()) {
      alert("Напиши текст на коментара.");
      return;
    }

    setCommentSubmitting(true);
    try {
      const created = await createServiceComment(id, { text: commentText.trim(), parentId: null });
      setComments((current) => [created, ...current]);
      setCommentText("");
    } catch (error) {
      alert(error.message);
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function onSaveEditedComment(commentId) {
    if (!editingText.trim()) {
      alert("Напиши текст на коментара.");
      return;
    }

    try {
      const updated = await updateServiceComment(id, commentId, { text: editingText.trim() });
      setComments((current) => current.map((item) => (item.id === commentId ? updated : item)));
      setEditingCommentId(null);
      setEditingText("");
    } catch (error) {
      alert(error.message);
    }
  }

  async function onDeleteOwnComment(commentId) {
    const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш този коментар?");
    if (!confirmed) return;

    try {
      await deleteServiceComment(id, commentId);
      setComments((current) => current.filter((item) => item.id !== commentId && item.parentId !== commentId));
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingText("");
      }
    } catch (error) {
      alert(error.message);
    }
  }

  async function onSubmitReply({ parentId = null, parentReviewId = null }) {
    if (!replyText.trim()) {
      alert("Напиши текст на отговора.");
      return;
    }

    setReplySubmitting(true);
    try {
      const created = await createServiceComment(id, { text: replyText.trim(), parentId, parentReviewId });
      setComments((current) => [...current, {
        ...created,
        parentId: created.parentId ?? parentId,
        parentReviewId: created.parentReviewId ?? parentReviewId,
      }]);
      setReplyParentId(null);
      setReplyReviewId(null);
      setReplyText("");
    } catch (error) {
      alert(error.message);
    } finally {
      setReplySubmitting(false);
    }
  }

  async function onReport(targetType, targetId, promptLabel) {
    if (!isLoggedIn()) {
      alert("Влез в профила си, за да подадеш сигнал.");
      navigate("/login");
      return;
    }

    const reason = window.prompt(promptLabel);
    if (reason == null) return;
    if (!reason.trim()) {
      alert("Причината за сигнала е задължителна.");
      return;
    }

    try {
      await createReport({
        targetType,
        targetId,
        reasonText: reason.trim(),
      });
      alert("Сигналът беше подаден успешно.");
    } catch (error) {
      alert(error.message);
    }
  }

  const todayKey = localDateKey(new Date());
  const galleryImages = (service?.imageUrls?.length ? service.imageUrls : [service?.coverImageUrl])
    .filter(Boolean)
    .map(resolveBackendImage)
    .filter(Boolean);
  const imageUrl = galleryImages[selectedImageIndex] || resolveBackendImage(service?.coverImageUrl);
  const isFavorite = favoriteIds.includes(Number(id));
  const resourceOptions = Array.from(
    new Map(
      slots.map((slot) => [
        slot.resourceId,
        {
          id: slot.resourceId,
          name: slot.resourceName,
          type: slot.resourceType,
          photoUrl: slot.resourcePhotoUrl,
        },
      ])
    ).values()
  );
  const futureSlots = slots.filter((slot) => localDateKey(slot.startAt) >= todayKey);
  const firstFutureSlot = futureSlots[0] || null;
  const availableDateKeys = useMemo(
    () => new Set(futureSlots.map((slot) => localDateKey(slot.startAt))),
    [futureSlots]
  );
  const weekDates = useMemo(() => {
    const anchor = selectedDate ? parseDateKey(selectedDate) : new Date();
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      return {
        key: localDateKey(date),
        date,
        disabled: localDateKey(date) < todayKey,
        hasSlots: availableDateKeys.has(localDateKey(date)),
      };
    });
  }, [selectedDate, todayKey, availableDateKeys]);
  const dateFilteredSlots = futureSlots.filter((slot) => {
    const matchesDate = selectedDate ? localDateKey(slot.startAt) === selectedDate : true;
    const matchesResource = selectedResourceId ? String(slot.resourceId) === selectedResourceId : true;
    return matchesDate && matchesResource;
  });
  const selectedSlot = dateFilteredSlots.find((slot) => slot.bookingKey === selectedSlotKey) || null;
  const canReserve = isLoggedIn() && getRole() === "CLIENT";
  const currentUserId = getUserId();
  const isBusinessOwner = isLoggedIn() && getRole() === "BUSINESS" && Number(service?.businessUserId) === Number(currentUserId);
  const reviewSummary = useMemo(() => {
    if (!reviews.length) return { average: 0, count: 0 };
    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return { average: total / reviews.length, count: reviews.length };
  }, [reviews]);
  const backTarget = typeof location.state?.from === "string" && location.state.from.trim()
    ? location.state.from
    : "/";
  const legacyRepliesByReviewId = useMemo(() => {
    return comments.reduce((acc, comment) => {
      if (comment.parentId != null || comment.parentReviewId != null || comment.authorRole !== "BUSINESS") return acc;
      const matchedReview = reviews.find((review) => {
        const authorFirstName = firstNameOf(review.authorName);
        return authorFirstName && normalizeFeedbackText(comment.text).includes(authorFirstName);
      });
      if (!matchedReview) return acc;
      acc[matchedReview.id] = [...(acc[matchedReview.id] || []), comment];
      return acc;
    }, {});
  }, [comments, reviews]);
  const legacyReplyIds = useMemo(() => new Set(Object.values(legacyRepliesByReviewId).flat().map((reply) => reply.id)), [legacyRepliesByReviewId]);
  const topLevelComments = comments.filter((comment) => comment.parentId == null && comment.parentReviewId == null && !legacyReplyIds.has(comment.id));
  const repliesByParentId = comments.reduce((acc, comment) => {
    if (comment.parentId == null) return acc;
    acc[comment.parentId] = [...(acc[comment.parentId] || []), comment];
    return acc;
  }, {});
  const repliesByReviewId = comments.reduce((acc, comment) => {
    if (comment.parentReviewId == null) return acc;
    acc[comment.parentReviewId] = [...(acc[comment.parentReviewId] || []), comment];
    return acc;
  }, {});
  const feedbackItems = useMemo(() => {
    const reviewItems = reviews.map((review) => ({
      type: "review",
      id: review.id,
      createdAt: review.createdAt,
      data: review,
    }));
    const commentItems = topLevelComments.map((comment) => ({
      type: "comment",
      id: comment.id,
      createdAt: comment.createdAt,
      data: comment,
    }));

    return [...reviewItems, ...commentItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, topLevelComments]);

  function canReplyToFeedbackComment(comment) {
    if (!isLoggedIn() || Number(comment.authorUserId) === Number(currentUserId)) return false;
    if (isBusinessOwner) return true;
    return getRole() === "CLIENT" && comment.authorRole === "BUSINESS";
  }

  function renderReply(reply, depth = 0) {
    const childReplies = repliesByParentId[reply.id] || [];
    const isOwnReply = Number(reply.authorUserId) === Number(currentUserId);

    return (
      <div key={reply.id} style={{ ...replyCard, marginLeft: Math.min(26 + depth * 18, 62) }}>
        <div style={commentTopRow}>
          <div style={commentTopIdentity}>
            <div style={commentAuthorAvatarWrap}>
              {reply.authorPhotoUrl ? (
                <img src={resolveBackendImage(reply.authorPhotoUrl)} alt={reply.authorName} style={commentAuthorAvatarImage} />
              ) : (
                <div style={commentAuthorAvatar}>{reply.authorName.slice(0, 1).toUpperCase()}</div>
              )}
            </div>
            <div style={{ display: "grid", gap: 2 }}>
              <strong style={feedbackAuthor}>{reply.authorName}</strong>
              <span style={commentDate}>{formatCommentDate(reply.createdAt)}</span>
            </div>
          </div>
          <div style={commentActions}>
            {canReplyToFeedbackComment(reply) ? (
              <button type="button" onClick={() => { setReplyReviewId(null); setReplyParentId(reply.id); setReplyText(""); }} style={commentActionButton}>
                Отговори
              </button>
            ) : null}
            {isOwnReply ? (
              <button type="button" onClick={() => onDeleteOwnComment(reply.id)} style={commentDangerAction}>
                Изтрий
              </button>
            ) : isLoggedIn() ? (
              <button
                type="button"
                onClick={() => onReport("COMMENT", reply.id, "Опиши защо докладваш този коментар")}
                style={commentDangerAction}
              >
                Докладвай
              </button>
            ) : null}
          </div>
        </div>
        <p style={commentBody}>{reply.text}</p>

        {replyParentId === reply.id ? (
          <div style={replyComposer}>
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="Напиши отговор"
              style={commentTextarea}
            />
            <div style={commentActions}>
              <button type="button" onClick={() => onSubmitReply({ parentId: reply.id })} disabled={replySubmitting} style={commentSubmitButton}>
                {replySubmitting ? "Публикуване..." : "Публикувай отговор"}
              </button>
              <button type="button" onClick={() => { setReplyParentId(null); setReplyText(""); }} style={commentSecondaryButton}>
                Отказ
              </button>
            </div>
          </div>
        ) : null}

        {childReplies.length ? (
          <div style={replyList}>
            {childReplies.map((childReply) => renderReply(childReply, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  }

  useEffect(() => {
    if (!futureSlots.length) {
      setSelectedDate("");
      setSelectedSlotKey("");
      return;
    }

    const hasUsableSelectedDate = selectedDate && selectedDate >= todayKey;
    const safeDate = hasUsableSelectedDate ? selectedDate : localDateKey(firstFutureSlot.startAt);
    const slotsForScope = futureSlots.filter(
      (slot) => localDateKey(slot.startAt) === safeDate && (!selectedResourceId || String(slot.resourceId) === selectedResourceId)
    );

    if (safeDate !== selectedDate) {
      setSelectedDate(safeDate);
    }

    if (slotsForScope.some((slot) => slot.bookingKey === selectedSlotKey)) {
      return;
    }

    setSelectedSlotKey(slotsForScope[0]?.bookingKey ?? "");
  }, [futureSlots, firstFutureSlot, selectedDate, selectedResourceId, todayKey]);

  if (loading) return <div style={{ padding: 24 }}>Зареждане…</div>;
  if (notFound) return <div style={{ padding: 24 }}>Услугата не е намерена. <Link to="/">Назад</Link></div>;

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "24px 24px 40px",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(96,165,250,0.16) 0%, rgba(96,165,250,0) 24%), linear-gradient(180deg, #081224 0%, #0f2f6a 14%, #eaf2ff 42%, #f6f9ff 100%)",
      }}
    >
      <Link to={backTarget} style={backLink}>← Назад към обявите</Link>

      {imageUrl && (
        <div style={heroLayout}>
          <div style={heroMediaColumn}>
            <div style={heroImageFrame}>
              <img src={imageUrl} alt={service.title} style={heroImage} />
            </div>
            {galleryImages.length > 1 && (
              <div style={thumbRow}>
                {galleryImages.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      ...thumbBtn,
                      borderColor: selectedImageIndex === index ? "#2563eb" : "#dbe4f0",
                      boxShadow: selectedImageIndex === index ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
                    }}
                  >
                    <img src={src} alt={`${service.title} ${index + 1}`} style={thumbImage} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={heroContent}>
            <div style={heroTopRow}>
              <div />
              <button onClick={onToggleFavorite} style={{ ...favoriteBtn, color: isFavorite ? "#dc2626" : "#64748b" }}>
                ♥
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div style={serviceTitleRow}>
                <h1 style={serviceTitle}>{service.title}</h1>
                <div style={titleRatingBadge}>
                  <span style={titleRatingStar}>★</span>
                  <span>{reviewSummary.count ? reviewSummary.average.toFixed(1) : "Няма оценка"}</span>
                  {reviewSummary.count ? <span style={titleRatingCount}>({reviewSummary.count})</span> : null}
                </div>
              </div>
              <p style={serviceDescription}>{service.description}</p>
            </div>

            <div style={metaGrid}>
              <div style={metaCard}>
                <span style={metaLabel}>Локация</span>
                <span style={metaValue}>{service.city}</span>
                <span style={metaSubtle}>{service.address}</span>
              </div>
              <div style={metaCard}>
                <span style={metaLabel}>Продължителност</span>
                <span style={metaValue}>{service.durationMinutes} мин</span>
                <span style={metaSubtle}>Средно време за услугата</span>
              </div>
              <div style={metaCard}>
                <span style={metaLabel}>Цена</span>
                <span style={metaValue}>€{service.price}</span>
                <span style={metaSubtle}>Крайна цена на услугата</span>
              </div>
            </div>

            <div style={heroFooter}>
              <div style={heroSummaryBlock}>
                <span style={heroSummaryLabel}>Достъп до услугата</span>
                <span style={heroSummaryText}>
                  {canReserve
                    ? "Избери изпълнител, ден и час, за да изпратиш заявка за резервация."
                    : "Тази обява е видима за всички, но резервации могат да правят само клиентски профили."}
                </span>
              </div>
              {isLoggedIn() && service?.businessUserId && Number(service.businessUserId) !== Number(currentUserId) ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => onReport("USER", service.businessUserId, "Опиши защо докладваш този бизнес профил")}
                    style={reportActionButton}
                  >
                    Докладвай бизнес профила
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 22,
          padding: 18,
          borderRadius: 18,
          border: "1px solid rgba(96,165,250,0.22)",
          background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
          boxShadow: "0 18px 46px rgba(2,6,23,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <div style={bookingEyebrow}>Резервация за</div>
          <div style={bookingDateBox}>
            {selectedDate ? formatDateLong(selectedDate) : "Избери дата"}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
          <div style={bookingEyebrow}>Избран час</div>
          <div style={bookingDateBox}>
            {selectedSlot ? formatTime(selectedSlot.startAt) : "Избери час"}
          </div>
        </div>

        {futureSlots.length === 0 ? (
          <div style={{ color: "rgba(191,219,254,0.74)" }}>В момента няма свободни часове.</div>
        ) : (
          <>
            <div style={calendarCard}>
              <div style={calendarHeader}>
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={calendarEyebrow}>Календар</div>
                </div>
                <input
                  type="date"
                  min={todayKey}
                  value={selectedDate}
                  onChange={(event) => {
                    const nextDate = event.target.value;
                    const nextSlot =
                      futureSlots.find(
                        (slot) =>
                          localDateKey(slot.startAt) === nextDate &&
                          (!selectedResourceId || String(slot.resourceId) === selectedResourceId)
                      ) || futureSlots.find((slot) => localDateKey(slot.startAt) === nextDate);
                    setSelectedDate(nextDate);
                    setSelectedSlotKey(nextSlot?.bookingKey ?? "");
                  }}
                  style={dateInput}
                />
              </div>

              <div style={dateScroller}>
                {weekDates.map((item) => {
                  const isActive = item.key === selectedDate;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        if (item.disabled) return;
                        const nextSlot = futureSlots.find(
                          (slot) => localDateKey(slot.startAt) === item.key && (!selectedResourceId || String(slot.resourceId) === selectedResourceId)
                        );
                        setSelectedDate(item.key);
                        setSelectedSlotKey(nextSlot?.bookingKey ?? "");
                      }}
                      style={{
                        ...dateCard,
                        opacity: item.disabled ? 0.45 : 1,
                        cursor: item.disabled ? "not-allowed" : "pointer",
                        borderColor: isActive ? "#60a5fa" : "rgba(96,165,250,0.18)",
                        background: isActive
                          ? "linear-gradient(180deg, rgba(17,40,84,0.88) 0%, rgba(37,99,235,0.56) 100%)"
                          : "rgba(15,23,42,0.42)",
                        boxShadow: isActive ? "0 0 0 3px rgba(37,99,235,0.18)" : "none",
                      }}
                    >
                      <span style={dateWeekday}>{item.date.toLocaleDateString([], { weekday: "short" })}</span>
                      <span style={dateDay}>{item.date.getDate()}</span>
                      <span style={dateMonth}>{item.date.toLocaleDateString([], { month: "short" })}</span>
                      <span style={{ fontSize: 11, color: item.hasSlots ? "#93c5fd" : "#94a3b8", fontWeight: 800 }}>
                        {item.disabled ? "Минал ден" : item.hasSlots ? "Свободно" : "Няма часове"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={sectionLabel}>Изпълнител на услугата</div>
              <div style={performerGrid}>
                {resourceOptions.map((resource) => {
                  const isActive = String(resource.id) === selectedResourceId;
                  return (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() => {
                        setSelectedResourceId(String(resource.id));
                        const nextSlot = futureSlots.find(
                          (slot) => String(slot.resourceId) === String(resource.id) && (!selectedDate || localDateKey(slot.startAt) === selectedDate)
                        );
                        setSelectedSlotKey(nextSlot?.bookingKey ?? "");
                      }}
                      style={{
                        ...performerCard,
                        borderColor: isActive ? "#60a5fa" : "rgba(96,165,250,0.18)",
                        background: isActive
                          ? "linear-gradient(180deg, rgba(17,40,84,0.88) 0%, rgba(37,99,235,0.56) 100%)"
                          : "rgba(15,23,42,0.42)",
                        boxShadow: isActive ? "0 0 0 3px rgba(37,99,235,0.18)" : "none",
                      }}
                    >
                      <div style={performerAvatarWrap}>
                        {resource.photoUrl ? (
                          <img src={resolveBackendImage(resource.photoUrl)} alt={resource.name} style={performerAvatar} />
                        ) : (
                          <div style={performerAvatarFallback}>{resource.type === "TEAM" ? "T" : "S"}</div>
                        )}
                      </div>
                      <div style={{ display: "grid", gap: 2, textAlign: "left" }}>
                        <span style={{ fontWeight: 900, color: "#eff6ff" }}>{resource.name}</span>
                        <span style={{ fontSize: 12, color: "rgba(191,219,254,0.74)" }}>{resource.type}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={sectionLabel}>Свободни часове</div>

              {!dateFilteredSlots.length ? (
                <div style={{ color: "rgba(191,219,254,0.74)" }}>Няма свободни часове за този ден при избрания изпълнител. Пробвай с друг ден или друг човек.</div>
              ) : (
                <div style={timeGrid}>
                  {dateFilteredSlots.map((slot) => {
                    const isActive = slot.bookingKey === selectedSlotKey;
                    return (
                      <button
                        key={slot.bookingKey}
                        type="button"
                        onClick={() => setSelectedSlotKey(slot.bookingKey)}
                        style={{
                          ...timeChip,
                          borderColor: isActive ? "#93c5fd" : "rgba(96,165,250,0.18)",
                          background: isActive ? "linear-gradient(135deg, #1d4ed8, #0f172a)" : "rgba(15,23,42,0.42)",
                          color: isActive ? "#fff" : "#eff6ff",
                          boxShadow: isActive ? "0 12px 26px rgba(15,23,42,0.2)" : "none",
                        }}
                      >
                        <span style={{ fontWeight: 900 }}>{formatTime(slot.startAt)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {canReserve ? (
              <>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Бележка към бизнеса по желание"
                  style={noteInput}
                />

                <button onClick={onReserve} style={reserveButton} disabled={submitting}>
                  {submitting ? "Запазване..." : "Резервирай"}
                </button>
              </>
            ) : (
              <div style={blockedBox}>
                {isLoggedIn()
                  ? "Бизнес и админ акаунтите могат да разглеждат публичните обяви, но само клиентските профили могат да правят резервации."
                  : "Гостите могат да разглеждат обявата и свободните часове, но само клиентските профили могат да правят резервации."}
              </div>
            )}
          </>
        )}
      </div>

      {!isLoggedIn() && (
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          Разглеждаш като гост. За да резервираш, <Link to="/login">влез</Link>.
        </p>
      )}

      <section style={commentsSection}>
        <div style={commentsHeader}>
          <div>
            <div style={sectionLabel}>Коментари</div>
            <h2 style={commentsTitle}>Мнения от клиенти</h2>
          </div>
        </div>

        {isLoggedIn() && getRole() === "CLIENT" ? (
          <div style={commentComposer}>
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Сподели впечатление за услугата"
              style={commentTextarea}
            />
            <div style={commentComposerFooter}>
              <button type="button" onClick={onSubmitComment} disabled={commentSubmitting} style={commentSubmitButton}>
                {commentSubmitting ? "Публикуване..." : "Публикувай коментар"}
              </button>
            </div>
          </div>
        ) : (
          <div style={commentInfoBox}>
            {isLoggedIn()
              ? "Само клиентски профили могат да публикуват коментари под обявите."
              : "Влез в клиентски профил, за да оставиш коментар под тази обява."}
          </div>
        )}

        {comments.length === 0 && reviews.length === 0 ? (
          <div style={commentEmptyState}>Все още няма мнения. Бъди първият, който ще остави впечатление.</div>
        ) : (
          <div style={commentsList}>
            {feedbackItems.map((item) => {
              if (item.type === "review") {
                const review = item.data;
                const reviewReplies = [...(repliesByReviewId[review.id] || []), ...(legacyRepliesByReviewId[review.id] || [])]
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                return (
                  <article key={`review-${review.id}`} style={commentCard}>
                    <div style={commentTopRow}>
                      <div style={commentTopIdentity}>
                        <div style={commentAuthorAvatarWrap}>
                          {review.authorPhotoUrl ? (
                            <img src={resolveBackendImage(review.authorPhotoUrl)} alt={review.authorName} style={commentAuthorAvatarImage} />
                          ) : (
                            <div style={commentAuthorAvatar}>{review.authorName.slice(0, 1).toUpperCase()}</div>
                          )}
                        </div>
                        <div style={{ display: "grid", gap: 4 }}>
                          <strong style={feedbackAuthor}>{review.authorName}</strong>
                          <span style={commentDate}>{formatCommentDate(review.createdAt)}</span>
                        </div>
                      </div>
                      <div style={reviewStars}>
                        {"★".repeat(review.rating)}{"☆".repeat(Math.max(0, 5 - review.rating))}
                      </div>
                    </div>
                    {review.comment ? <p style={commentBody}>{review.comment}</p> : null}

                    {reviewReplies.length ? (
                      <div style={replyList}>
                        {reviewReplies.map((reply) => renderReply(reply))}
                      </div>
                    ) : null}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                      {isBusinessOwner ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyParentId(null);
                            setReplyReviewId(review.id);
                            setReplyText("");
                          }}
                          style={commentActionButton}
                        >
                          Отговори
                        </button>
                      ) : null}
                      {isLoggedIn() && Number(review.authorUserId) !== Number(currentUserId) ? (
                        <button
                          type="button"
                          onClick={() => onReport("REVIEW", review.id, "Опиши защо докладваш този отзив")}
                          style={commentDangerAction}
                        >
                          Докладвай
                        </button>
                      ) : null}
                    </div>

                    {replyReviewId === review.id ? (
                      <div style={replyComposer}>
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          placeholder="Напиши отговор към отзива"
                          style={commentTextarea}
                        />
                        <div style={commentActions}>
                          <button type="button" onClick={() => onSubmitReply({ parentReviewId: review.id })} disabled={replySubmitting} style={commentSubmitButton}>
                            {replySubmitting ? "Публикуване..." : "Публикувай отговор"}
                          </button>
                          <button type="button" onClick={() => { setReplyReviewId(null); setReplyText(""); }} style={commentSecondaryButton}>
                            Отказ
                          </button>
                        </div>
                      </div>
                    ) : null}

                  </article>
                );
              }

              const comment = item.data;
              const replies = repliesByParentId[comment.id] || [];
              const isOwnClientComment = getRole() === "CLIENT" && Number(comment.authorUserId) === Number(currentUserId);
              const isOwnBusinessComment = getRole() === "BUSINESS" && Number(comment.authorUserId) === Number(currentUserId);
              return (
                <article key={comment.id} style={commentCard}>
                  <div style={commentTopRow}>
                    <div style={commentTopIdentity}>
                      <div style={commentAuthorAvatarWrap}>
                        {comment.authorPhotoUrl ? (
                          <img src={resolveBackendImage(comment.authorPhotoUrl)} alt={comment.authorName} style={commentAuthorAvatarImage} />
                        ) : (
                          <div style={commentAuthorAvatar}>{comment.authorName.slice(0, 1).toUpperCase()}</div>
                        )}
                      </div>
                      <div style={{ display: "grid", gap: 2 }}>
                        <strong style={feedbackAuthor}>{comment.authorName}</strong>
                        <span style={commentDate}>{formatCommentDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <div style={commentActions}>
                      {isBusinessOwner && !isOwnBusinessComment ? (
                        <button type="button" onClick={() => { setReplyReviewId(null); setReplyParentId(comment.id); setReplyText(""); }} style={commentActionButton}>
                          Отговори
                        </button>
                      ) : null}
                      {isOwnClientComment ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingText(comment.text);
                          }}
                          style={commentActionButton}
                        >
                          Редактирай
                        </button>
                      ) : null}
                      {isOwnClientComment ? (
                        <button type="button" onClick={() => onDeleteOwnComment(comment.id)} style={commentDangerAction}>
                          Изтрий
                        </button>
                      ) : null}
                      {isOwnBusinessComment ? (
                        <button type="button" onClick={() => onDeleteOwnComment(comment.id)} style={commentDangerAction}>
                          Изтрий
                        </button>
                      ) : null}
                      {isLoggedIn() && Number(comment.authorUserId) !== Number(currentUserId) ? (
                        <button
                          type="button"
                          onClick={() => onReport("COMMENT", comment.id, "Опиши защо докладваш този коментар")}
                          style={commentDangerAction}
                        >
                          Докладвай
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      <textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} style={commentTextarea} />
                      <div style={commentActions}>
                        <button type="button" onClick={() => onSaveEditedComment(comment.id)} style={commentSubmitButton}>Запази</button>
                        <button type="button" onClick={() => { setEditingCommentId(null); setEditingText(""); }} style={commentSecondaryButton}>Отказ</button>
                      </div>
                    </div>
                  ) : (
                    <p style={commentBody}>{comment.text}</p>
                  )}

                  {replyParentId === comment.id ? (
                    <div style={replyComposer}>
                      <textarea
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder="Напиши отговор към клиента"
                        style={commentTextarea}
                      />
                      <div style={commentActions}>
                        <button type="button" onClick={() => onSubmitReply({ parentId: comment.id })} disabled={replySubmitting} style={commentSubmitButton}>
                          {replySubmitting ? "Публикуване..." : "Публикувай отговор"}
                        </button>
                        <button type="button" onClick={() => { setReplyParentId(null); setReplyText(""); }} style={commentSecondaryButton}>
                          Отказ
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {replies.length ? (
                    <div style={replyList}>
                      {replies.map((reply) => renderReply(reply))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const backLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  color: "#cbd5e1",
  fontWeight: 700,
  marginBottom: 16,
};

const heroLayout = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 24,
  alignItems: "stretch",
};

const heroMediaColumn = {
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr) auto",
  gap: 12,
  minHeight: 0,
};

const heroImageFrame = {
  borderRadius: 28,
  overflow: "hidden",
  border: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 24px 60px rgba(2,6,23,0.22)",
  background: "rgba(15,23,42,0.42)",
  minHeight: 0,
  height: "100%",
};

const heroImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const heroContent = {
  padding: "24px 24px 22px",
  borderRadius: 28,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  boxShadow: "0 24px 60px rgba(2,6,23,0.22)",
  display: "grid",
  alignContent: "start",
  gap: 22,
};

const heroTopRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const serviceTitle = {
  margin: 0,
  fontSize: "clamp(2rem, 3vw, 3rem)",
  lineHeight: 1.02,
  letterSpacing: "-0.04em",
  color: "#eff6ff",
};

const serviceTitleRow = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const titleRatingBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  width: "fit-content",
  padding: "9px 12px",
  borderRadius: 999,
  border: "1px solid rgba(250,204,21,0.36)",
  background: "rgba(250,204,21,0.12)",
  color: "#fde68a",
  fontWeight: 900,
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const titleRatingStar = {
  color: "#facc15",
  fontSize: 18,
};

const titleRatingCount = {
  color: "rgba(254,240,138,0.72)",
  fontWeight: 800,
};

const serviceDescription = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.75,
  color: "rgba(226,232,240,0.78)",
  maxWidth: 520,
};

const metaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const metaCard = {
  padding: "14px 16px",
  borderRadius: 20,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  display: "grid",
  gap: 6,
  alignContent: "start",
  minWidth: 0,
};

const metaLabel = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#94a3b8",
  overflowWrap: "anywhere",
  lineHeight: 1.25,
};

const metaValue = {
  fontSize: 22,
  lineHeight: 1.15,
  fontWeight: 900,
  color: "#eff6ff",
  overflowWrap: "anywhere",
};

const metaSubtle = {
  fontSize: 13,
  lineHeight: 1.55,
  color: "#cbd5e1",
  overflowWrap: "break-word",
};

const heroFooter = {
  display: "grid",
  gap: 12,
};

const heroSummaryBlock = {
  padding: "16px 18px",
  borderRadius: 20,
  background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
  color: "#fff",
  display: "grid",
  gap: 6,
};

const heroSummaryLabel = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.7)",
};

const heroSummaryText = {
  fontSize: 14,
  lineHeight: 1.7,
  color: "#f8fafc",
};

const calendarCard = {
  marginTop: 14,
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "linear-gradient(180deg, rgba(15,23,42,0.38) 0%, rgba(17,36,71,0.48) 100%)",
};

const bookingEyebrow = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#eff6ff",
};

const bookingDateBox = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  color: "#eff6ff",
  fontWeight: 900,
  minWidth: 220,
};

const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const calendarEyebrow = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#94a3b8",
};

const dateInput = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  color: "#eff6ff",
  fontWeight: 800,
};

const dateScroller = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(88px, 1fr))",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 4,
  alignItems: "stretch",
};

const dateCard = {
  minWidth: 88,
  padding: "12px 10px",
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  cursor: "pointer",
  display: "grid",
  gap: 4,
  justifyItems: "center",
  minHeight: 128,
};

const dateWeekday = { fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" };
const dateDay = { fontSize: 26, fontWeight: 900, color: "#eff6ff", lineHeight: 1 };
const dateMonth = { fontSize: 12, fontWeight: 800, color: "#cbd5e1" };

const sectionLabel = {
  marginBottom: 10,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#93c5fd",
};

const performerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const performerCard = {
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  cursor: "pointer",
  display: "grid",
  gridTemplateColumns: "64px minmax(0, 1fr)",
  gap: 14,
  alignItems: "center",
};

const performerAvatarWrap = {
  width: 64,
  height: 64,
  borderRadius: 999,
  overflow: "hidden",
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  border: "1px solid #bfdbfe",
  boxShadow: "0 12px 24px rgba(37,99,235,0.10)",
};

const performerAvatar = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const performerAvatarFallback = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "#1d4ed8",
  fontWeight: 900,
  fontSize: 20,
};

const timeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
};

const timeChip = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  cursor: "pointer",
  display: "grid",
  gap: 4,
  textAlign: "left",
};

const noteInput = {
  width: "100%",
  minHeight: 96,
  marginTop: 12,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.24)",
  background: "rgba(15,23,42,0.52)",
  color: "#eff6ff",
  fontSize: 15,
  lineHeight: 1.6,
  resize: "vertical",
  boxSizing: "border-box",
};

const reserveButton = {
  marginTop: 12,
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const blockedBox = {
  marginTop: 12,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.32)",
  color: "rgba(226,232,240,0.78)",
  lineHeight: 1.6,
};

const favoriteBtn = {
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  borderRadius: 999,
  width: 46,
  height: 46,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 20,
  boxShadow: "0 10px 26px rgba(15,23,42,0.08)",
};

const thumbRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const thumbBtn = {
  padding: 0,
  width: 88,
  height: 72,
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  cursor: "pointer",
};

const thumbImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const commentsSection = {
  marginTop: 28,
  padding: "22px 20px",
  borderRadius: 24,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "linear-gradient(180deg, rgba(8,18,36,0.92) 0%, rgba(17,36,71,0.94) 100%)",
  boxShadow: "0 18px 46px rgba(2,6,23,0.22)",
  display: "grid",
  gap: 18,
};

const commentsHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const commentsTitle = {
  margin: "6px 0 0",
  color: "#eff6ff",
  fontSize: 26,
  lineHeight: 1.1,
};

const commentComposer = {
  padding: 16,
  borderRadius: 20,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  display: "grid",
  gap: 12,
};

const commentTextarea = {
  width: "100%",
  minHeight: 120,
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.32)",
  color: "#eff6ff",
  resize: "vertical",
  boxSizing: "border-box",
  font: "inherit",
};

const commentComposerFooter = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const commentHint = {
  fontSize: 13,
  color: "#cbd5e1",
};

const commentSubmitButton = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const commentInfoBox = {
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.32)",
  color: "rgba(226,232,240,0.78)",
  lineHeight: 1.6,
};

const commentEmptyState = {
  padding: "18px 16px",
  borderRadius: 18,
  border: "1px dashed rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.32)",
  color: "rgba(226,232,240,0.74)",
  lineHeight: 1.6,
};

const commentsList = {
  display: "grid",
  gap: 14,
};

const commentCard = {
  padding: "16px 18px",
  borderRadius: 20,
  border: "1px solid rgba(96,165,250,0.20)",
  background: "linear-gradient(180deg, rgba(15,23,42,0.52) 0%, rgba(20,43,84,0.54) 100%)",
  boxShadow: "0 14px 34px rgba(2,6,23,0.18)",
  display: "grid",
  gap: 12,
};

const reviewCard = {
  padding: "16px 18px",
  borderRadius: 20,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(15,23,42,0.42)",
  display: "grid",
  gap: 12,
};

const reviewStars = {
  color: "#facc15",
  fontWeight: 900,
  letterSpacing: 1,
  whiteSpace: "nowrap",
};

const reviewDate = {
  fontSize: 12,
  color: "#cbd5e1",
};

const reviewBody = {
  margin: 0,
  color: "rgba(226,232,240,0.82)",
  lineHeight: 1.75,
  whiteSpace: "pre-wrap",
};

const commentTopRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const commentTopIdentity = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const commentAuthorAvatarWrap = {
  width: 42,
  height: 42,
  borderRadius: 999,
  overflow: "hidden",
  flexShrink: 0,
};

const commentAuthorAvatarImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const commentAuthorAvatar = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
  color: "#1d4ed8",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  fontSize: 16,
  flexShrink: 0,
};

const commentActions = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
};

const commentActionButton = {
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(37,99,235,0.20)",
  color: "#bfdbfe",
  borderRadius: 999,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 800,
};

const commentDangerAction = {
  border: "1px solid rgba(251,113,133,0.18)",
  background: "rgba(255,241,242,0.98)",
  color: "#be123c",
  borderRadius: 999,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 800,
};

const commentDate = {
  fontSize: 12,
  color: "#93c5fd",
};

const commentBody = {
  margin: 0,
  color: "rgba(226,232,240,0.86)",
  lineHeight: 1.75,
  whiteSpace: "pre-wrap",
};

const feedbackAuthor = {
  color: "#eff6ff",
};

const commentSecondaryButton = {
  border: "1px solid rgba(96,165,250,0.20)",
  background: "rgba(15,23,42,0.38)",
  color: "#dbeafe",
  borderRadius: 14,
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: 800,
};

const replyComposer = {
  display: "grid",
  gap: 10,
  paddingTop: 4,
};

const replyList = {
  display: "grid",
  gap: 10,
  paddingTop: 6,
};

const replyCard = {
  padding: "14px 14px 12px 16px",
  borderRadius: 16,
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(8,18,36,0.52)",
  marginLeft: 26,
  display: "grid",
  gap: 10,
};

const reportActionButton = {
  border: "1px solid rgba(248,113,113,0.24)",
  background: "rgba(255,241,242,0.9)",
  color: "#be123c",
  borderRadius: 14,
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: 900,
};

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLong(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
}

function localDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatCommentDate(value) {
  return new Date(value).toLocaleString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function firstNameOf(value) {
  return normalizeFeedbackText(value).split(" ").filter(Boolean)[0] || "";
}

function normalizeFeedbackText(value) {
  return String(value || "").trim().toLocaleLowerCase("bg-BG");
}
