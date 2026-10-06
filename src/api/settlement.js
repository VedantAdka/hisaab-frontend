import api from "./client";

// SettleUpLinkResponse: { fromUserId, toUserId, toUserName, amount, upiId, upiDeepLink }
export async function getSettleUpLink(groupId, otherUserId) {
  const { data } = await api.get(`/groups/${groupId}/members/${otherUserId}/settle-up`);
  return data;
}

export async function markSettled(groupId, otherUserId) {
  const { data } = await api.post(`/groups/${groupId}/members/${otherUserId}/settle-up`);
  return data;
}

export async function sendReminder(groupId, otherUserId) {
  const { data } = await api.post(`/groups/${groupId}/members/${otherUserId}/remind`);
  return data;
}
