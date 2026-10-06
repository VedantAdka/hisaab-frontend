import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGroup } from "../api/groups";
import { listExpenses, deleteExpense } from "../api/expenses";
import { getGroupBalances, getDirectGroupBalances } from "../api/balances";
import { colorFor, initial } from "../utils/avatarColor";
import { useAuth } from "../context/AuthContext";
import { useGroups } from "../context/GroupsContext";
import ExpenseList from "../components/ExpenseList";
import BalancesTab from "../components/BalancesTab";
import AddExpenseModal from "../components/AddExpenseModal";
import ExpenseDetailModal from "../components/ExpenseDetailModal";
import GroupMenu from "../components/GroupMenu";
import EditGroupModal from "../components/EditGroupModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { BackIcon, PlusIcon } from "../components/icons";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message && data.message !== "No message available") return data.message;
  if (data?.error) return data.error;
  return fallback;
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { removeGroup, groups } = useGroups();

  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState(null);
  const [tab, setTab] = useState("expenses");

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState(null);

  const [balanceData, setBalanceData] = useState(null);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [balancesError, setBalancesError] = useState(null);
  // true = simplified (fewest total payments; can route a debt between two
  // people who never shared an expense directly), false = exact (only
  // real, direct pairwise debts — more rows, but each one is settleable
  // against a specific shared expense).
  const [simplified, setSimplified] = useState(true);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [selectedExpense, setSelectedExpense] = useState(null); // expense being viewed
  const [editingExpense, setEditingExpense] = useState(null); // expense being edited
  const [deletingExpenseId, setDeletingExpenseId] = useState(null); // expense pending delete confirm
  const [expenseActionError, setExpenseActionError] = useState(null);

  const loadGroup = useCallback(() => {
    setGroupLoading(true);
    setGroupError(null);
    return getGroup(groupId)
      .then((data) => setGroup(data))
      .catch((err) => setGroupError(extractError(err, "Couldn't load this group.")))
      .finally(() => setGroupLoading(false));
  }, [groupId]);

  const loadExpenses = useCallback(() => {
    setExpensesLoading(true);
    setExpensesError(null);
    return listExpenses(groupId)
      .then((data) => setExpenses(data))
      .catch((err) => setExpensesError(extractError(err, "Couldn't load expenses.")))
      .finally(() => setExpensesLoading(false));
  }, [groupId]);

  const loadBalances = useCallback(() => {
    setBalancesLoading(true);
    setBalancesError(null);
    const fetchBalances = simplified ? getGroupBalances : getDirectGroupBalances;
    return fetchBalances(groupId)
      .then((data) => setBalanceData(data))
      .catch((err) => setBalancesError(extractError(err, "Couldn't load balances.")))
      .finally(() => setBalancesLoading(false));
  }, [groupId, simplified]);

  useEffect(() => {
    loadGroup();
    loadExpenses();
    loadBalances();
  }, [loadGroup, loadExpenses, loadBalances]);

  // Balances were only ever fetched once, on mount. If anything changed the
  // numbers after that — someone else settled up in another tab/account,
  // or time just passed while this page sat open in a background tab — the
  // Balances view kept showing the stale amount, with nothing short of a
  // full page refresh to notice. Since switching between the Expenses and
  // Balances tabs is already a normal thing people do (and doesn't need a
  // network request today), use that same click as a cheap, natural point
  // to pull fresh numbers instead of trusting whatever was fetched at
  // mount. (This is exactly why "Settle up" on a row that turned out to
  // already be settled elsewhere produced "You don't owe X anything" —
  // the backend was right, the on-screen row just hadn't caught up.)
  useEffect(() => {
    if (tab === "balances") {
      loadBalances();
    }
  }, [tab, loadBalances]);

  // Keep this page's own copy of the group in sync with the shared
  // GroupsContext list. Editing a group (rename, add member, remove member)
  // always goes through applyGroupUpdate/updateGroup/removeGroup in that
  // context — whether it was triggered from the sidebar's kebab menu or
  // from this page's own "Edit group" button — but this page fetches its
  // `group` state independently via getGroup() on mount, so without this it
  // never heard about that change and kept showing the old member list
  // (e.g. a newly added member wouldn't appear here, or in the expense
  // participant picker, until a manual refresh).
  useEffect(() => {
    const match = groups.find((g) => String(g.id) === String(groupId));
    if (match) {
      setGroup(match);
    }
  }, [groups, groupId]);

  useEffect(() => {
    if (!expenseActionError) return;
    const t = setTimeout(() => setExpenseActionError(null), 4000);
    return () => clearTimeout(t);
  }, [expenseActionError]);

  const members = group?.members || [];
  const isCreator = group && user && group.createdByUserId === user.id;

  async function handleDeleteGroup() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await removeGroup(groupId);
      navigate("/groups");
    } catch (err) {
      setDeleteError(extractError(err, "Couldn't delete this group."));
      setDeleting(false);
    }
  }

  function handleExpenseUpdated(updated) {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedExpense(null);
    setEditingExpense(null);
    loadBalances();
  }

  async function handleDeleteExpense() {
    if (!deletingExpenseId) return;
    setExpenseActionError(null);
    try {
      await deleteExpense(groupId, deletingExpenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== deletingExpenseId));
      setDeletingExpenseId(null);
      setSelectedExpense(null);
      loadBalances();
    } catch (err) {
      setExpenseActionError(extractError(err, "Couldn't delete this expense."));
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 px-4 pt-5 pb-0 md:px-10 md:pt-8">
        <button type="button" onClick={() => navigate("/groups")} className="hs-icon-btn md:hidden">
          <BackIcon />
        </button>
        <div className="flex-1 flex items-center gap-4">
          <div className="text-xl md:text-2xl font-extrabold">{groupLoading ? "Loading..." : group?.name || "Group"}</div>
          {members.length > 0 && (
            <div className="hidden md:flex -space-x-2">
              {members.map((m, i) => (
                <div
                  key={m.userId ?? i}
                  className="w-[26px] h-[26px] rounded-full border-2 border-surface text-white flex items-center justify-center text-[10px] font-bold"
                  style={{ background: colorFor(m.name) }}
                >
                  {initial(m.name)}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAddExpense(true)}
          className="hs-btn-primary hidden md:flex items-center gap-2 rounded-[11px] px-5 py-2.5 text-[13.5px] font-bold"
        >
          <PlusIcon />
          Add expense
        </button>
        {isCreator && (
          <GroupMenu onEdit={() => setShowEditGroup(true)} onDelete={() => setShowDeleteConfirm(true)} />
        )}
      </div>

      {(groupError || deleteError) && (
        <div className="mx-4 mt-4 md:mx-10 text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
          {groupError || deleteError}
        </div>
      )}

      <div className="flex gap-6 md:gap-7 px-4 md:px-10 mt-4 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("expenses")}
          className={`hs-tab pb-3 text-sm md:text-[15px] ${tab === "expenses" ? "font-bold text-ink border-b-2 border-brand" : "font-medium text-muted"}`}
        >
          Expenses
        </button>
        <button
          type="button"
          onClick={() => setTab("balances")}
          className={`hs-tab pb-3 text-sm md:text-[15px] ${tab === "balances" ? "font-bold text-ink border-b-2 border-brand" : "font-medium text-muted"}`}
        >
          Balances
        </button>
      </div>

      <div className="p-4 pb-24 md:p-10 md:max-w-[960px]">
        {tab === "expenses" ? (
          expensesLoading ? (
            <div className="text-sm text-muted py-6">Loading expenses...</div>
          ) : expensesError ? (
            <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
              {expensesError}
            </div>
          ) : (
            <ExpenseList expenses={expenses} currentUserId={user?.id} onOpenExpense={setSelectedExpense} />
          )
        ) : (
          <BalancesTab
            groupId={groupId}
            groupName={group?.name}
            balanceData={balanceData}
            simplified={simplified}
            onToggleSimplified={setSimplified}
            currentUserId={user?.id}
            loading={balancesLoading}
            error={balancesError}
            onRefresh={() => {
              loadBalances();
              loadExpenses();
            }}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowAddExpense(true)}
        className="hs-fab md:hidden fixed right-5 bottom-24 w-[54px] h-[54px] rounded-full bg-brand flex items-center justify-center shadow-[0_6px_16px_rgba(217,115,13,0.4)]"
      >
        <PlusIcon size={24} />
      </button>

      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete "${group?.name}"?`}
          message="This permanently deletes the group along with all its expenses and activity for everyone in it. This can't be undone."
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteGroup}
          confirming={deleting}
        />
      )}

      {showAddExpense && members.length > 0 && (
        <AddExpenseModal
          groupId={groupId}
          members={members}
          currentUser={user}
          onClose={() => setShowAddExpense(false)}
          onCreated={() => {
            setShowAddExpense(false);
            loadExpenses();
            loadBalances();
          }}
        />
      )}

      {showEditGroup && group && (
        <EditGroupModal
          group={group}
          onClose={() => setShowEditGroup(false)}
          onSaved={(updated) => {
            setGroup(updated);
            setShowEditGroup(false);
          }}
        />
      )}

      {selectedExpense && !editingExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          currentUserId={user?.id}
          onClose={() => setSelectedExpense(null)}
          onEdit={() => setEditingExpense(selectedExpense)}
          onDelete={() => setDeletingExpenseId(selectedExpense.id)}
        />
      )}

      {editingExpense && members.length > 0 && (
        <AddExpenseModal
          groupId={groupId}
          members={members}
          currentUser={user}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onUpdated={handleExpenseUpdated}
        />
      )}

      {deletingExpenseId && (
        <ConfirmDialog
          title="Delete this expense?"
          message="This removes it from the group's expenses and recalculates everyone's balances. This can't be undone."
          onCancel={() => setDeletingExpenseId(null)}
          onConfirm={handleDeleteExpense}
        />
      )}

      {expenseActionError && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 text-[13px] text-danger bg-white border border-danger-border rounded-xl2 px-4 py-2.5 shadow-modal">
          {expenseActionError}
        </div>
      )}
    </div>
  );
}
