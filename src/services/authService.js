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

// Sign in. Resolves with tokens, or with { requires_2fa, challenge, email, resend_after }
// when the account needs an emailed code (the server answers 202).
export function verifyLoginCode(challenge, code) {
  return apiRequest("/api/auth/login/verify/", {
    method: "POST",
    body: JSON.stringify({ challenge, code }),
  });
}

export function resendLoginCode(challenge) {
  return apiRequest("/api/auth/login/resend/", {
    method: "POST",
    body: JSON.stringify({ challenge }),
  });
}

export function requestPasswordReset(email) {
  return apiRequest("/api/auth/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset({ uid, token, newPassword }) {
  return apiRequest("/api/auth/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify({ uid, token, new_password: newPassword }),
  });
}

export function startTwoFactor(password) {
  return apiRequest("/api/auth/two-factor/enable/", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function confirmTwoFactor(code) {
  return apiRequest("/api/auth/two-factor/confirm/", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function disableTwoFactor(password) {
  return apiRequest("/api/auth/two-factor/disable/", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
