import { useMemo, useRef, useState } from "react";
import { createExpense, updateExpense } from "../api/expenses";
import { uploadReceipt } from "../api/uploads";
import { CATEGORIES, CameraIcon, GalleryIcon, CalendarIcon, CheckIcon } from "./icons";
import { colorFor, initial } from "../utils/avatarColor";
import { formatINR, todayISO } from "../utils/format";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024; // keep in sync with the backend's multipart limit

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message && data.message !== "No message available") return data.message;
  if (data?.error) return data.error;
  return fallback;
}

// Reconstructs the "shares" input state (amount or percentage strings, keyed
// by userId) from an existing expense's splits — used when opening this
// modal in edit mode. ExpenseResponse only carries split *amounts*, never
// the original percentages, so a PERCENTAGE split is recomputed from
// amount / total — close enough to re-edit, even if it wasn't entered as a
// perfectly round percentage originally.
function sharesFromSplits(expense) {
  const result = {};
  for (const split of expense.splits || []) {
    if (expense.splitType === "PERCENTAGE" && expense.amount) {
      const pct = (Number(split.amount) / Number(expense.amount)) * 100;
      result[split.userId] = String(Math.round(pct * 100) / 100);
    } else {
      result[split.userId] = String(split.amount);
    }
  }
  return result;
}

