import { useState } from "react";
import { addMember, removeMember } from "../api/groups";
import { useGroups } from "../context/GroupsContext";
import { colorFor, initial } from "../utils/avatarColor";
import ConfirmDialog from "./ConfirmDialog";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.error) return data.error;
  if (data?.message && data.message !== "No message available") return data.message;
  return fallback;
}

// Creator-only (the caller checks group.createdByUserId before rendering
// this, and the backend enforces it too on rename/remove-member calls).
// Lets you rename the group, add more members, and remove existing ones —
// the creator themself can never be removed, from here or the backend.
export default function EditGroupModal({ group, onClose, onSaved }) {
  const { updateGroup, applyGroupUpdate } = useGroups();
  const [currentGroup, setCurrentGroup] = useState(group); // reflects removals as they happen
  const [name, setName] = useState(group.name);
  const [newMembers, setNewMembers] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [removingMember, setRemovingMember] = useState(null); // member pending removal confirm
  const [removingBusy, setRemovingBusy] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const members = currentGroup.members || [];

  function updateMember(index, value) {
    setNewMembers((list) => list.map((m, i) => (i === index ? value : m)));
  }

  function addMemberRow() {
    setNewMembers((list) => [...list, ""]);
  }

  function removeMemberRow(index) {
    setNewMembers((list) => list.filter((_, i) => i !== index));
  }

  async function handleConfirmRemoveMember() {
    if (!removingMember) return;
    setRemovingBusy(true);
    setRemoveError(null);
    try {
      const updated = await removeMember(currentGroup.id, removingMember.userId);
      setCurrentGroup(updated);
      applyGroupUpdate(updated);
      setRemovingMember(null);
    } catch (err) {
      setRemoveError(extractError(err, "Couldn't remove this member."));
    } finally {
      setRemovingBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let latest = currentGroup;

      const trimmedName = name.trim();
      if (trimmedName && trimmedName !== currentGroup.name) {
        latest = await updateGroup(currentGroup.id, { name: trimmedName });
      }

      const identifiers = newMembers.map((m) => m.trim()).filter(Boolean);
      for (const identifier of identifiers) {
        latest = await addMember(currentGroup.id, identifier);
      }
      applyGroupUpdate(latest);

      onSaved?.(latest);
    } catch (err) {
      setError(extractError(err, "Couldn't save these changes."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(28,27,26,0.42)] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[20px] p-6 md:p-7 shadow-modal max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="text-lg font-extrabold">Edit group</div>
          <button type="button" onClick={onClose} className="hs-icon-btn" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9a9284" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-bold text-ink-soft mb-1.5">Group name</div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="hs-input"
            />
          </div>

          {members.length > 0 && (
            <div>
              <div className="text-xs font-bold text-ink-soft mb-1.5">Current members ({members.length})</div>
              {removeError && (
                <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5 mb-2">
                  {removeError}
                </div>
              )}
              <div className="flex flex-col bg-white border border-border rounded-xl2 overflow-hidden">
                {members.map((m, i) => {
                  const isCreator = m.userId === currentGroup.createdByUserId;
                  return (
                    <div
                      key={m.userId ?? i}
                      className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 ${
                        i < members.length - 1 ? "border-b border-border-light" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: colorFor(m.name) }}
                        >
                          {initial(m.name)}
                        </div>
                        <div className="text-sm truncate">{m.name}</div>
                        {isCreator && (
                          <span className="text-[10.5px] font-bold text-muted tracking-wide flex-shrink-0">CREATOR</span>
                        )}
                      </div>
                      {!isCreator && (
                        <button
                          type="button"
                          onClick={() => setRemovingMember(m)}
                          className="hs-icon-btn p-1 -m-1 flex-shrink-0"
                          aria-label={`Remove ${m.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c14a4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-ink-soft mb-1.5">Add more members (email or phone)</div>
            <div className="flex flex-col gap-2">
              {newMembers.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateMember(index, e.target.value)}
                    placeholder="friend@example.com or 98765 43210"
                    className="hs-input flex-1"
                  />
                  {newMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberRow(index)}
                      className="hs-icon-btn text-muted flex-shrink-0 p-1"
                      aria-label="Remove"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9284" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMemberRow}
              className="hs-icon-btn mt-2 text-xs font-bold text-brand-dark"
            >
              + Add another
            </button>
          </div>

          {error && (
            <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="hs-btn-outline rounded-xl2 border border-border px-5 py-2.5 text-sm font-bold text-ink-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="hs-btn-primary rounded-xl2 px-6 py-2.5 text-sm font-bold"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {removingMember && (
        <ConfirmDialog
          title={`Remove ${removingMember.name}?`}
          message={`They'll lose access to "${currentGroup.name}" and its expenses going forward. Expenses they were already part of stay exactly as they are. This can't be undone.`}
          onCancel={() => setRemovingMember(null)}
          onConfirm={handleConfirmRemoveMember}
          confirming={removingBusy}
        />
      )}
    </div>
  );
}
