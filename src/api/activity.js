import api from "./client";

// ActivityResponse: { id, type, message, actorUserId, actorName, createdAt }.
// There's no global activity endpoint on the backend — only
// GET /api/groups/{groupId}/activity — so the Activity page fetches per
// group and merges (see ActivityPage.jsx).
export async function getGroupActivity(groupId) {
  const { data } = await api.get(`/groups/${groupId}/activity`);
  return data;
}
