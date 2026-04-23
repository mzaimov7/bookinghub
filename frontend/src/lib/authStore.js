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

export function saveAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
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
}
