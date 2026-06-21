import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import { resolveBackendImage } from "../../lib/assets";
import {
  approveServiceAsAdmin,
  createAdminRestriction,
  createAdminCategory,
  deactivateAdminCategory,
  deleteServiceAsAdmin,
  hideCommentAsAdmin,
  hideReviewAsAdmin,
  listAdminBookings,
  listAdminBusinesses,
  listAdminCategories,
  listAdminClients,
  listAdminComments,
  listAdminReports,
  listAdminRestrictions,
  listAdminReviews,
  listAdminServices,
  rejectServiceAsAdmin,
  restoreCommentAsAdmin,
  restoreReviewAsAdmin,
  restoreAdminBusinessServices,
  updateAdminCategory,
  updateAdminBooking,
  updateAdminComment,
  updateAdminReport,
  updateAdminRestriction,
  updateAdminUser,
  updateAdminUserStatus,
  updateReviewAsAdmin,
  updateServiceAsAdmin,
} from "../business/services/api";

const tabs = [
  { id: "services", label: "Обяви" },
  { id: "bookings", label: "Резервации" },
  { id: "categories", label: "Категории" },
  { id: "reports", label: "Докладвания" },
  { id: "moderation", label: "Коментари и отзиви" },
  { id: "businesses", label: "Бизнес профили" },
  { id: "clients", label: "Клиентски профили" },
];

