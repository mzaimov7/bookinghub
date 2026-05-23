import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import { resolveBackendImage } from "../../lib/assets";
import {
  approveServiceAsAdmin,
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
  listAdminReviews,
  listAdminServices,
  rejectServiceAsAdmin,
  updateAdminCategory,
  updateAdminReport,
  updateAdminUserStatus,
} from "../business/services/api";

const tabs = [
  { id: "services", label: "Обяви" },
  { id: "bookings", label: "Резервации" },
  { id: "categories", label: "Категории" },
  { id: "reports", label: "Докладвания" },
  { id: "moderation", label: "Коментари и отзиви" },
  { id: "businesses", label: "Бизнес профили" },
  { id: "clients", label: "Клиенти" },
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
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [clients, setClients] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  const [serviceNotes, setServiceNotes] = useState({});
  const [commentReasons, setCommentReasons] = useState({});
  const [reportNotes, setReportNotes] = useState({});
  const [categoryDraft, setCategoryDraft] = useState(emptyCategoryDraft);
  const [categoryForms, setCategoryForms] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [
        nextServices,
        nextBookings,
        nextCategories,
        nextReports,
        nextReviews,
        nextComments,
        nextBusinesses,
        nextClients,
      ] = await Promise.all([
        listAdminServices(),
        listAdminBookings(),
        listAdminCategories(),
        listAdminReports(),
        listAdminReviews(),
        listAdminComments(),
        listAdminBusinesses(),
        listAdminClients(),
      ]);

      setServices(nextServices);
      setBookings(nextBookings);
      setCategories(nextCategories);
      setReports(nextReports);
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
      reports: `${reports.filter((item) => item.status === "OPEN" || item.status === "IN_REVIEW").length} активни`,
      moderation: `${reviews.filter((item) => item.status === "VISIBLE").length + comments.filter((item) => item.status === "VISIBLE").length} видими`,
      businesses: `${businesses.length} профила`,
      clients: `${clients.length} профила`,
    }),
    [services, bookings, categories, reports, reviews, comments, businesses, clients]
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
      await hideCommentAsAdmin(comment.id, { reason });
      setComments((current) => current.filter((item) => item.id !== comment.id));
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
      await hideReviewAsAdmin(review.id, { reason });
      setReviews((current) => current.filter((item) => item.id !== review.id));
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
      setReports((current) => current.map((item) => (item.id === report.id ? next : item)));
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
        setBusinesses((current) => (
          next.active
            ? current.map((item) => (item.userId === profile.userId ? next : item))
            : current.filter((item) => item.userId !== profile.userId)
        ));
      } else {
        setClients((current) => (
          next.active
            ? current.map((item) => (item.userId === profile.userId ? next : item))
            : current.filter((item) => item.userId !== profile.userId)
        ));
      }
    } catch (actionError) {
      alert(actionError.message);
    } finally {
      setBusyKey("");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBackground }}>
      <Header categories={[]} recentSearches={[]} />
      <div style={{ maxWidth: 1260, margin: "0 auto", padding: "28px 16px 44px" }}>
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
              <span>{tab.label}</span>
              <small style={{ opacity: 0.8 }}>{tabMeta[tab.id]}</small>
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
                    <div style={actions}>
                      <button type="button" onClick={() => onApproveService(service)} style={primaryButton} disabled={busyKey === `approve-${service.id}`}>Одобри</button>
                      <button type="button" onClick={() => onRejectService(service)} style={secondaryButton} disabled={busyKey === `reject-${service.id}`}>Върни</button>
                      <button type="button" onClick={() => onDeleteService(service)} style={dangerButton} disabled={busyKey === `delete-${service.id}`}>Изтрий</button>
                    </div>
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
                  <div style={mutedText}>Статус причина: {booking.statusReason || "—"}</div>
                  <div style={mutedText}>Бележка от клиента: {booking.clientNote || "—"}</div>
                  <div style={actions}>
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
                {reports.map((report) => (
                  <article key={report.id} style={reportCard}>
                    <div style={reportContent}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={statusChip(report.status)}>{labelForReportStatus(report.status)}</div>
                        <div style={reportTypePill}>{labelForTargetType(report.targetType)}</div>
                      </div>
                      <div style={cardTitle}>{report.targetLabel}</div>
                      <div style={reportTextBox}>
                        <strong style={{ color: "#dbeafe" }}>Причина за докладване:</strong>
                        <div style={bodyText}>{report.reasonText}</div>
                      </div>
                      <div style={mutedText}>Докладвано от: {report.reporterName}</div>
                      <div style={mutedText}>Дата: {formatDateTime(report.createdAt)}</div>
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
                ))}
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
                      <button
                        type="button"
                        onClick={() => (item.moderationType === "review" ? onHideReview(item) : onHideComment(item))}
                        style={dangerButton}
                        disabled={busyKey === `${item.moderationType}-${item.id}` || item.status === "HIDDEN"}
                      >
                        Изтрий
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === "businesses" && (
              <div style={profileGrid}>
                {businesses.map((profile) => (
                  <article key={profile.userId} style={profileCard}>
                    <ProfileHeader profile={profile} />
                    <div style={profileMeta}>Потребител: {profile.username}</div>
                    <div style={profileMeta}>Град: {profile.city || "—"}</div>
                    <div style={profileMeta}>Адрес: {profile.address || "—"}</div>
                    <div style={profileMeta}>Телефон: {profile.phone || "—"}</div>
                    <div style={profileMeta}>Обяви: {profile.listingCount}</div>
                    <div style={profileMeta}>Регистриран: {formatDateTime(profile.createdAt)}</div>
                    <div style={profileMeta}>Последно влизане: {formatDateTime(profile.lastLoginAt)}</div>
                    <button type="button" onClick={() => onToggleUser(profile)} style={profile.active ? dangerButton : primaryButton} disabled={busyKey === `user-${profile.userId}`}>
                      {profile.active ? "Изтрий" : "Активирай профила"}
                    </button>
                  </article>
                ))}
              </div>
            )}

            {activeTab === "clients" && (
              <div style={profileGrid}>
                {clients.map((profile) => (
                  <article key={profile.userId} style={profileCard}>
                    <ProfileHeader profile={profile} />
                    <div style={profileMeta}>Потребител: {profile.username}</div>
                    <div style={profileMeta}>Телефон: {profile.phone || "—"}</div>
                    <div style={profileMeta}>Регистриран: {formatDateTime(profile.createdAt)}</div>
                    <div style={profileMeta}>Последно влизане: {formatDateTime(profile.lastLoginAt)}</div>
                    <div style={profileMeta}>Биография: {profile.bio || "Няма добавена биография."}</div>
                    <button type="button" onClick={() => onToggleUser(profile)} style={profile.active ? dangerButton : primaryButton} disabled={busyKey === `user-${profile.userId}`}>
                      {profile.active ? "Изтрий" : "Активирай профила"}
                    </button>
                  </article>
                ))}
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
  if (type === "BUSINESS_PROFILE") return "Бизнес профил";
  if (type === "CLIENT_PROFILE") return "Клиентски профил";
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
const tabRow = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, marginBottom: 18 };
const tabButton = { border: "1px solid rgba(96,165,250,0.18)", color: "#fff", borderRadius: 16, padding: "12px 16px", cursor: "pointer", display: "grid", gap: 4, minWidth: 126 };
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
const serviceRow = { display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 18, alignItems: "start" };
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
const actions = { display: "flex", gap: 10, flexWrap: "wrap" };
const primaryButton = { border: "none", borderRadius: 14, padding: "12px 16px", color: "#fff", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", cursor: "pointer", fontWeight: 800 };
const secondaryButton = { border: "1px solid rgba(96,165,250,0.18)", borderRadius: 14, padding: "12px 16px", color: "#dbeafe", background: "rgba(15,23,42,0.82)", cursor: "pointer", fontWeight: 800 };
const dangerButton = { border: "1px solid rgba(248,113,113,0.24)", borderRadius: 14, padding: "12px 16px", color: "#fee2e2", background: "rgba(127,29,29,0.22)", cursor: "pointer", fontWeight: 800 };
const checkboxRow = { display: "flex", gap: 10, alignItems: "center", color: "#dbeafe" };
const subtlePanel = { padding: 14, borderRadius: 16, background: "rgba(15,23,42,0.66)", border: "1px solid rgba(96,165,250,0.12)" };
const profileGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 };
const profileCard = { padding: 18, borderRadius: 22, background: "linear-gradient(180deg, rgba(10,20,40,0.92), rgba(15,23,42,0.86))", border: "1px solid rgba(96,165,250,0.16)", display: "grid", gap: 10 };
const profileHeader = { display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: 12, alignItems: "center" };
const avatar = { width: 72, height: 72, borderRadius: 999, objectFit: "cover", border: "2px solid rgba(96,165,250,0.22)" };
const avatarFallback = { width: 72, height: 72, borderRadius: 999, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(37,99,235,0.86), rgba(29,78,216,0.64))", color: "#eff6ff", fontWeight: 900, fontSize: 22 };
const profileMeta = { color: "rgba(226,232,240,0.82)", lineHeight: 1.55 };

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
