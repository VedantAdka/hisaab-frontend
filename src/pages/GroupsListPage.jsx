import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../context/GroupsContext";
import UpiIdNudge from "../components/UpiIdNudge";
import CreateGroupModal from "../components/CreateGroupModal";
import { colorFor, initial } from "../utils/avatarColor";

function memberList(group) {
  // Defensive: your GroupResponse shape isn't confirmed yet, so this
  // accepts a few reasonable shapes rather than assuming one.
  if (Array.isArray(group.members)) return group.members;
  if (Array.isArray(group.memberNames)) return group.memberNames.map((name) => ({ name }));
  return [];
}

function GroupCard({ group, onOpen }) {
  const members = memberList(group);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="hs-card w-full text-left flex items-center gap-3.5 bg-white rounded-xl2 p-4"
    >
      <div
        className="w-11 h-11 rounded-[12px] flex items-center justify-center text-white font-bold text-base flex-shrink-0"
        style={{ background: colorFor(group.name) }}
      >
        {initial(group.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold truncate">{group.name}</div>
        <div className="text-[12.5px] text-muted mt-0.5">
          {members.length > 0
            ? `${members.length} member${members.length === 1 ? "" : "s"}`
            : "Tap to view"}
        </div>
      </div>
      <div className="flex -space-x-1.5 flex-shrink-0">
        {members.slice(0, 4).map((m, i) => (
          <div
            key={m.userId ?? i}
            className="w-6 h-6 rounded-full border-2 border-white text-white flex items-center justify-center text-[9px] font-bold"
            style={{ background: colorFor(m.name) }}
          >
            {initial(m.name)}
          </div>
        ))}
      </div>
    </button>
  );
}

export default function GroupsListPage() {
  const { groups, loading, error } = useGroups();
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <UpiIdNudge />

      <div className="flex items-center justify-between px-4 pt-5 pb-2 md:px-10 md:pt-8">
        <div className="text-2xl font-extrabold">Groups</div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="hs-btn-primary rounded-[11px] px-4 py-2.5 text-[13.5px] font-bold flex items-center gap-2"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          New group
        </button>
      </div>

      <div className="px-4 pb-8 md:px-10 flex flex-col gap-2.5 md:max-w-[560px]">
        {loading && <div className="text-sm text-muted py-6">Loading your groups...</div>}

        {!loading && error && (
          <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
            {error}
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="text-sm text-muted py-6">
            You're not in any groups yet — create one to start splitting expenses.
          </div>
        )}

        {!loading &&
          !error &&
          groups.map((group) => (
            <GroupCard key={group.id} group={group} onOpen={() => navigate(`/groups/${group.id}`)} />
          ))}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(group) => {
            setShowCreate(false);
            if (group?.id) navigate(`/groups/${group.id}`);
          }}
        />
      )}
    </div>
  );
}