const emptyCategoryDraft = { name: "", description: "", active: true };
export default function AdminServicesPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [clients, setClients] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [focusedProfileId, setFocusedProfileId] = useState(null);

  const [serviceNotes, setServiceNotes] = useState({});
  const [commentReasons, setCommentReasons] = useState({});
  const [reportNotes, setReportNotes] = useState({});
  const [categoryDraft, setCategoryDraft] = useState(emptyCategoryDraft);
  const [categoryForms, setCategoryForms] = useState({});
  const [serviceForms, setServiceForms] = useState({});
  const [editingServiceIds, setEditingServiceIds] = useState({});
  const [profileForms, setProfileForms] = useState({});
  const [bookingForms, setBookingForms] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [reviewForms, setReviewForms] = useState({});
  const [clientRestrictionForms, setClientRestrictionForms] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [
        nextServices,
        nextBookings,
        nextCategories,
        nextReports,
        nextRestrictions,
        nextReviews,
        nextComments,
        nextBusinesses,
        nextClients,
      ] = await Promise.all([
        listAdminServices(),
        listAdminBookings(),
        listAdminCategories(),
        listAdminReports(),
        listAdminRestrictions(),
        listAdminReviews(),
        listAdminComments(),
        listAdminBusinesses(),
        listAdminClients(),
      ]);

      setServices(nextServices);
      setBookings(nextBookings);
      setCategories(nextCategories);
      setReports(nextReports);
      setRestrictions(nextRestrictions);
      setReviews(nextReviews);
      setComments(nextComments);
      setBusinesses(nextBusinesses);
      setClients(nextClients);
      setCategoryForms(
        Object.fromEntries(
          nextCategories.map((item) => [
            item.id,
            { name: item.name, description: item.description ?? "", active: item.active },
          ])
        )
      );
      setServiceForms(Object.fromEntries(nextServices.map((item) => [item.id, serviceToForm(item)])));
      setProfileForms(Object.fromEntries([...nextBusinesses, ...nextClients].map((item) => [item.userId, profileToForm(item)])));
      setBookingForms(Object.fromEntries(nextBookings.map((item) => [item.id, bookingToForm(item)])));
      setCommentForms(Object.fromEntries(nextComments.map((item) => [item.id, commentToForm(item)])));
      setReviewForms(Object.fromEntries(nextReviews.map((item) => [item.id, reviewToForm(item)])));
    } catch (loadError) {
      setError(loadError?.message || "Неуспешно зареждане на админ панела");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const tabMeta = useMemo(
    () => ({
      services: `${services.filter((item) => item.approvalStatus === "PENDING").length} чакат`,
      bookings: `${bookings.length} общо`,
      categories: `${categories.filter((item) => item.active).length} активни`,
      reports: `${reports.filter((item) => item.status !== "RESOLVED" && item.status !== "REJECTED").length} активни`,
      moderation: `${reviews.filter((item) => item.status !== "HIDDEN").length + comments.filter((item) => item.status !== "HIDDEN").length} видими`,
      businesses: `${businesses.length} профила`,
      clients: `${clients.length} профила`,
    }),
    [bookings, businesses, categories, clients, comments, reports, reviews, services]
  );

  const moderationItems = useMemo(
    () => [
      ...reviews.map((item) => ({
        ...item,
        moderationType: "review",
        moderationKey: `review-${item.id}`,
        title: item.serviceTitle,
        text: item.comment || "Няма текст към отзива.",
        meta: `От ${item.authorName} • Оценка ${item.rating}/5`,
        label: item.status === "HIDDEN" ? "Скрит отзив" : "Видим отзив",
        createdAt: item.createdAt,
      })),
      ...comments.map((item) => ({
        ...item,
        moderationType: "comment",
        moderationKey: `comment-${item.id}`,
        title: item.serviceTitle,
        text: item.text,
        meta: `От ${item.authorName}`,
        label: item.status === "HIDDEN" ? "Скрит коментар" : "Видим коментар",
        createdAt: item.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [reviews, comments]
  );

  async function onApproveService(service) {
    const note = (serviceNotes[service.id] ?? "").trim();
    if (!note) return alert("Добави кратка бележка при одобрението.");
    try {
      setBusyKey(`approve-${service.id}`);
      const next = await approveServiceAsAdmin(service.id, { note });
      setServices((current) => current.map((item) => (item.id === service.id ? next : item)));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onRejectService(service) {
    const note = (serviceNotes[service.id] ?? "").trim();
    if (!note) return alert("Добави причина за връщане.");
    try {
      setBusyKey(`reject-${service.id}`);
      const next = await rejectServiceAsAdmin(service.id, { note });
      setServices((current) => current.map((item) => (item.id === service.id ? next : item)));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onDeleteService(service) {
    const reason = (serviceNotes[service.id] ?? "").trim();
    if (!reason) return alert("Добави причина за сваляне.");
    try {
      setBusyKey(`delete-${service.id}`);
      await deleteServiceAsAdmin(service.id, { reason });
      setServices((current) => current.filter((item) => item.id !== service.id));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onUpdateService(service) {
    const form = serviceForms[service.id];
    if (!form?.title?.trim()) return alert("Името на обявата е задължително.");
    try {
      setBusyKey(`service-save-${service.id}`);
      const next = await updateServiceAsAdmin(service.id, {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        slotIntervalMinutes: Number(form.slotIntervalMinutes),
        bookingHorizonDays: Number(form.bookingHorizonDays),
      });
      setServices((current) => current.map((item) => (item.id === service.id ? next : item)));
      setServiceForms((current) => ({ ...current, [service.id]: serviceToForm(next) }));
      setEditingServiceIds((current) => ({ ...current, [service.id]: false }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onUpdateBooking(booking) {
    const form = bookingForms[booking.id];
    try {
      setBusyKey(`booking-save-${booking.id}`);
      const next = await updateAdminBooking(booking.id, {
        ...form,
        startAt: form.startAt ? `${form.startAt}:00` : null,
        endAt: form.endAt ? `${form.endAt}:00` : null,
      });
      setBookings((current) => current.map((item) => (item.id === booking.id ? next : item)));
      setBookingForms((current) => ({ ...current, [booking.id]: bookingToForm(next) }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onCreateCategory() {
    if (!categoryDraft.name.trim()) return alert("Добави име на категория.");
    try {
      setBusyKey("create-category");
      const created = await createAdminCategory(categoryDraft);
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name, "bg")));
      setCategoryForms((current) => ({
        ...current,
        [created.id]: { name: created.name, description: created.description ?? "", active: created.active },
      }));
      setCategoryDraft(emptyCategoryDraft);
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onUpdateCategory(categoryId) {
    try {
      setBusyKey(`category-save-${categoryId}`);
      const next = await updateAdminCategory(categoryId, categoryForms[categoryId]);
      setCategories((current) => current.map((item) => (item.id === categoryId ? next : item)));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onDeactivateCategory(categoryId) {
    try {
      setBusyKey(`category-deactivate-${categoryId}`);
      const next = await deactivateAdminCategory(categoryId);
      setCategories((current) => current.map((item) => (item.id === categoryId ? next : item)));
      setCategoryForms((current) => ({
        ...current,
        [categoryId]: { ...(current[categoryId] ?? {}), active: next.active },
      }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onHideComment(comment) {
    const reason = (commentReasons[comment.moderationKey ?? `comment-${comment.id}`] ?? "").trim();
    if (!reason) return alert("Добави причина за скриването.");
    try {
      setBusyKey(`comment-${comment.id}`);
      const next = await hideCommentAsAdmin(comment.id, { reason });
      setComments((current) => current.map((item) => (item.id === comment.id ? next : item)));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onUpdateComment(comment) {
    const form = commentForms[comment.id];
    if (!form?.text?.trim()) return alert("Текстът на коментара е задължителен.");
    try {
      setBusyKey(`comment-save-${comment.id}`);
      const next = await updateAdminComment(comment.id, form);
      setComments((current) => current.map((item) => (item.id === comment.id ? next : item)));
      setCommentForms((current) => ({ ...current, [comment.id]: commentToForm(next) }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onHideReview(review) {
    const reason = (commentReasons[review.moderationKey ?? `review-${review.id}`] ?? "").trim();
    if (!reason) return alert("Добави причина за скриването.");
    try {
      setBusyKey(`review-${review.id}`);
      const next = await hideReviewAsAdmin(review.id, { reason });
      setReviews((current) => current.map((item) => (item.id === review.id ? next : item)));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onUpdateReview(review) {
    const form = reviewForms[review.id];
    const rating = Number(form?.rating);
    if (!rating || rating < 1 || rating > 5) return alert("Оценката трябва да е между 1 и 5.");

    try {
      setBusyKey(`review-save-${review.id}`);
      const next = await updateReviewAsAdmin(review.id, {
        rating,
        comment: form.comment,
      });
      setReviews((current) => current.map((item) => (item.id === review.id ? next : item)));
      setReviewForms((current) => ({ ...current, [review.id]: reviewToForm(next) }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onRestoreComment(comment) {
    try {
      setBusyKey(`comment-${comment.id}`);
      const next = await restoreCommentAsAdmin(comment.id);
      setComments((current) => current.map((item) => (item.id === comment.id ? next : item)));
      setCommentReasons((current) => ({ ...current, [comment.moderationKey ?? `comment-${comment.id}`]: "" }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onRestoreReview(review) {
    try {
      setBusyKey(`review-${review.id}`);
      const next = await restoreReviewAsAdmin(review.id);
      setReviews((current) => current.map((item) => (item.id === review.id ? next : item)));
      setCommentReasons((current) => ({ ...current, [review.moderationKey ?? `review-${review.id}`]: "" }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onUpdateReport(report, status) {
    try {
      setBusyKey(`report-${report.id}-${status}`);
      const next = await updateAdminReport(report.id, { status, resolutionNote: reportNotes[report.id] ?? "" });
      setReports((current) => (
        status === "RESOLVED"
          ? current.filter((item) => item.id !== report.id)
          : current.map((item) => (item.id === report.id ? next : item))
      ));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onCreateClientRestriction(profile) {
    const form = clientRestrictionForms[profile.userId] || emptyClientRestrictionForm();
    if (!form.businessUserId || !form.serviceId || !form.reason.trim()) {
      return alert("Избери бизнес, обява и причина за ограничението.");
    }
    try {
      setBusyKey(`client-restriction-${profile.userId}`);
      const created = await createAdminRestriction({
        serviceId: Number(form.serviceId),
        clientUserId: profile.userId,
        reason: form.reason.trim(),
        active: true,
      });
      setRestrictions((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setClientRestrictionForms((current) => ({ ...current, [profile.userId]: emptyClientRestrictionForm() }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onDeactivateClientRestriction(restriction) {
    try {
      setBusyKey(`restriction-disable-${restriction.id}`);
      const next = await updateAdminRestriction(restriction.id, {
        serviceId: restriction.serviceId,
        clientUserId: restriction.clientUserId,
        reason: restriction.reason || "Ограничението е премахнато от администратор.",
        active: false,
      });
      setRestrictions((current) => current.map((item) => (item.id === restriction.id ? next : item)));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onToggleUser(profile) {
    const nextActive = !profile.active;
    let reason = "";
    if (!nextActive) {
      reason = window.prompt("Добави причина за деактивиране на профила")?.trim() || "";
      if (!reason) return;
    }
    try {
      setBusyKey(`user-${profile.userId}`);
      const next = await updateAdminUserStatus(profile.userId, { active: nextActive, reason: reason || null });
      if (profile.role === "BUSINESS") {
        setBusinesses((current) => current.map((item) => (item.userId === profile.userId ? next : item)));
      } else {
        setClients((current) => current.map((item) => (item.userId === profile.userId ? next : item)));
      }
      setProfileForms((current) => ({ ...current, [profile.userId]: profileToForm(next) }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onRestoreBusinessServices(profile) {
    try {
      setBusyKey(`restore-services-${profile.userId}`);
      const next = await restoreAdminBusinessServices(profile.userId);
      setBusinesses((current) => current.map((item) => (item.userId === profile.userId ? next : item)));
      setProfileForms((current) => ({ ...current, [profile.userId]: profileToForm(next) }));
      await load();
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  async function onUpdateProfile(profile) {
    const form = profileForms[profile.userId];
    if (!form?.username?.trim() || !form?.email?.trim()) return alert("Потребителско име и имейл са задължителни.");
    if (form.active === false && !form.banReason?.trim()) return alert("Причина за деактивиране е задължителна.");

    try {
      setBusyKey(`profile-save-${profile.userId}`);
      const next = await updateAdminUser(profile.userId, form);
      if (next.role === "BUSINESS") {
        setBusinesses((current) => current.some((item) => item.userId === next.userId)
          ? current.map((item) => (item.userId === next.userId ? next : item))
          : [next, ...current]);
        setClients((current) => current.filter((item) => item.userId !== next.userId));
      } else {
        setClients((current) => current.some((item) => item.userId === next.userId)
          ? current.map((item) => (item.userId === next.userId ? next : item))
          : [next, ...current]);
        setBusinesses((current) => current.filter((item) => item.userId !== next.userId));
      }
      setProfileForms((current) => ({ ...current, [next.userId]: profileToForm(next) }));
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  function openProfileFromReport(userId, role) {
    if (!userId) return;
    setFocusedProfileId(Number(userId));
    setActiveTab(role === "BUSINESS" ? "businesses" : "clients");
    window.setTimeout(() => {
      document.getElementById(`admin-profile-${userId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBackground }}>
      <Header categories={[]} recentSearches={[]} />
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "28px 16px 44px" }}>
        <div style={hero}>
          <div style={eyebrow}>Админ портал</div>
          <h1 style={heroTitle}>Управление на обяви, резервации, сигнали, категории и профили.</h1>
          <p style={heroText}>
            Администраторът вижда всички резервации в системата, следи сигналите, модерира коментари и отзиви, управлява категориите и има отделен преглед върху клиентските и бизнес акаунтите.
          </p>
        </div>

        {error ? <div style={errorBox}>{error}</div> : null}

        <div style={tabRow}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...tabButton,
                background: activeTab === tab.id ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "rgba(8,18,36,0.82)",
              }}
            >
              <span style={tabLabel}>{tab.label}</span>
              <small style={tabCount}>{tabMeta[tab.id]}</small>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={loadingCard}>Зареждане на админ портала…</div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {activeTab === "services" && services.map((service) => (
              <article key={service.id} style={panelCard}>
                <div style={serviceRow}>
                  <div style={serviceImageWrap}>
                    {service.coverImageUrl ? <img src={resolveBackendImage(service.coverImageUrl)} alt={service.title} style={serviceImage} /> : <div style={imagePlaceholder}>BookingHub</div>}
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(() => {
                      const isEditingService = Boolean(editingServiceIds[service.id]);
                      return (
                        <>
                    <div style={statusChip(service.approvalStatus)}>{labelForServiceStatus(service.approvalStatus, service.active)}</div>
                    <div style={cardTitle}>{service.title}</div>
                    <div style={mutedText}>{service.city} • €{service.price.toFixed(2)}</div>
                    {service.categorySuggestion ? (
                      <div style={subtlePanel}>
                        <strong style={{ color: "#bfdbfe" }}>Предложение за категория</strong>
                        <div style={bodyText}>{service.categorySuggestion}</div>
                      </div>
                    ) : null}
                    <div style={previewBodyText}>{service.description || "Няма описание."}</div>
                    <textarea
                      value={serviceNotes[service.id] ?? service.approvalNote ?? ""}
                      onChange={(event) => setServiceNotes((current) => ({ ...current, [service.id]: event.target.value }))}
                      placeholder="Бележка към бизнеса"
                      style={textarea}
                    />
                    {isEditingService ? (
                      <>
                        <div style={adminEditGrid}>
                          <input value={serviceForms[service.id]?.title ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], title: event.target.value } }))} placeholder="Име" style={input} />
                          <select value={serviceForms[service.id]?.categoryId ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], categoryId: event.target.value } }))} style={input}>
                            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                          </select>
                          <input value={serviceForms[service.id]?.city ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], city: event.target.value } }))} placeholder="Град" style={input} />
                          <input value={serviceForms[service.id]?.address ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], address: event.target.value } }))} placeholder="Адрес" style={input} />
                          <input type="number" value={serviceForms[service.id]?.price ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], price: event.target.value } }))} placeholder="Цена" style={input} />
                          <input type="number" value={serviceForms[service.id]?.durationMinutes ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], durationMinutes: event.target.value } }))} placeholder="Минути" style={input} />
                          <input value={serviceForms[service.id]?.opensAt ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], opensAt: event.target.value } }))} placeholder="Отваря" style={input} />
                          <input value={serviceForms[service.id]?.closesAt ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], closesAt: event.target.value } }))} placeholder="Затваря" style={input} />
                          <select value={serviceForms[service.id]?.approvalStatus ?? "PENDING"} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], approvalStatus: event.target.value } }))} style={input}>
                            <option value="PENDING">Чака одобрение</option>
                            <option value="APPROVED">Одобрена</option>
                            <option value="REJECTED">Върната</option>
                          </select>
                          <label style={checkboxRow}>
                            <input type="checkbox" checked={Boolean(serviceForms[service.id]?.active)} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], active: event.target.checked } }))} />
                            Активна
                          </label>
                        </div>
                        <textarea value={serviceForms[service.id]?.description ?? ""} onChange={(event) => setServiceForms((current) => ({ ...current, [service.id]: { ...current[service.id], description: event.target.value } }))} placeholder="Описание" style={textarea} />
                      </>
                    ) : null}
                    <div style={actions}>
                      {isEditingService ? (
                        <button type="button" onClick={() => onUpdateService(service)} style={primaryButton} disabled={busyKey === `service-save-${service.id}`}>Запази</button>
                      ) : (
                        <button type="button" onClick={() => setEditingServiceIds((current) => ({ ...current, [service.id]: true }))} style={secondaryButton}>Редактирай</button>
                      )}
                      <button type="button" onClick={() => onApproveService(service)} style={primaryButton} disabled={busyKey === `approve-${service.id}`}>Одобри</button>
                      <button type="button" onClick={() => onRejectService(service)} style={secondaryButton} disabled={busyKey === `reject-${service.id}`}>Върни</button>
                      <button type="button" onClick={() => onDeleteService(service)} style={dangerButton} disabled={busyKey === `delete-${service.id}`}>Изтрий</button>
                    </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </article>
            ))}

            {activeTab === "bookings" && bookings.map((booking) => (
              <article key={booking.id} style={panelCard}>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={statusChip(booking.status)}>{labelForBookingStatus(booking.status)}</div>
                  <div style={cardTitle}>{booking.serviceTitle}</div>
                  <div style={mutedText}>Бизнес: {booking.businessName} • Клиент: {booking.clientName}</div>
                  <div style={mutedText}>Ресурс: {booking.resourceName}</div>
                  <div style={mutedText}>Час: {formatDateRange(booking.startAt, booking.endAt)}</div>
                  <div style={mutedText}>Админ причина към статуса: {booking.statusReason || "—"}</div>
                  <div style={mutedText}>Бележка от клиента: {booking.clientNote || "—"}</div>
                  <div style={adminEditGrid}>
                    <select
                      value={bookingForms[booking.id]?.status ?? "PENDING"}
                      onChange={(event) => setBookingForms((current) => ({ ...current, [booking.id]: { ...current[booking.id], status: event.target.value } }))}
                      style={input}
                    >
                      <option value="PENDING">Изчакваща</option>
                      <option value="CONFIRMED">Потвърдена</option>
                      <option value="COMPLETED">Завършена</option>
                      <option value="REJECTED">Отказана</option>
                      <option value="CANCELED">Отменена</option>
                    </select>
                    <input
                      type="datetime-local"
                      value={bookingForms[booking.id]?.startAt ?? ""}
                      onChange={(event) => setBookingForms((current) => ({ ...current, [booking.id]: { ...current[booking.id], startAt: event.target.value } }))}
                      style={input}
                    />
                    <input
                      type="datetime-local"
                      value={bookingForms[booking.id]?.endAt ?? ""}
                      onChange={(event) => setBookingForms((current) => ({ ...current, [booking.id]: { ...current[booking.id], endAt: event.target.value } }))}
                      style={input}
                    />
                  </div>
                  <textarea
                    value={bookingForms[booking.id]?.statusReason ?? ""}
                    onChange={(event) => setBookingForms((current) => ({ ...current, [booking.id]: { ...current[booking.id], statusReason: event.target.value } }))}
                    placeholder="Админът попълва причина към статуса, например защо е отказана или отменена"
                    style={textarea}
                  />
                  <textarea
                    value={bookingForms[booking.id]?.clientNote ?? ""}
                    onChange={(event) => setBookingForms((current) => ({ ...current, [booking.id]: { ...current[booking.id], clientNote: event.target.value } }))}
                    placeholder="Бележка от клиента"
                    style={textarea}
                  />
                  <div style={actions}>
                    <button type="button" onClick={() => onUpdateBooking(booking)} style={primaryButton} disabled={busyKey === `booking-save-${booking.id}`}>
                      Запази резервацията
                    </button>
                    <button type="button" onClick={() => setBookings((current) => current.filter((item) => item.id !== booking.id))} style={dangerButton}>
                      Изтрий
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {activeTab === "categories" && (
              <div style={{ display: "grid", gap: 16 }}>
                <article style={panelCard}>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={cardTitle}>Създай нова категория</div>
                    <input value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Име на категория" style={input} />
                    <textarea value={categoryDraft.description} onChange={(event) => setCategoryDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Описание" style={textarea} />
                    <label style={checkboxRow}>
                      <input type="checkbox" checked={categoryDraft.active} onChange={(event) => setCategoryDraft((current) => ({ ...current, active: event.target.checked }))} />
                      Активна категория
                    </label>
                    <div style={actions}>
                      <button type="button" onClick={onCreateCategory} style={primaryButton} disabled={busyKey === "create-category"}>Добави категория</button>
                    </div>
                  </div>
                </article>

                {categories.map((category) => (
                  <article key={category.id} style={panelCard}>
                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={statusChip(category.active ? "ACTIVE" : "INACTIVE")}>{category.active ? "Активна" : "Неактивна"}</div>
                      <input
                        value={categoryForms[category.id]?.name ?? ""}
                        onChange={(event) => setCategoryForms((current) => ({ ...current, [category.id]: { ...current[category.id], name: event.target.value } }))}
                        style={input}
                      />
                      <textarea
                        value={categoryForms[category.id]?.description ?? ""}
                        onChange={(event) => setCategoryForms((current) => ({ ...current, [category.id]: { ...current[category.id], description: event.target.value } }))}
                        style={textarea}
                      />
                      <label style={checkboxRow}>
                        <input
                          type="checkbox"
                          checked={Boolean(categoryForms[category.id]?.active)}
                          onChange={(event) => setCategoryForms((current) => ({ ...current, [category.id]: { ...current[category.id], active: event.target.checked } }))}
                        />
                        Активна
                      </label>
                      <div style={actions}>
                        <button type="button" onClick={() => onUpdateCategory(category.id)} style={primaryButton} disabled={busyKey === `category-save-${category.id}`}>Запази</button>
                        <button type="button" onClick={() => onDeactivateCategory(category.id)} style={dangerButton} disabled={busyKey === `category-deactivate-${category.id}` || !category.active}>Деактивирай</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === "reports" && (
              <div style={moderationList}>
                {reports.map((report) => {
                  const primaryDetail = detailForReportTarget(report);
                  const reviewServiceId = report.targetType === "REVIEW" ? findReviewServiceId(report, reviews) : null;
                  const linkedServiceId = report.serviceId || reviewServiceId;
                  const reportServiceLabel = report.serviceLabel || (report.targetType === "REVIEW" ? findReviewServiceLabel(report, reviews) : null);
                  const listingProfile = [report.serviceLabel, report.businessLabel].filter(Boolean).join(" / ");

                  return (
                    <article key={report.id} style={reportCard}>
                      <div style={reportContent}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <div style={statusChip(report.status)}>{labelForReportStatus(report.status)}</div>
                          <div style={reportTypePill}>{labelForTargetType(report.targetType)}</div>
                        </div>
                        <div style={cardTitle}>{primaryDetail.title}</div>
                        <div style={reportInfoGrid}>
                          <ReportField label={primaryDetail.label} value={reportServiceLabel || primaryDetail.value} boxed={primaryDetail.boxed} />
                          {report.targetType === "REVIEW" && report.targetText ? (
                            <ReportField label="Текст на отзива" value={`„${report.targetText}“`} boxed />
                          ) : null}
                          {listingProfile ? <ReportField label="Профил на обявата" value={listingProfile} /> : null}
                          <ReportField label="Докладвано от" value={report.reporterName} />
                          <ReportField label="Причина за докладване" value={report.reasonText || "—"} boxed />
                          <ReportField label="Дата на докладване" value={formatDate(report.createdAt)} />
                          <div style={reportLinkRow}>
                            {report.targetType === "USER" ? (
                              <button type="button" style={miniActionButton} onClick={() => openProfileFromReport(report.targetId, report.targetUserRole)}>
                                Виж докладвания профил
                              </button>
                            ) : null}
                            <button type="button" style={miniActionButton} onClick={() => openProfileFromReport(report.reporterUserId, report.reporterRole)}>
                              Виж подателя
                            </button>
                            {report.targetType === "REVIEW" && linkedServiceId ? (
                              <a href={`/services/${linkedServiceId}#reviews`} target="_blank" rel="noreferrer" style={miniActionLink}>
                                Виж отзива
                              </a>
                            ) : null}
                            {report.businessUserId ? (
                              <button type="button" style={miniActionButton} onClick={() => openProfileFromReport(report.businessUserId, "BUSINESS")}>
                                Виж бизнес профила
                              </button>
                            ) : null}
                            {linkedServiceId ? (
                              <a href={`/services/${linkedServiceId}`} target="_blank" rel="noreferrer" style={miniActionLink}>
                                Отвори обявата
                              </a>
                            ) : null}
                          </div>
                        </div>
                        <textarea
                          value={reportNotes[report.id] ?? report.resolutionNote ?? ""}
                          onChange={(event) => setReportNotes((current) => ({ ...current, [report.id]: event.target.value }))}
                          placeholder="Бележка по сигнала"
                          style={textarea}
                        />
                      </div>
                      <div style={reportActions}>
                        <button type="button" onClick={() => onUpdateReport(report, "IN_REVIEW")} style={secondaryButton} disabled={busyKey === `report-${report.id}-IN_REVIEW`}>В преглед</button>
                        <button type="button" onClick={() => onUpdateReport(report, "RESOLVED")} style={primaryButton} disabled={busyKey === `report-${report.id}-RESOLVED`}>Решен</button>
                        <button type="button" onClick={() => onUpdateReport(report, "REJECTED")} style={dangerButton} disabled={busyKey === `report-${report.id}-REJECTED`}>Отхвърли</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {activeTab === "moderation" && (
              <div style={moderationList}>
                {moderationItems.map((item) => (
                  <article key={item.moderationKey} style={reportCard}>
                    <div style={reportContent}>
                      <div style={statusChip(item.status)}>{item.label}</div>
                      <div style={cardTitle}>{item.title}</div>
                      <div style={reportTextBox}>
                        <strong style={{ color: "#dbeafe" }}>{item.moderationType === "review" ? "Текст на отзива:" : "Текст на коментара:"}</strong>
                        <div style={bodyText}>{item.text}</div>
                      </div>
                      {item.moderationType === "comment" ? (
                        <>
                          <textarea
                            value={commentForms[item.id]?.text ?? item.text ?? ""}
                            onChange={(event) => setCommentForms((current) => ({ ...current, [item.id]: { ...current[item.id], text: event.target.value } }))}
                            placeholder="Редактирай текста на коментара"
                            style={textarea}
                          />
                        </>
                      ) : null}
                      {item.moderationType === "review" ? (
                        <>
                          <label style={fieldLabel}>
                            Оценка на отзива
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={reviewForms[item.id]?.rating ?? item.rating ?? 5}
                              onChange={(event) => setReviewForms((current) => ({ ...current, [item.id]: { ...current[item.id], rating: event.target.value } }))}
                              placeholder="Оценка от 1 до 5"
                              style={{ ...input, marginTop: 6 }}
                            />
                          </label>
                          <textarea
                            value={reviewForms[item.id]?.comment ?? item.comment ?? ""}
                            onChange={(event) => setReviewForms((current) => ({ ...current, [item.id]: { ...current[item.id], comment: event.target.value } }))}
                            placeholder="Редактирай текста на отзива"
                            style={textarea}
                          />
                        </>
                      ) : null}
                      <div style={mutedText}>{item.meta}</div>
                      <div style={mutedText}>Дата: {formatDateTime(item.createdAt)}</div>
                      <textarea
                        value={commentReasons[item.moderationKey] ?? item.adminModerationReason ?? ""}
                        onChange={(event) => setCommentReasons((current) => ({ ...current, [item.moderationKey]: event.target.value }))}
                        placeholder="Причина за скриване"
                        style={textarea}
                      />
                    </div>
                    <div style={reportActions}>
                      {item.moderationType === "comment" ? (
                        <button
                          type="button"
                          onClick={() => onUpdateComment(item)}
                          style={primaryButton}
                          disabled={busyKey === `comment-save-${item.id}`}
                        >
                          Запази коментара
                        </button>
                      ) : null}
                      {item.moderationType === "review" ? (
                        <button
                          type="button"
                          onClick={() => onUpdateReview(item)}
                          style={primaryButton}
                          disabled={busyKey === `review-save-${item.id}`}
                        >
                          Запази отзива
                        </button>
                      ) : null}
                      {item.status === "HIDDEN" ? (
                        <button
                          type="button"
                          onClick={() => (item.moderationType === "review" ? onRestoreReview(item) : onRestoreComment(item))}
                          style={primaryButton}
                          disabled={busyKey === `${item.moderationType}-${item.id}`}
                        >
                          Възстанови
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => (item.moderationType === "review" ? onHideReview(item) : onHideComment(item))}
                          style={dangerButton}
                          disabled={busyKey === `${item.moderationType}-${item.id}`}
                        >
                          Скрий
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === "businesses" && (
              <div style={profileGrid}>
                {businesses.map((profile) => (
                  <article
                    key={profile.userId}
                    id={`admin-profile-${profile.userId}`}
                    style={{
                      ...profileCard,
                      ...(focusedProfileId === Number(profile.userId) ? focusedProfileCard : {}),
                    }}
                  >
                    <ProfileHeader profile={profile} />
                    <div style={profileMeta}>Потребител: {profile.username}</div>
                    <div style={profileMeta}>Град: {profile.city || "—"}</div>
                    <div style={profileMeta}>Адрес: {profile.address || "—"}</div>
                    <div style={profileMeta}>Телефон: {profile.phone || "—"}</div>
                    <div style={profileMeta}>Обяви: {profile.listingCount}</div>
                    <div style={profileMeta}>Регистриран: {formatDateTime(profile.createdAt)}</div>
                    <div style={profileMeta}>Последно влизане: {formatDateTime(profile.lastLoginAt)}</div>
                    <AdminProfileForm profile={profile} form={profileForms[profile.userId]} setProfileForms={setProfileForms} onSave={() => onUpdateProfile(profile)} busy={busyKey === `profile-save-${profile.userId}`} />
                    {!profile.active && profile.banReason ? <div style={banBox}>Причина за деактивиране: {profile.banReason}</div> : null}
                    <button type="button" onClick={() => onToggleUser(profile)} style={profile.active ? dangerButton : primaryButton} disabled={busyKey === `user-${profile.userId}`}>
                      {profile.active ? "Деактивирай" : "Активирай"}
                    </button>
                    {profile.active ? (
                      <button
                        type="button"
                        onClick={() => onRestoreBusinessServices(profile)}
                        style={secondaryButton}
                        disabled={busyKey === `restore-services-${profile.userId}`}
                      >
                        Възстанови одобрените обяви
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}

            {activeTab === "clients" && (
              <div style={profileGrid}>
                {clients.map((profile) => {
                  const restrictionForm = clientRestrictionForms[profile.userId] || emptyClientRestrictionForm();
                  const businessServices = restrictionForm.businessUserId
                    ? services.filter((service) => Number(service.businessUserId) === Number(restrictionForm.businessUserId))
                    : [];
                  const activeRestrictions = restrictions.filter((restriction) => (
                    restriction.active && Number(restriction.clientUserId) === Number(profile.userId)
                  ));

                  return (
                    <article
                      key={profile.userId}
                      id={`admin-profile-${profile.userId}`}
                      style={{
                        ...profileCard,
                        ...(focusedProfileId === Number(profile.userId) ? focusedProfileCard : {}),
                      }}
                    >
                      <ProfileHeader profile={profile} />
                      <div style={profileMeta}>Потребител: {profile.username}</div>
                      <div style={profileMeta}>Телефон: {profile.phone || "—"}</div>
                      <div style={profileMeta}>Регистриран: {formatDateTime(profile.createdAt)}</div>
                      <div style={profileMeta}>Последно влизане: {formatDateTime(profile.lastLoginAt)}</div>
                      <div style={profileMeta}>Биография: {profile.bio || "Няма добавена биография."}</div>
                      <AdminProfileForm profile={profile} form={profileForms[profile.userId]} setProfileForms={setProfileForms} onSave={() => onUpdateProfile(profile)} busy={busyKey === `profile-save-${profile.userId}`} />
                      {!profile.active && profile.banReason ? <div style={banBox}>Причина за деактивиране: {profile.banReason}</div> : null}
                      <button type="button" onClick={() => onToggleUser(profile)} style={profile.active ? dangerButton : primaryButton} disabled={busyKey === `user-${profile.userId}`}>
                        {profile.active ? "Деактивирай" : "Активирай"}
                      </button>

                      <div style={restrictionInlinePanel}>
                        <div style={{ fontWeight: 900, color: "#dbeafe" }}>Ограничи за конкретна обява</div>
                        <div style={adminEditGrid}>
                          <select
                            value={restrictionForm.businessUserId}
                            onChange={(event) => setClientRestrictionForms((current) => ({
                              ...current,
                              [profile.userId]: {
                                ...restrictionForm,
                                businessUserId: event.target.value,
                                serviceId: "",
                              },
                            }))}
                            style={input}
                          >
                            <option value="">Избери бизнес</option>
                            {businesses.map((business) => (
                              <option key={business.userId} value={business.userId}>{business.displayName} · {business.email}</option>
                            ))}
                          </select>
                          <select
                            value={restrictionForm.serviceId}
                            onChange={(event) => setClientRestrictionForms((current) => ({
                              ...current,
                              [profile.userId]: { ...restrictionForm, serviceId: event.target.value },
                            }))}
                            style={input}
                            disabled={!restrictionForm.businessUserId}
                          >
                            <option value="">{restrictionForm.businessUserId ? "Избери обява" : "Първо избери бизнес"}</option>
                            {businessServices.map((service) => (
                              <option key={service.id} value={service.id}>{service.title}</option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          value={restrictionForm.reason}
                          onChange={(event) => setClientRestrictionForms((current) => ({
                            ...current,
                            [profile.userId]: { ...restrictionForm, reason: event.target.value },
                          }))}
                          placeholder="Причина, която клиентът ще вижда при опит за резервация"
                          style={textarea}
                        />
                        {activeRestrictions.length ? (
                          <div style={restrictionList}>
                            {activeRestrictions.map((restriction) => (
                              <div key={restriction.id} style={restrictionListItem}>
                                <div>
                                  <div style={{ color: "#dbeafe", fontWeight: 900 }}>{restriction.serviceTitle}</div>
                                  <div style={mutedText}>{restriction.reason || "Няма добавена причина."}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onDeactivateClientRestriction(restriction)}
                                  title="Премахни ограничението"
                                  aria-label="Премахни ограничението"
                                  style={iconDangerButton}
                                  disabled={busyKey === `restriction-disable-${restriction.id}`}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <div style={actions}>
                          <button
                            type="button"
                            onClick={() => onCreateClientRestriction(profile)}
                            style={secondaryButton}
                            disabled={busyKey === `client-restriction-${profile.userId}`}
                          >
                            Ограничи за обявата
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileHeader({ profile }) {
  return (
    <div style={profileHeader}>
      {profile.photoUrl ? (
        <img src={resolveBackendImage(profile.photoUrl)} alt={profile.displayName} style={avatar} />
      ) : (
        <div style={avatarFallback}>{initialsOf(profile.displayName)}</div>
      )}
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#eff6ff" }}>{profile.displayName}</div>
        <div style={{ color: "rgba(191,219,254,0.78)" }}>{profile.email}</div>
        <div style={{ color: profile.active ? "#86efac" : "#fda4af", fontWeight: 700 }}>{profile.active ? "Активен профил" : "Деактивиран профил"}</div>
      </div>
    </div>
  );
}

function AdminProfileForm({ profile, form, setProfileForms, onSave, busy }) {
  if (!form) return null;
  const update = (patch) => {
    setProfileForms((current) => ({ ...current, [profile.userId]: { ...current[profile.userId], ...patch } }));
  };

  return (
    <div style={adminProfileForm}>
      <div style={adminEditGrid}>
        <input value={form.username} onChange={(event) => update({ username: event.target.value })} placeholder="Потребителско име" style={input} />
        <input value={form.email} onChange={(event) => update({ email: event.target.value })} placeholder="Имейл" style={input} />
        <select value={form.role} onChange={(event) => update({ role: event.target.value })} style={input}>
          <option value="CLIENT">Клиент</option>
          <option value="BUSINESS">Бизнес</option>
          <option value="ADMIN">Админ</option>
        </select>
        <input value={form.phone} onChange={(event) => update({ phone: event.target.value })} placeholder="Телефон" style={input} />
      </div>

      {form.role === "BUSINESS" ? (
        <>
          <div style={adminEditGrid}>
            <input value={form.businessName} onChange={(event) => update({ businessName: event.target.value })} placeholder="Име на бизнес" style={input} />
            <select value={form.providerType} onChange={(event) => update({ providerType: event.target.value })} style={input}>
              <option value="INDIVIDUAL">Физическо лице</option>
              <option value="COMPANY">Фирма</option>
            </select>
            <input value={form.city} onChange={(event) => update({ city: event.target.value })} placeholder="Град" style={input} />
            <input value={form.address} onChange={(event) => update({ address: event.target.value })} placeholder="Адрес" style={input} />
            <input value={form.companyLegalName} onChange={(event) => update({ companyLegalName: event.target.value })} placeholder="Име на фирма" style={input} />
            <input value={form.companyEik} onChange={(event) => update({ companyEik: event.target.value })} placeholder="ЕИК" style={input} />
            <input value={form.companyRepresentative} onChange={(event) => update({ companyRepresentative: event.target.value })} placeholder="МОЛ" style={input} />
          </div>
          <textarea value={form.description} onChange={(event) => update({ description: event.target.value })} placeholder="Описание на бизнеса" style={textarea} />
        </>
      ) : (
        <>
          <div style={adminEditGrid}>
            <input value={form.firstName} onChange={(event) => update({ firstName: event.target.value })} placeholder="Име" style={input} />
            <input value={form.lastName} onChange={(event) => update({ lastName: event.target.value })} placeholder="Фамилия" style={input} />
          </div>
          <textarea value={form.bio} onChange={(event) => update({ bio: event.target.value })} placeholder="Биография" style={textarea} />
        </>
      )}

      <label style={checkboxRow}>
        <input type="checkbox" checked={Boolean(form.active)} onChange={(event) => update({ active: event.target.checked })} />
        Активен профил
      </label>
      {!form.active ? (
        <textarea value={form.banReason} onChange={(event) => update({ banReason: event.target.value })} placeholder="Причина за деактивиране" style={textarea} />
      ) : null}
      <button type="button" onClick={onSave} style={primaryButton} disabled={busy}>
        {busy ? "Запазване..." : "Запази профила"}
      </button>
    </div>
  );
}

function serviceToForm(service) {
  return {
    categoryId: service.categoryId ?? "",
    categorySuggestion: service.categorySuggestion ?? "",
    title: service.title ?? "",
    description: service.description ?? "",
    city: service.city ?? "",
    address: service.address ?? "",
    price: service.price ?? 0,
    durationMinutes: service.durationMinutes ?? 30,
    active: Boolean(service.active),
    approvalStatus: service.approvalStatus ?? "PENDING",
    approvalNote: service.approvalNote ?? "",
    opensAt: service.opensAt ?? "",
    closesAt: service.closesAt ?? "",
    slotIntervalMinutes: service.slotIntervalMinutes ?? 30,
    bookingHorizonDays: service.bookingHorizonDays ?? 90,
  };
}

function profileToForm(profile) {
  const parts = String(profile.displayName || "").split(/\s+/);
  return {
    username: profile.username ?? "",
    email: profile.email ?? "",
    role: profile.role ?? "CLIENT",
    active: Boolean(profile.active),
    banReason: profile.banReason ?? "",
    firstName: profile.role === "CLIENT" ? parts[0] || "" : "",
    lastName: profile.role === "CLIENT" ? parts.slice(1).join(" ") : "",
    bio: profile.bio ?? "",
    providerType: "INDIVIDUAL",
    businessName: profile.role === "BUSINESS" ? profile.displayName ?? "" : "",
    companyLegalName: "",
    companyEik: "",
    companyRepresentative: "",
    city: profile.city ?? "",
    address: profile.address ?? "",
    phone: profile.phone ?? "",
    photoUrl: profile.photoUrl ?? "",
    description: "",
  };
}

function bookingToForm(booking) {
  return {
    status: booking.status ?? "PENDING",
    statusReason: booking.statusReason ?? "",
    clientNote: booking.clientNote ?? "",
    startAt: toDateTimeInputValue(booking.startAt),
    endAt: toDateTimeInputValue(booking.endAt),
  };
}

function commentToForm(comment) {
  return {
    text: comment.text ?? "",
    adminModerationReason: comment.adminModerationReason ?? "",
  };
}

function reviewToForm(review) {
  return {
    rating: review.rating ?? 5,
    comment: review.comment ?? "",
  };
}

function emptyClientRestrictionForm() {
  return {
    businessUserId: "",
    serviceId: "",
    reason: "",
  };
}

function toDateTimeInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 16);
}

function ReportField({ label, value, boxed = false }) {
  return (
    <div style={boxed ? reportTextBox : reportField}>
      <div style={reportFieldLabel}>{label}:</div>
      <div style={boxed ? bodyText : reportFieldValue}>{value || "—"}</div>
    </div>
  );
}

function detailForReportTarget(report) {
  if (report.targetType === "REVIEW") {
    return {
      title: "Докладван отзив",
      label: "Докладван отзив за обява",
      value: report.serviceLabel || report.targetLabel,
      boxed: false,
    };
  }
  if (report.targetType === "COMMENT") {
    return {
      title: "Докладван коментар",
      label: "Докладван коментар",
      value: report.targetText ? `„${report.targetText}“` : report.targetLabel,
      boxed: true,
    };
  }
  if (report.targetType === "SERVICE") {
    return {
      title: "Докладвана обява",
      label: "Докладвана обява",
      value: report.targetLabel,
      boxed: false,
    };
  }
  return {
    title: "Докладван профил",
    label: "Докладван профил",
    value: report.targetLabel,
    boxed: false,
  };
}

function findReviewServiceLabel(report, reviews) {
  const review = reviews.find((item) => Number(item.id) === Number(report.targetId));
  return review?.serviceTitle || null;
}

function findReviewServiceId(report, reviews) {
  const review = reviews.find((item) => Number(item.id) === Number(report.targetId));
  return review?.serviceId || null;
}

function labelForServiceStatus(status, active) {
  if (!active && status === "REJECTED") return "Свалена или върната обява";
  if (status === "APPROVED") return "Одобрена обява";
  if (status === "REJECTED") return "Върната за корекция";
  return "Чака одобрение";
}

function labelForBookingStatus(status) {
  if (status === "CONFIRMED") return "Потвърдена";
  if (status === "REJECTED") return "Отказана";
  if (status === "CANCELED") return "Отменена";
  if (status === "COMPLETED") return "Завършена";
  return "Чака потвърждение";
}

function labelForReportStatus(status) {
  if (status === "IN_REVIEW") return "В преглед";
  if (status === "RESOLVED") return "Решен";
  if (status === "REJECTED") return "Отхвърлен";
  return "Отворен";
}

function labelForTargetType(type) {
  if (type === "USER") return "Профил";
  if (type === "SERVICE") return "Обява";
  if (type === "REVIEW") return "Отзив";
  if (type === "COMMENT") return "Коментар";
  return "Сигнал";
}

function formatDateRange(startAt, endAt) {
  if (!startAt) return "—";
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  return `${start.toLocaleDateString("bg-BG")} ${start.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })}${end ? ` - ${end.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })}` : ""}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function initialsOf(value) {
  return String(value || "BH")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || "")
    .join("");
}

const pageBackground = "radial-gradient(circle at top, rgba(59,130,246,0.2), rgba(2,6,23,0) 34%), linear-gradient(180deg, #081120 0%, #0f172a 42%, #101a32 100%)";
const hero = { display: "grid", gap: 10, padding: "26px 28px", borderRadius: 28, background: "linear-gradient(135deg, rgba(10,20,40,0.96), rgba(17,24,39,0.88))", border: "1px solid rgba(96,165,250,0.18)", boxShadow: "0 24px 60px rgba(2,6,23,0.24)" };
const eyebrow = { fontSize: 12, fontWeight: 900, letterSpacing: "0.24em", textTransform: "uppercase", color: "#60a5fa" };
const heroTitle = { margin: 0, fontSize: 34, color: "#eff6ff", lineHeight: 1.05 };
const heroText = { margin: 0, color: "rgba(226,232,240,0.82)", maxWidth: 920, lineHeight: 1.65 };
const errorBox = { marginTop: 16, padding: "14px 16px", borderRadius: 18, background: "rgba(127,29,29,0.18)", border: "1px solid rgba(248,113,113,0.22)", color: "#fecaca" };
const tabRow = { display: "flex", gap: 10, flexWrap: "nowrap", marginTop: 18, marginBottom: 18 };
const tabButton = { border: "1px solid rgba(96,165,250,0.18)", color: "#fff", borderRadius: 16, padding: "12px 16px", cursor: "pointer", display: "grid", gap: 4, minWidth: 126, textAlign: "center", alignContent: "center", whiteSpace: "nowrap" };
const tabLabel = { lineHeight: 1.18 };
const tabCount = { opacity: 0.8, lineHeight: 1.18 };
const loadingCard = { padding: 24, borderRadius: 22, background: "rgba(10,20,40,0.84)", color: "#dbeafe", border: "1px solid rgba(96,165,250,0.16)" };
const panelCard = { padding: 18, borderRadius: 24, background: "linear-gradient(180deg, rgba(10,20,40,0.92), rgba(15,23,42,0.86))", border: "1px solid rgba(96,165,250,0.16)", boxShadow: "0 18px 46px rgba(2,6,23,0.18)" };
const moderationList = { display: "grid", gap: 14 };
const reportCard = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 180px",
  gap: 18,
  padding: 18,
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(10,20,40,0.94), rgba(15,23,42,0.88))",
  border: "1px solid rgba(148,163,184,0.22)",
  boxShadow: "0 18px 46px rgba(2,6,23,0.18)",
};
const reportContent = { display: "grid", gap: 10, minWidth: 0 };
const reportActions = { display: "flex", flexDirection: "column", gap: 10, alignSelf: "start" };
const reportInfoGrid = { display: "grid", gap: 10 };
const reportField = {
  display: "grid",
  gridTemplateColumns: "220px minmax(0, 1fr)",
  gap: 16,
  alignItems: "start",
  minHeight: 28,
  color: "rgba(226,232,240,0.82)",
};
const reportFieldLabel = { color: "rgba(191,219,254,0.82)", fontWeight: 600, lineHeight: 1.55 };
const reportFieldValue = { color: "#eff6ff", lineHeight: 1.55, fontWeight: 900 };
const reportLinkRow = { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" };
const miniActionButton = {
  border: "1px solid rgba(96,165,250,0.22)",
  borderRadius: 12,
  padding: "9px 12px",
  color: "#dbeafe",
  background: "rgba(37,99,235,0.16)",
  cursor: "pointer",
  fontWeight: 800,
  fontFamily: "inherit",
  fontSize: 14,
  lineHeight: 1.2,
};
const miniActionLink = {
  ...miniActionButton,
  display: "inline-flex",
  textDecoration: "none",
  alignItems: "center",
  boxSizing: "border-box",
};
const reportTextBox = {
  display: "grid",
  gap: 6,
  padding: "12px 14px",
  borderRadius: 16,
  background: "rgba(226,232,240,0.08)",
  border: "1px solid rgba(96,165,250,0.14)",
};
const reportTypePill = {
  width: "fit-content",
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(37,99,235,0.18)",
  color: "#bfdbfe",
  border: "1px solid rgba(96,165,250,0.2)",
  fontSize: 12,
  fontWeight: 900,
};
const serviceRow = { display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 22, alignItems: "start" };
const serviceImageWrap = { minHeight: 160, borderRadius: 20, overflow: "hidden", background: "rgba(15,23,42,0.72)", border: "1px solid rgba(148,163,184,0.16)" };
const serviceImage = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const imagePlaceholder = { minHeight: 160, display: "grid", placeItems: "center", color: "rgba(191,219,254,0.65)", fontWeight: 900 };
const cardTitle = { fontSize: 22, fontWeight: 900, color: "#eff6ff" };
const mutedText = { color: "rgba(191,219,254,0.8)", lineHeight: 1.55 };
const bodyText = { color: "rgba(226,232,240,0.82)", lineHeight: 1.65 };
const previewBodyText = {
  color: "rgba(226,232,240,0.82)",
  lineHeight: 1.65,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const textarea = { width: "100%", minHeight: 96, borderRadius: 16, border: "1px solid rgba(96,165,250,0.16)", background: "rgba(15,23,42,0.78)", color: "#eff6ff", padding: 12, resize: "vertical", boxSizing: "border-box" };
const input = { width: "100%", borderRadius: 14, border: "1px solid rgba(96,165,250,0.16)", background: "rgba(15,23,42,0.78)", color: "#eff6ff", padding: "12px 14px", boxSizing: "border-box" };
const fieldLabel = { display: "grid", gap: 2, color: "#bfdbfe", fontSize: 13, fontWeight: 900 };
const actions = { display: "flex", gap: 10, flexWrap: "wrap" };
const primaryButton = { border: "none", borderRadius: 14, padding: "12px 16px", color: "#fff", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", cursor: "pointer", fontWeight: 800 };
const secondaryButton = { border: "1px solid rgba(96,165,250,0.18)", borderRadius: 14, padding: "12px 16px", color: "#dbeafe", background: "rgba(15,23,42,0.82)", cursor: "pointer", fontWeight: 800 };
const dangerButton = { border: "1px solid rgba(248,113,113,0.24)", borderRadius: 14, padding: "12px 16px", color: "#fee2e2", background: "rgba(127,29,29,0.22)", cursor: "pointer", fontWeight: 800 };
const iconDangerButton = { width: 34, height: 34, display: "grid", placeItems: "center", border: "1px solid rgba(248,113,113,0.26)", borderRadius: 10, color: "#fecaca", background: "rgba(127,29,29,0.2)", cursor: "pointer", fontSize: 22, fontWeight: 900, lineHeight: 1 };
const checkboxRow = { display: "flex", gap: 10, alignItems: "center", color: "#dbeafe" };
const subtlePanel = { padding: 14, borderRadius: 16, background: "rgba(15,23,42,0.66)", border: "1px solid rgba(96,165,250,0.12)" };
const restrictionInlinePanel = { display: "grid", gap: 10, padding: 14, borderRadius: 16, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.22)" };
const restrictionList = { display: "grid", gap: 8 };
const restrictionListItem = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "center", padding: 10, borderRadius: 14, background: "rgba(15,23,42,0.58)", border: "1px solid rgba(251,191,36,0.16)" };
const profileGrid = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 };
const profileCard = { padding: 18, borderRadius: 22, background: "linear-gradient(180deg, rgba(10,20,40,0.92), rgba(15,23,42,0.86))", border: "1px solid rgba(96,165,250,0.16)", display: "grid", gap: 10 };
const focusedProfileCard = { border: "1px solid rgba(250,204,21,0.75)", boxShadow: "0 0 0 4px rgba(250,204,21,0.14), 0 20px 52px rgba(2,6,23,0.28)" };
const profileHeader = { display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: 12, alignItems: "center" };
const avatar = { width: 72, height: 72, borderRadius: 999, objectFit: "cover", border: "2px solid rgba(96,165,250,0.22)" };
const avatarFallback = { width: 72, height: 72, borderRadius: 999, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(37,99,235,0.86), rgba(29,78,216,0.64))", color: "#eff6ff", fontWeight: 900, fontSize: 22 };
const profileMeta = { color: "rgba(226,232,240,0.82)", lineHeight: 1.55 };
const adminEditGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 };
const adminProfileForm = { display: "grid", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(96,165,250,0.14)" };
const banBox = { padding: 12, borderRadius: 14, background: "rgba(127,29,29,0.22)", color: "#fecaca", border: "1px solid rgba(248,113,113,0.24)", lineHeight: 1.45 };

function statusChip(status) {
  const palette = {
    APPROVED: { background: "rgba(22,163,74,0.18)", color: "#bbf7d0", border: "1px solid rgba(74,222,128,0.2)" },
    ACTIVE: { background: "rgba(22,163,74,0.18)", color: "#bbf7d0", border: "1px solid rgba(74,222,128,0.2)" },
    CONFIRMED: { background: "rgba(37,99,235,0.2)", color: "#bfdbfe", border: "1px solid rgba(96,165,250,0.2)" },
    COMPLETED: { background: "rgba(14,116,144,0.2)", color: "#bae6fd", border: "1px solid rgba(103,232,249,0.18)" },
    PENDING: { background: "rgba(250,204,21,0.18)", color: "#fef08a", border: "1px solid rgba(250,204,21,0.2)" },
    OPEN: { background: "rgba(250,204,21,0.18)", color: "#fef08a", border: "1px solid rgba(250,204,21,0.2)" },
    IN_REVIEW: { background: "rgba(59,130,246,0.18)", color: "#bfdbfe", border: "1px solid rgba(96,165,250,0.2)" },
    REJECTED: { background: "rgba(248,113,113,0.18)", color: "#fecaca", border: "1px solid rgba(248,113,113,0.22)" },
    RESOLVED: { background: "rgba(22,163,74,0.18)", color: "#bbf7d0", border: "1px solid rgba(74,222,128,0.2)" },
    HIDDEN: { background: "rgba(248,113,113,0.18)", color: "#fecaca", border: "1px solid rgba(248,113,113,0.22)" },
    VISIBLE: { background: "rgba(37,99,235,0.2)", color: "#bfdbfe", border: "1px solid rgba(96,165,250,0.2)" },
    CANCELED: { background: "rgba(248,113,113,0.18)", color: "#fecaca", border: "1px solid rgba(248,113,113,0.22)" },
    INACTIVE: { background: "rgba(71,85,105,0.24)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.18)" },
  };
  return {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    width: "fit-content",
    ...(palette[status] ?? palette.PENDING),
  };
}