// Pass `expense` to edit an existing one in place instead of creating a new
// one — same form, prefilled, calling updateExpense on submit.
export default function AddExpenseModal({ groupId, members, currentUser, expense, onClose, onCreated, onUpdated }) {
  const isEdit = Boolean(expense);
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [paidByUserId, setPaidByUserId] = useState(
    expense?.paidByUserId ?? currentUser?.id ?? members[0]?.userId
  );
  const [splitType, setSplitType] = useState(expense?.splitType ?? "EQUAL");
  const [category, setCategory] = useState(expense?.category ?? "FOOD");
  const [expenseDate, setExpenseDate] = useState(expense?.expenseDate ?? todayISO());
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [included, setIncluded] = useState(
    () => new Set(expense ? expense.splits.map((s) => s.userId) : members.map((m) => m.userId))
  );
  const [shares, setShares] = useState(() => (expense ? sharesFromSplits(expense) : {})); // userId -> string (amount or percentage input)
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState(expense?.receiptPhotoUrl ?? null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  async function handleReceiptFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let picking the same file again re-fire onChange
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setReceiptError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setReceiptError("That image is over 5MB — try a smaller one.");
      return;
    }

    setReceiptError(null);
    setUploadingReceipt(true);
    try {
      const url = await uploadReceipt(file);
      setReceiptPhotoUrl(url);
    } catch (err) {
      setReceiptError(extractError(err, "Couldn't upload that photo."));
    } finally {
      setUploadingReceipt(false);
    }
  }

  const selectedMembers = members.filter((m) => included.has(m.userId));
  const amountNum = parseFloat(amount) || 0;

  function toggleMember(userId) {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  const equalShare = selectedMembers.length > 0 ? amountNum / selectedMembers.length : 0;

  const sharesSum = useMemo(() => {
    return selectedMembers.reduce((sum, m) => sum + (parseFloat(shares[m.userId]) || 0), 0);
  }, [shares, selectedMembers]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (selectedMembers.length === 0) {
      setError("Pick at least one person to split this with.");
      return;
    }
    if (splitType === "UNEQUAL" && Math.abs(sharesSum - amountNum) > 0.01) {
      setError(`The split amounts (₹${sharesSum.toFixed(2)}) must add up to the total (₹${amountNum.toFixed(2)}).`);
      return;
    }
    if (splitType === "PERCENTAGE" && Math.abs(sharesSum - 100) > 0.01) {
      setError(`The percentages (${sharesSum.toFixed(2)}%) must add up to 100%.`);
      return;
    }

    const participants = selectedMembers.map((m) => {
      const p = { userId: m.userId };
      if (splitType === "UNEQUAL") p.amount = parseFloat(shares[m.userId]) || 0;
      if (splitType === "PERCENTAGE") p.percentage = parseFloat(shares[m.userId]) || 0;
      return p;
    });

    const payload = {
      description: description.trim(),
      amount: amountNum,
      currency: "INR",
      category,
      splitType,
      paidByUserId,
      expenseDate,
      notes: notes.trim() || undefined,
      receiptPhotoUrl: receiptPhotoUrl || undefined,
      participants,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await updateExpense(groupId, expense.id, payload);
        onUpdated?.(updated);
      } else {
        const created = await createExpense(groupId, payload);
        onCreated?.(created);
      }
    } catch (err) {
      setError(extractError(err, isEdit ? "Couldn't save these changes." : "Couldn't add this expense."));
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    description.trim() && amountNum > 0 && selectedMembers.length > 0 && !submitting && !uploadingReceipt;

  return (
    <div className="fixed inset-0 z-30 flex flex-col md:items-center md:justify-center md:bg-[rgba(28,27,26,0.42)] md:p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full h-full bg-white md:h-auto md:max-h-[85vh] md:max-w-[640px] md:rounded-[20px] md:shadow-modal overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 md:px-7 md:py-0 md:mb-1 border-b border-border md:border-b-0 md:pt-7">
          <div className="text-base md:text-lg font-extrabold">{isEdit ? "Edit expense" : "Add expense"}</div>
          <button type="button" onClick={onClose} className="hs-icon-btn" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9a9284" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-5">
          <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-4">
            <div className="md:col-span-2">
              {receiptPhotoUrl ? (
                <div className="relative w-full max-w-[220px]">
                  <a href={receiptPhotoUrl} target="_blank" rel="noreferrer">
                    <img
                      src={receiptPhotoUrl}
                      alt="Receipt"
                      className="w-full max-h-40 object-cover rounded-xl2 border border-border"
                    />
                  </a>
                  <button
                    type="button"
                    onClick={() => setReceiptPhotoUrl(null)}
                    aria-label="Remove receipt photo"
                    className="hs-icon-btn absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shadow-card"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b665d" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleReceiptFile}
                    className="hidden"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploadingReceipt}
                    className="flex-1 md:max-w-[180px] border-[1.5px] border-dashed border-border-dashed rounded-xl2 p-4 flex flex-col items-center gap-1.5 bg-white disabled:opacity-60"
                  >
                    <CameraIcon />
                    <div className="text-xs text-ink-soft font-medium">
                      {uploadingReceipt ? "Uploading..." : "Take Photo"}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingReceipt}
                    className="flex-1 md:max-w-[180px] border-[1.5px] border-dashed border-border-dashed rounded-xl2 p-4 flex flex-col items-center gap-1.5 bg-white disabled:opacity-60"
                  >
                    <GalleryIcon />
                    <div className="text-xs text-ink-soft font-medium">
                      {uploadingReceipt ? "Uploading..." : "From Gallery"}
                    </div>
                  </button>
                </div>
              )}
              {receiptError && <div className="text-xs text-danger mt-1.5">{receiptError}</div>}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] text-muted font-bold tracking-wide">DESCRIPTION</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beach shack dinner"
                className="hs-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-bold tracking-wide">AMOUNT</label>
              <div className="flex items-center bg-white border border-border rounded-xl2 px-3">
                <span className="text-ink-soft text-sm font-semibold pr-2 border-r border-border mr-2">₹ INR</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 border-none py-3 text-lg font-bold outline-none min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-bold tracking-wide">DATE</label>
              <div className="flex items-center gap-2.5 bg-white border border-border rounded-xl2 px-3.5 py-2.5">
                <CalendarIcon />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="flex-1 border-none outline-none text-sm bg-transparent min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-bold tracking-wide">PAID BY</label>
              <select
                value={paidByUserId}
                onChange={(e) => setPaidByUserId(Number(e.target.value))}
                className="hs-input"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userId === currentUser?.id ? "You" : m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-bold tracking-wide">CATEGORY</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="hs-input">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] text-muted font-bold tracking-wide">SPLIT</label>
              <div className="flex bg-border rounded-[11px] p-1 gap-1">
                {[
                  { value: "EQUAL", label: "Equally" },
                  { value: "UNEQUAL", label: "Unequally" },
                  { value: "PERCENTAGE", label: "Percentage" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setSplitType(opt.value)}
                    className={`flex-1 text-center py-2 rounded-[8px] text-[13px] font-semibold ${
                      splitType === opt.value ? "bg-white text-ink shadow-sm" : "text-ink-soft/70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] text-muted font-bold tracking-wide">
                SPLIT AMONG ({selectedMembers.length})
              </label>
              <div className="flex flex-col bg-white border border-border rounded-xl2 overflow-hidden">
                {members.map((m, i) => {
                  const isIncluded = included.has(m.userId);
                  const label = m.userId === currentUser?.id ? "You" : m.name;
                  return (
                    <div
                      key={m.userId}
                      className={`flex items-center justify-between px-3.5 py-3 ${
                        i < members.length - 1 ? "border-b border-border-light" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold"
                          style={{ background: colorFor(m.name) }}
                        >
                          {initial(m.name)}
                        </div>
                        <div className="text-sm">{label}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isIncluded && splitType === "EQUAL" && (
                          <div className="text-sm font-semibold">{formatINR(equalShare)}</div>
                        )}
                        {isIncluded && splitType !== "EQUAL" && (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={shares[m.userId] ?? ""}
                            onChange={(e) => setShares((s) => ({ ...s, [m.userId]: e.target.value }))}
                            placeholder={splitType === "PERCENTAGE" ? "%" : "0.00"}
                            className="w-20 border border-border rounded-lg px-2 py-1 text-sm text-right"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => toggleMember(m.userId)}
                          className={`w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0 ${
                            isIncluded ? "bg-brand" : "border border-border"
                          }`}
                        >
                          {isIncluded && <CheckIcon />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] text-muted font-bold tracking-wide">NOTES</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note (optional)"
                rows={3}
                className="hs-input resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5 mt-4">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 md:px-7 md:py-5 border-t border-border bg-white flex md:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="hs-btn-outline hidden md:inline-flex rounded-xl2 border border-border px-5 py-2.5 text-sm font-bold text-ink-soft"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="hs-btn-primary rounded-xl2 md:rounded-[11px] w-full md:w-auto py-3.5 md:py-2.5 md:px-6 text-[15px] md:text-sm font-bold"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
