import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  listGroups,
  createGroup as apiCreateGroup,
  deleteGroup as apiDeleteGroup,
  updateGroup as apiUpdateGroup,
} from "../api/groups";
import { useAuth } from "./AuthContext";

const GroupsContext = createContext(null);

export function GroupsProvider({ children }) {
  const { token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Couldn't load your groups.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createGroup(details) {
    const group = await apiCreateGroup(details);
    await refresh();
    return group;
  }

  async function removeGroup(groupId) {
    await apiDeleteGroup(groupId);
    // groupId comes from useParams() (a string) in most callers, while
    // group.id is numeric — compare as strings so the just-deleted group
    // actually gets filtered out instead of silently sticking around in
    // the sidebar/list until a hard refresh re-fetches the real list.
    setGroups((prev) => prev.filter((g) => String(g.id) !== String(groupId)));
  }

  async function updateGroup(groupId, details) {
    const updated = await apiUpdateGroup(groupId, details);
    setGroups((prev) => prev.map((g) => (String(g.id) === String(groupId) ? updated : g)));
    return updated;
  }

  // Adding a member returns the full updated GroupResponse too, so the
  // sidebar/list can reflect the new member count without a manual refresh.
  function applyGroupUpdate(updated) {
    if (!updated?.id) return;
    setGroups((prev) => prev.map((g) => (String(g.id) === String(updated.id) ? updated : g)));
  }

  return (
    <GroupsContext.Provider
      value={{ groups, loading, error, refresh, createGroup, removeGroup, updateGroup, applyGroupUpdate }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used inside a GroupsProvider");
  return ctx;
}
