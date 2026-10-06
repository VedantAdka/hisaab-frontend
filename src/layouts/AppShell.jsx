import { useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import Logo from "../components/Logo";
import { GroupsIcon, ActivityIcon, ProfileIcon } from "../components/icons";
import UserMenu from "../components/UserMenu";
import GroupMenu from "../components/GroupMenu";
import EditGroupModal from "../components/EditGroupModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useGroups } from "../context/GroupsContext";
import { colorFor, initial } from "../utils/avatarColor";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.error) return data.error;
  if (data?.message && data.message !== "No message available") return data.message;
  return fallback;
}

const NAV_ITEMS = [
  { to: "/groups", label: "Groups", Icon: GroupsIcon },
  { to: "/activity", label: "Activity", Icon: ActivityIcon },
  { to: "/profile", label: "Profile", Icon: ProfileIcon },
];

function initials(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function YourGroups() {
  const { groups, loading, removeGroup } = useGroups();
  const { user } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return null;

  async function handleConfirmDelete() {
    if (!deletingGroup) return;
    setDeleting(true);
    setError(null);
    try {
      await removeGroup(deletingGroup.id);
      setDeletingGroup(null);
      // If the group being deleted is the one currently open, its own page
      // will 403 on its next fetch — hop back to the list right away
      // instead of leaving that stale.
      if (String(deletingGroup.id) === groupId) {
        navigate("/groups");
      }
    } catch (err) {
      setError(extractError(err, "Couldn't delete this group."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="pt-4 px-3">
      <div className="flex items-center justify-between px-1.5 pb-2">
        <span className="text-[11px] font-bold text-muted tracking-wide">YOUR GROUPS</span>
      </div>

      {error && (
        <div className="mx-1.5 mb-2 text-[11.5px] text-danger bg-danger-bg border border-danger-border rounded-lg px-2.5 py-2">
          {error}
        </div>
      )}

      {groups.map((group) => {
        const isCreator = user && group.createdByUserId === user.id;
        return (
          <div
            key={group.id}
            className={`hs-nav-item group flex items-center gap-1 px-2.5 py-2 rounded-[9px] ${
              String(group.id) === groupId ? "bg-surface" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => navigate(`/groups/${group.id}`)}
              className="flex-1 min-w-0 flex items-center gap-2.5 text-left"
            >
              <div
                className="w-[26px] h-[26px] rounded-[8px] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: colorFor(group.name) }}
              >
                {initial(group.name)}
              </div>
              <span className="text-[13.5px] font-semibold text-ink-soft truncate">{group.name}</span>
            </button>
            {isCreator && (
              <GroupMenu onEdit={() => setEditingGroup(group)} onDelete={() => setDeletingGroup(group)} />
            )}
          </div>
        );
      })}
      {groups.length === 0 && (
        <div className="px-2.5 text-xs text-muted">No groups yet</div>
      )}

      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSaved={() => setEditingGroup(null)}
        />
      )}

      {deletingGroup && (
        <ConfirmDialog
          title={`Delete "${deletingGroup.name}"?`}
          message="This permanently deletes the group along with all its expenses and activity for everyone in it. This can't be undone."
          onCancel={() => setDeletingGroup(null)}
          onConfirm={handleConfirmDelete}
          confirming={deleting}
        />
      )}
    </div>
  );
}

function DesktopSidebar() {
  const { user } = useAuth();
  return (
    <div className="hidden md:flex w-[264px] flex-shrink-0 h-screen bg-white border-r border-border flex-col overflow-y-auto">
      <div className="flex items-center gap-2.5 px-5 pt-[22px] pb-[18px]">
        <Logo />
      </div>

      <div className="px-3">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `hs-nav-item flex items-center gap-3 px-3.5 py-2.5 mb-0.5 ${
                isActive ? "bg-brand-tint" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon color={isActive ? "#d9730d" : "#6b665d"} size={19} />
                <span className={`text-sm ${isActive ? "font-bold text-brand" : "font-semibold text-[#6b665d]"}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <YourGroups />

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 px-5 py-4 border-t border-border">
        <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials(user?.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-ink truncate">{user?.name || "You"}</div>
        </div>
        <UserMenu />
      </div>
    </div>
  );
}

function MobileTabBar() {
  return (
    <div className="md:hidden flex items-center justify-around py-3 pb-[22px] bg-white border-t border-border fixed left-0 right-0 bottom-0 z-10">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="hs-nav-item flex flex-col items-center gap-[3px] px-4 py-1.5"
        >
          {({ isActive }) => (
            <>
              <Icon color={isActive ? "#d9730d" : "#9a9284"} />
              <div className={`text-[10px] ${isActive ? "font-semibold text-brand" : "text-muted"}`}>
                {label}
              </div>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <DesktopSidebar />
      <div className="flex-1 min-w-0 h-screen overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </div>
      <MobileTabBar />
    </div>
  );
}
