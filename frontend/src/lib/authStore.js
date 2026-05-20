const KEY = "bookinghub_auth";
const PREVIEW_BACKUP_KEY = "bookinghub_admin_preview_backup";

export function isLoggedIn() {
  return !!getAuth();
}

export function getAuth() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getRole() {
  return getAuth()?.role || null;
}

export function isPreviewMode() {
  return !!localStorage.getItem(PREVIEW_BACKUP_KEY);
}

export function getPreviewBackupAuth() {
  const raw = localStorage.getItem(PREVIEW_BACKUP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUserId() {
  return getAuth()?.userId ?? null;
}

export function saveAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function startAdminPreview(nextAuth) {
  const current = getAuth();
  if (current && current.role === "ADMIN" && !isPreviewMode()) {
    localStorage.setItem(PREVIEW_BACKUP_KEY, JSON.stringify(current));
  }
  saveAuth({ ...nextAuth, previewMode: true });
}

export function stopAdminPreview() {
  const backup = getPreviewBackupAuth();
  if (backup) {
    saveAuth(backup);
  }
  localStorage.removeItem(PREVIEW_BACKUP_KEY);
}

export function updateStoredAuth(updates = {}) {
  const current = getAuth();
  if (!current) return;
  saveAuth({ ...current, ...updates });
}

export function loginLocal(role = "CLIENT", username = "demo", options = {}) {
  saveAuth({
    userId: null,
    username,
    email: options.email || "",
    role,
    devMode: Boolean(options.devMode),
  });
}

export function logoutLocal() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(PREVIEW_BACKUP_KEY);
}
