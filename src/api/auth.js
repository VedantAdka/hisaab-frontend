import api from "./client";

// Matches AuthController: POST /api/auth/register and /api/auth/login,
// both returning AuthResponse { token, name, email }.
// RegisterRequest: name, email, phoneNumber (exactly 10 digits, 6-9 start,
// no +91 prefix), password (min 6 chars), upiId (optional, no validation).

export async function registerUser({ name, email, phoneNumber, password, upiId }) {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    phoneNumber,
    password,
    upiId: upiId?.trim() || undefined,
  });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

// Always resolves the same way whether or not the email is registered — the
// backend deliberately doesn't reveal which addresses have accounts.
export async function requestPasswordReset(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword({ token, newPassword }) {
  const { data } = await api.post("/auth/reset-password", { token, newPassword });
  return data;
}
