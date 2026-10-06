import { useState } from "react";
import { useGroups } from "../context/GroupsContext";

export default function CreateGroupModal({ onClose, onCreated }) {
  const { createGroup } = useGroups();
  const [name, setName] = useState("");
  const [members, setMembers] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function updateMember(index, value) {
    setMembers((list) => list.map((m, i) => (i === index ? value : m)));
  }

  function addMemberRow() {
    setMembers((list) => [...list, ""]);
  }

  function removeMemberRow(index) {
    setMembers((list) => list.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const memberIdentifiers = members.map((m) => m.trim()).filter(Boolean);
      const group = await createGroup({ name: name.trim(), memberIdentifiers });
      onCreated?.(group);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          (typeof err.response?.data === "string" ? err.response.data : null) ||
          "Couldn't create the group."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(28,27,26,0.42)] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[20px] p-6 md:p-7 shadow-modal max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="text-lg font-extrabold">New group</div>
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
              placeholder="Goa Trip"
              className="hs-input"
            />
          </div>

          <div>
            <div className="text-xs font-bold text-ink-soft mb-1.5">Add members (email or phone)</div>
            <div className="flex flex-col gap-2">
              {members.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateMember(index, e.target.value)}
                    placeholder="friend@example.com or 98765 43210"
                    className="hs-input flex-1"
                  />
                  {members.length > 1 && (
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
              {submitting ? "Creating..." : "Create group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
