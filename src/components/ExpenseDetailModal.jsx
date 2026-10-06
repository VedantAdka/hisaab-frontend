import { CategoryIcon, PencilIcon } from "./icons";
import { colorFor, initial } from "../utils/avatarColor";
import { formatDateHeader, formatINR } from "../utils/format";

const SPLIT_LABELS = { EQUAL: "Equally", UNEQUAL: "Unequally", PERCENTAGE: "By percentage" };

function splitDetail(split, expense) {
  if (expense.splitType !== "PERCENTAGE" || !expense.amount) return null;
  const pct = (Number(split.amount) / Number(expense.amount)) * 100;
  return `${pct.toFixed(pct % 1 === 0 ? 0 : 1)}%`;
}

// A "smaller screen on the same page" for one expense — everything about
// it in one place, with edit/delete offered only to whoever paid for it or
// whoever added it (the backend enforces the same rule, this just avoids
// showing buttons that would 403).
export default function ExpenseDetailModal({ expense, currentUserId, onClose, onEdit, onDelete }) {
  const canManage =
    expense.paidByUserId === currentUserId || expense.addedByUserId === currentUserId;

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center justify-center bg-[rgba(28,27,26,0.42)]">
      <div className="w-full md:max-w-[460px] bg-white rounded-t-[24px] md:rounded-[20px] shadow-modal max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 md:px-6 md:pt-6 md:pb-2">
          <div className="text-base md:text-lg font-extrabold">Expense details</div>
          <button type="button" onClick={onClose} className="hs-icon-btn" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9a9284" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="px-5 md:px-6 pb-6">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-[13px] bg-brand-tint flex items-center justify-center flex-shrink-0">
              <CategoryIcon category={expense.category} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-extrabold truncate">{expense.description}</div>
              <div className="text-xs text-muted mt-0.5">{formatDateHeader(expense.expenseDate)}</div>
            </div>
            <div className="text-lg font-bold flex-shrink-0">{formatINR(expense.amount)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-surface rounded-xl2 px-3.5 py-3">
              <div className="text-[11px] text-muted font-bold tracking-wide mb-1">PAID BY</div>
              <div className="text-sm font-semibold">
                {expense.paidByUserId === currentUserId ? "You" : expense.paidByName}
              </div>
            </div>
            <div className="bg-surface rounded-xl2 px-3.5 py-3">
              <div className="text-[11px] text-muted font-bold tracking-wide mb-1">CATEGORY</div>
              <div className="text-sm font-semibold capitalize">{(expense.category || "").toLowerCase()}</div>
            </div>
            <div className="bg-surface rounded-xl2 px-3.5 py-3 col-span-2">
              <div className="text-[11px] text-muted font-bold tracking-wide mb-1">SPLIT</div>
              <div className="text-sm font-semibold">
                {SPLIT_LABELS[expense.splitType] || expense.splitType} &middot; {expense.splits?.length || 0} people
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="text-[11px] text-muted font-bold tracking-wide mb-2">SPLIT AMONG</div>
            <div className="flex flex-col bg-white border border-border rounded-xl2 overflow-hidden">
              {(expense.splits || []).map((split, i) => {
                const pct = splitDetail(split, expense);
                return (
                  <div
                    key={split.userId}
                    className={`flex items-center justify-between px-3.5 py-2.5 ${
                      i < expense.splits.length - 1 ? "border-b border-border-light" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: colorFor(split.userName) }}
                      >
                        {initial(split.userName)}
                      </div>
                      <div className="text-sm truncate">
                        {split.userId === currentUserId ? "You" : split.userName}
                      </div>
                    </div>
                    <div className="text-sm font-semibold flex-shrink-0">
                      {formatINR(split.amount)}
                      {pct && <span className="text-muted font-medium"> &middot; {pct}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {expense.notes && (
            <div className="mb-5">
              <div className="text-[11px] text-muted font-bold tracking-wide mb-1.5">NOTE</div>
              <div className="text-sm text-ink-soft bg-surface rounded-xl2 px-3.5 py-3 leading-relaxed">
                {expense.notes}
              </div>
            </div>
          )}

          {expense.receiptPhotoUrl && (
            <div className="mb-5">
              <div className="text-[11px] text-muted font-bold tracking-wide mb-1.5">RECEIPT</div>
              <a href={expense.receiptPhotoUrl} target="_blank" rel="noreferrer">
                <img
                  src={expense.receiptPhotoUrl}
                  alt="Receipt"
                  className="w-full max-h-56 object-cover rounded-xl2 border border-border"
                />
              </a>
            </div>
          )}

          {canManage && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onEdit}
                className="hs-btn-outline flex-1 flex items-center justify-center gap-2 rounded-xl2 border border-border py-2.5 text-sm font-bold text-ink-soft"
              >
                <PencilIcon color="#6b665d" size={14} />
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="hs-btn-danger flex-1 bg-danger-bg border-[1.3px] border-danger-border rounded-xl2 py-2.5 text-sm font-bold text-danger"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
