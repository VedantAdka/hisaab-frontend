import { CategoryIcon } from "./icons";
import { formatDateHeader, formatINR } from "../utils/format";

function paidByLabel(expense, currentUserId) {
  const who = expense.paidByUserId === currentUserId ? "You" : expense.paidByName;
  const n = expense.splits?.length || 0;
  return `${who} paid · split ${n} way${n === 1 ? "" : "s"}`;
}

// An expense counts as fully settled once every split on it — not just the
// payer's own (which is always settled=true by definition, since you don't
// owe yourself) — has settled: true. That happens whenever everyone
// involved has settled up directly with the payer for their share.
function isFullySettled(expense) {
  return (expense.splits?.length || 0) > 0 && expense.splits.every((s) => s.settled);
}

export default function ExpenseList({ expenses, currentUserId, onOpenExpense }) {
  if (expenses.length === 0) {
    return (
      <div className="text-sm text-muted py-6">
        No expenses yet — tap the + button to add the first one.
      </div>
    );
  }

  const groups = [];
  let lastDate = null;
  for (const expense of expenses) {
    if (expense.expenseDate !== lastDate) {
      groups.push({ date: expense.expenseDate, items: [] });
      lastDate = expense.expenseDate;
    }
    groups[groups.length - 1].items.push(expense);
  }

  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <div key={group.date}>
          <div className="text-[11px] text-muted font-bold tracking-wide px-0.5 pt-3.5 pb-2 md:pt-4 md:pb-2.5">
            {formatDateHeader(group.date)}
          </div>
          {group.items.map((expense) => (
            <button
              key={expense.id}
              type="button"
              onClick={() => onOpenExpense?.(expense)}
              className="hs-card w-full text-left flex items-center gap-3 md:gap-3.5 bg-white rounded-xl2 p-3.5 md:p-4 mb-2 md:mb-2.5"
            >
              <div className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-[11px] bg-brand-tint flex items-center justify-center flex-shrink-0">
                <CategoryIcon category={expense.category} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-sm md:text-[14.5px] font-semibold truncate">{expense.description}</div>
                  {isFullySettled(expense) && (
                    <span className="flex-shrink-0 text-[10px] font-bold tracking-wide text-success bg-success-bg border border-success-border rounded-full px-2 py-0.5">
                      SETTLED
                    </span>
                  )}
                </div>
                <div className="text-xs md:text-[12.5px] text-muted mt-0.5">{paidByLabel(expense, currentUserId)}</div>
              </div>
              <div className="text-sm md:text-[15px] font-bold flex-shrink-0">{formatINR(expense.amount)}</div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
