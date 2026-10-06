import api from "./client";

// Matches the real CreateExpenseRequest/ExpenseResponse DTOs from the
// backend zip: description, amount, currency, category, splitType,
// paidByUserId (null = current user), expenseDate (null = today), notes,
// receiptPhotoUrl, participants: [{userId, amount?, percentage?}].
export async function listExpenses(groupId) {
  const { data } = await api.get(`/groups/${groupId}/expenses`);
  return data;
}

export async function createExpense(groupId, payload) {
  const { data } = await api.post(`/groups/${groupId}/expenses`, payload);
  return data;
}

// Requires matching PUT/DELETE /api/groups/{groupId}/expenses/{expenseId}
// endpoints — see the backend changes package. Editing/deleting is
// restricted server-side to whoever paid for the expense OR whoever
// originally added it (ExpenseResponse now also carries addedByUserId).
export async function updateExpense(groupId, expenseId, payload) {
  const { data } = await api.put(`/groups/${groupId}/expenses/${expenseId}`, payload);
  return data;
}

export async function deleteExpense(groupId, expenseId) {
  await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
}
