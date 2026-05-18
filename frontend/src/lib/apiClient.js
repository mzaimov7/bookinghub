async function readJsonOrThrow(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = text || `HTTP ${response.status}`;

    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed?.message === "string" && parsed.message.trim()) {
          message = parsed.message.trim();
        }
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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
