export const EMPTY = "—";

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const integerFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const costFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 });

export function formatDate(value) {
  if (!value) return EMPTY;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? EMPTY : dateFormatter.format(date);
}

export function formatInteger(value) {
  return value == null ? EMPTY : integerFormatter.format(value);
}

export function formatLatency(ms) {
  return ms == null ? EMPTY : `${integerFormatter.format(ms)} ms`;
}

export function formatCost(cost, currency) {
  if (cost == null) return EMPTY;
  return currency ? `${costFormatter.format(cost)} ${currency}` : costFormatter.format(cost);
}

export function formatScore(value) {
  return value == null ? EMPTY : String(value);
}

const STATUS_LABELS = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  success: "Success",
  skipped: "Skipped",
};

export function formatStatus(status) {
  return STATUS_LABELS[status] || (status ? status : EMPTY);
}

export function formatUserName(user) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  return name || user?.email || "";
}

export function getUserInitials(user) {
  const first = user?.first_name?.trim()?.[0] || "";
  const last = user?.last_name?.trim()?.[0] || "";
  const initials = (first + last) || user?.email?.[0] || "";
  return initials.toUpperCase() || "?";
}

const NETWORK_MESSAGE =
  "We couldn't connect to the server. Check your internet connection and try again. If the problem continues, the server may be starting up, so wait a minute and retry.";

export const isNetworkError = (error) => Boolean(error?.isNetworkError) || error instanceof TypeError;

function sentence(text) {
  const trimmed = String(text).trim();
  return trimmed ? trimmed[0].toUpperCase() + trimmed.slice(1) : trimmed;
}

function friendlyFieldMessage(field, text) {
  if (field === "email" && /already exists/i.test(text)) {
    return "An account with this email already exists. Try signing in instead.";
  }
  return sentence(text);
}

export function fieldErrorsFrom(error) {
  const data = error?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const errors = {};
  for (const [field, value] of Object.entries(data)) {
    const parts = (Array.isArray(value) ? value : [value]).filter((item) => typeof item === "string" && item.trim());
    if (!parts.length) continue;
    const key = field === "non_field_errors" || field === "detail" ? "form" : field;
    const text = parts.map((part) => friendlyFieldMessage(field, part)).join(" ");
    errors[key] = errors[key] ? `${errors[key]} ${text}` : text;
  }
  return errors;
}

export function describeGeneralError(error, fallback = "Something went wrong. Please try again.") {
  if (isNetworkError(error)) return NETWORK_MESSAGE;
  if (error?.isTimeout) return "The server is taking too long to respond. Please try again in a moment.";
  if (error?.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (error?.status >= 500) return error.message || "The server ran into a problem. Please try again in a moment.";
  return error?.message ? sentence(error.message) : fallback;
}

export function describeLoginError(error) {
  if (error?.status === 401) return "The email or password is incorrect. Please check them and try again.";
  if (error?.status === 400) return "Please enter a valid email and password.";
  return describeGeneralError(error, "We couldn't sign you in. Please try again.");
}

export function describeActionError(error, action) {
  if (error?.status === 401) return "Your session has expired. Please sign in again, then try once more.";
  if (error?.status === 404) return "This experiment no longer exists or does not belong to your account.";
  if (error?.status === 400 && error.message) return sentence(error.message);
  if (action === "rerun" && error?.isTimeout) {
    return "The new run is taking longer than expected. It may still finish on the server, so reload this page in a minute to check.";
  }
  return describeGeneralError(error, `The ${action === "rerun" ? "new run" : "request"} could not be completed. Please try again.`);
}

export function describeLoadError(error) {
  if (error?.status === 401) return "Your session has expired. Please sign in again to continue.";
  if (error?.status === 404) return "This experiment does not exist or does not belong to your account.";
  return describeGeneralError(error, "Something went wrong while loading. Please try again.");
}

// Message for a wrong, expired or used-up emailed code (the server sends `error` and `code`).
export function describeCodeError(error) {
  const reason = error?.data?.error;
  if (error?.status === 401) return "This sign-in has expired. Please sign in again.";
  if (error?.status === 429) return "A code was sent a moment ago. Please wait a few seconds before asking for another.";
  if (reason === "invalid") return "That code is not correct. Check it and try again.";
  if (reason === "expired") return "This code has expired. Ask for a new one.";
  if (reason === "too_many_attempts") return "Too many wrong attempts. Ask for a new code.";
  if (reason === "no_code") return "This code was already used or replaced. Ask for a new one.";
  return describeGeneralError(error, "The code could not be checked. Please try again.");
}
