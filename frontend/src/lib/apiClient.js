async function readJsonOrThrow(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP ${response.status}`);
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
