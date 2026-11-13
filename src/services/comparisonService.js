import { apiRequest } from "./api";

export function getModels(options = {}) {
  return apiRequest("/api/models/", options);
}

export function createComparison({ prompt, model_ids }) {
  return apiRequest("/api/comparisons/", {
    method: "POST",
    body: JSON.stringify({ prompt, model_ids }),
  });
}