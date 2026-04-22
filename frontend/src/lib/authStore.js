const KEY = "bookinghub_auth";

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

export function loginLocal(role = "CLIENT", username = "demo") {
  localStorage.setItem(KEY, JSON.stringify({ role, username }));
}

export function logoutLocal() {
  localStorage.removeItem(KEY);
}
