import api from "./client";

// GroupBalanceResponse: { groupId, balances: [{userId, name, netBalance}],
// settlements: [{fromUserId, fromUserName, toUserId, toUserName, amount}] }
export async function getGroupBalances(groupId) {
  const { data } = await api.get(`/groups/${groupId}/balances`);
  return data;
}

// Same response shape as getGroupBalances, but every settlement is a real,
// direct pairwise debt (never routed through a third party to minimize the
// number of payments) — the "exact" companion to the simplified default.
export async function getDirectGroupBalances(groupId) {
  const { data } = await api.get(`/groups/${groupId}/balances/direct`);
  return data;
}
