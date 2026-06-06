async function readJsonOrThrow(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = text || `HTTP ${response.status}`;
    let errors = null;

    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed?.message === "string" && parsed.message.trim()) {
          message = parsed.message.trim();
        }
        if (typeof parsed?.errors === "object" && parsed.errors !== null) {
          errors = parsed.errors;
        }
      } catch {
        message = text;
      }
    }

    const error = new Error(message);
    if (errors) {
      error.errors = errors;
    }
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

export async function apiGet(url, options = {}) {
  const response = await fetch(url, options);
  return readJsonOrThrow(response);
}

export async function apiSend(url, { method = "POST", headers, body } = {}) {
  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  return readJsonOrThrow(response);
}
