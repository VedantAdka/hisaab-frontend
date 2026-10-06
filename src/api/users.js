import api from "./client";

export async function getMe() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function updateProfile({ name, phoneNumber }) {
  const { data } = await api.put("/users/me", { name, phoneNumber });
  return data;
}

export async function updateUpiId(upiId) {
  const { data } = await api.put("/users/me/upi-id", { upiId });
  return data;
}
