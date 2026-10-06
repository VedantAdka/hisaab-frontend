export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel, confirming }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(28,27,26,0.42)] px-4">
      <div className="w-full max-w-[380px] bg-white rounded-[20px] p-6 shadow-modal">
        <div className="text-base font-extrabold mb-2">{title}</div>
        <div className="text-sm text-ink-soft leading-relaxed mb-6">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="hs-btn-outline rounded-xl2 border border-border px-5 py-2.5 text-sm font-bold text-ink-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="hs-btn-danger bg-danger-bg border-[1.3px] border-danger-border rounded-xl2 px-5 py-2.5 text-sm font-bold text-danger"
          >
            {confirming ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
