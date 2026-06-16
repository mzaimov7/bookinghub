const KEY = "bookinghub_auth";
const ADMIN_RETURN_KEY = "bookinghub_admin_return_auth";
const LAST_ACTIVITY_KEY = "bookinghub_last_activity";

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

export function getUserId() {
  return getAuth()?.userId ?? null;
}

export function saveAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
  markSessionActivity();
}

export function markSessionActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function getLastSessionActivity() {
  const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function startAdminPreview(auth) {
  const current = getAuth();
  if (current?.role === "ADMIN") {
    localStorage.setItem(ADMIN_RETURN_KEY, JSON.stringify({ ...current, devMode: false }));
  }
  saveAuth({ ...auth, devMode: true });
}

export function stopAdminPreview() {
  const raw = localStorage.getItem(ADMIN_RETURN_KEY);
  if (!raw) return null;

  try {
    const adminAuth = JSON.parse(raw);
    localStorage.removeItem(ADMIN_RETURN_KEY);
    saveAuth({ ...adminAuth, devMode: false });
    return adminAuth;
  } catch {
    localStorage.removeItem(ADMIN_RETURN_KEY);
    return null;
  }
}

export function isAdminPreview() {
  const auth = getAuth();
  return Boolean(auth?.devMode && auth?.role !== "ADMIN");
}

export function updateStoredAuth(updates = {}) {
  const current = getAuth();
  if (!current) return;
  saveAuth({ ...current, ...updates });
}

export function logoutLocal() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(ADMIN_RETURN_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}
