export async function apiRequest(endpoint, options = {}) {
  const {
    csrfToken,
    headers: customHeaders = {},
    signal: customSignal,
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
  }, 60000);

  if (customSignal) {
    customSignal.addEventListener("abort", () => controller.abort());
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const fullUrl = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(fullUrl, {
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
      let message;
      if (typeof data === "string") {
        const htmlMessage = data.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1];
        message = htmlMessage || data.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      } else {
        message = data?.detail || data?.message || data?.error || 
                  (data && typeof data === "object" ? Object.values(data).flat().join(" ") : null);
      }

      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      if (isTimeout) {
        throw new Error("Request timed out. The server is taking too long to respond. Please try again.");
      }
      throw error;
    }
    throw error;
  }
}