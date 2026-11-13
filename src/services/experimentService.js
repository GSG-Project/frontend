import { apiRequest } from "./api";

export const HISTORY_PAGE_SIZE = 20;

export function getExperiments({ page = 1, pageSize = HISTORY_PAGE_SIZE, signal } = {}) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return apiRequest(`/api/experiments/?${params}`, { signal });
}

export function getExperiment(experimentId, { signal } = {}) {
  return apiRequest(`/api/experiments/${encodeURIComponent(experimentId)}/`, { signal });
}

export function deleteExperiment(experimentId) {
  return apiRequest(`/api/experiments/${encodeURIComponent(experimentId)}/`, { method: "DELETE" });
}

const RERUN_TIMEOUT_MS = 180000;

export function rerunExperiment(experimentId) {
  return apiRequest(`/api/experiments/${encodeURIComponent(experimentId)}/rerun/`, {
    method: "POST",
    timeoutMs: RERUN_TIMEOUT_MS,
  });
}
