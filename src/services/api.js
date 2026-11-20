const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

const AUTH_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/login/verify/",
  "/api/auth/login/resend/",
  "/api/auth/register/",
  "/api/auth/refresh/",
  "/api/auth/password-reset/",
  "/api/auth/password-reset/confirm/",
];

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

export const NETWORK_ERROR_MESSAGE =
  "We couldn't connect to the server. Check your internet connection and try again. If the problem continues, the server may be starting up, so wait a minute and retry.";

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

let refreshInFlight = null;

function renewAccessToken() {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return Promise.resolve(null);

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const response = await fetch(`${baseUrl}/api/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return null;
      const data = await response.json().catch(() => null);
      if (!data?.access) return null;
      localStorage.setItem("accessToken", data.access);
      if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
      return data.access;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function errorMessage(status, data) {
  if (typeof data === "string") {
    if (status >= 500) {
      return [502, 503, 504].includes(status)
        ? `The server is not available right now (error ${status}). It may be starting up; please try again in a minute.`
        : `The server ran into a problem (error ${status}). Please try again in a moment.`;
    }
    const htmlMessage = data.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1];
    return htmlMessage || data.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  return data?.detail || data?.message || data?.error ||
    (data && typeof data === "object" ? Object.values(data).flat().join(" ") : null);
}

async function sendRequest(endpoint, options) {
  const {
    csrfToken,
    headers: customHeaders = {},
    signal: customSignal,
    timeoutMs = 60000,
    ...fetchOptions
  } = options;

  const accessToken = localStorage.getItem("accessToken");

  const headers = {
    ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
    ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
    ...customHeaders,
  };

  if (csrfToken) {
    headers["X-CSRFTOKEN"] = csrfToken;
  }

  const controller = new AbortController();
  let isTimeout = false;

  const timeoutId = setTimeout(() => {
    isTimeout = true;
    controller.abort();
  }, timeoutMs);

  if (customSignal) {
    if (customSignal.aborted) controller.abort();
    customSignal.addEventListener("abort", () => controller.abort());
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let data = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    }

    if (!response.ok) {
      const requestError = new Error(errorMessage(response.status, data) || `Request failed with status ${response.status}`);
      requestError.status = response.status;
      requestError.data = data;
      requestError.sentToken = Boolean(accessToken);
      throw requestError;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError" && isTimeout) {
      const timeoutError = new Error("The server is taking too long to respond. Please try again in a moment.");
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    if (error instanceof TypeError) {
      const networkError = new Error(NETWORK_ERROR_MESSAGE);
      networkError.isNetworkError = true;
      networkError.status = 0;
      throw networkError;
    }
    throw error;
  }
}

export async function apiRequest(endpoint, options = {}) {
  try {
    return await sendRequest(endpoint, options);
  } catch (error) {
    const path = endpoint.split("?")[0];
    const canRenew = error.status === 401 && error.sentToken && !AUTH_ENDPOINTS.includes(path);
    if (!canRenew) throw error;

    let newToken;
    try {
      newToken = await renewAccessToken();
    } catch {
      throw error;
    }
    if (!newToken) {
      clearSession();
      throw error;
    }
    return sendRequest(endpoint, options);
  }
}
