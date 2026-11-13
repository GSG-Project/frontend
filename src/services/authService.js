import { apiRequest } from "./api";

export function loginUser(email, password) {
  return apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser({ email, firstName, lastName, password }) {
  return apiRequest("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({ email, first_name: firstName, last_name: lastName, password }),
  });
}

export function getCurrentUser() {
  return apiRequest("/api/auth/me/");
}

export function updateProfile({ firstName, lastName }) {
  return apiRequest("/api/auth/me/", {
    method: "PATCH",
    body: JSON.stringify({ first_name: firstName, last_name: lastName }),
  });
}

export function changePassword({ oldPassword, newPassword }) {
  return apiRequest("/api/auth/change-password/", {
    method: "POST",
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}
