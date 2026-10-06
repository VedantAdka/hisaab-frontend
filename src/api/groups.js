import api from "./client";

// Best-guess REST surface for groups — standard CRUD shape, but I don't have
// your actual GroupController yet. If any of these don't match, the fix is
// contained to this one file (plus GroupsContext's error handling).

export async function listGroups() {
  const { data } = await api.get("/groups");
  return data;
}

export async function getGroup(groupId) {
  const { data } = await api.get(`/groups/${groupId}`);
  return data;
}

// memberIdentifiers: array of strings, each either an email or a phone
// number — per your requirement that either identifier works when adding
// someone to a group.
export async function createGroup({ name, memberIdentifiers = [] }) {
  const { data } = await api.post("/groups", { name, memberIdentifiers });
  return data;
}

export async function addMember(groupId, identifier) {
  const { data } = await api.post(`/groups/${groupId}/members`, { identifier });
  return data;
}

// Requires a matching DELETE /api/groups/{groupId}/members/{userId} endpoint
// (creator-only; the creator themself can't be removed) — see the backend
// changes package.
export async function removeMember(groupId, userId) {
  const { data } = await api.delete(`/groups/${groupId}/members/${userId}`);
  return data;
}

// Requires a matching backend endpoint — see the DELETE /api/groups/{groupId}
// diff for GroupController/GroupService/GroupResponse.
export async function deleteGroup(groupId) {
  await api.delete(`/groups/${groupId}`);
}

// Requires a matching PUT /api/groups/{groupId} endpoint (creator-only,
// renames the group) — see the backend changes package.
export async function updateGroup(groupId, { name }) {
  const { data } = await api.put(`/groups/${groupId}`, { name });
  return data;
}
