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

export function fieldErrorsFrom(error) {
  const data = error?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const errors = {};
  for (const [field, value] of Object.entries(data)) {
    const text = Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : "";
    if (!text) continue;
    const key = field === "non_field_errors" || field === "detail" ? "form" : field;
    errors[key] = errors[key] ? `${errors[key]} ${text}` : text;
  }
  return errors;
}

export function describeActionError(error, action) {
  if (error?.status === 401) return "Your session has expired. Sign in again, then try once more.";
  if (error?.status === 404) return "This experiment no longer exists or does not belong to your account.";
  if (error?.status === 400 && error.message) return error.message;
  if (error instanceof TypeError) return "Could not reach the server. Check your connection and try again.";
  if (action === "rerun" && /timed out/i.test(error?.message || "")) {
    return "The new run is taking longer than expected. It may still finish on the server: reload this page in a minute to check.";
  }
  return error?.message || `The ${action === "rerun" ? "new run" : "request"} could not be completed. Please try again.`;
}

export function describeLoadError(error) {
  if (error?.status === 401) return "Your session has expired. Please sign in again to see your experiments.";
  if (error?.status === 404) return "This experiment does not exist or does not belong to your account.";
  if (error instanceof TypeError) return "Could not reach the server. Check your connection and try again.";
  return error?.message || "Something went wrong while loading. Please try again.";
}
