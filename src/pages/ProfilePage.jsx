import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, updateUpiId } from "../api/users";
import { PencilIcon } from "../components/icons";
import { initial } from "../utils/avatarColor";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message && data.message !== "No message available") return data.message;
  if (data?.error) return data.error;
  return fallback;
}

function EditableRow({ label, value, placeholder, onSave, validate, monospace }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function startEdit() {
    setDraft(value || "");
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    const trimmed = draft.trim();
    const validationError = validate?.(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch (err) {
      setError(extractError(err, "Couldn't save that."));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="py-3 px-4">
        <div className="text-[11px] text-muted font-semibold mb-1.5">{label}</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className={`hs-input ${monospace ? "font-mono" : ""}`}
          />
          <button type="button" onClick={handleSave} disabled={saving} className="hs-btn-primary rounded-lg px-3 py-2.5 text-xs font-bold whitespace-nowrap">
            {saving ? "..." : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="hs-icon-btn text-muted px-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9284" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        {error && <div className="text-xs text-danger mt-1.5">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3.5 px-4">
      <div>
        <div className="text-[11px] text-muted font-semibold mb-0.5">{label}</div>
        <div className={`text-sm font-semibold ${monospace ? "font-mono" : ""} ${value ? "" : "text-muted-light font-normal"}`}>
          {value || placeholder}
        </div>
      </div>
      <button type="button" onClick={startEdit} className="hs-icon-btn">
        <PencilIcon />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();

  return (
    <div>
      <div className="px-4 pt-5 pb-2 md:px-10 md:pt-8">
        <div className="text-xl md:text-2xl font-extrabold">Profile</div>
      </div>

      <div className="px-4 pb-24 md:px-10 md:pb-10 md:max-w-[560px] flex flex-col gap-5 pt-4">
        <div className="flex items-center gap-3.5">
          <div className="w-[58px] h-[58px] rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            {initial(user?.name)}
          </div>
          <div>
            <div className="text-[17px] font-bold">{user?.name || "..."}</div>
            <div className="text-[13px] text-muted mt-0.5">{user?.email}</div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-muted tracking-wide mb-2">PERSONAL INFO</div>
          <div className="bg-white rounded-xl2 overflow-hidden divide-y divide-border-light">
            <EditableRow
              label="Name"
              value={user?.name}
              placeholder="Your name"
              validate={(v) => (!v ? "Name can't be empty." : null)}
              onSave={async (name) => {
                const updated = await updateProfile({ name, phoneNumber: user?.phoneNumber || "" });
                setUser((prev) => ({ ...prev, ...updated }));
              }}
            />
            <div className="flex items-center justify-between py-3.5 px-4">
              <div>
                <div className="text-[11px] text-muted font-semibold mb-0.5">Email</div>
                <div className="text-sm font-semibold text-ink-soft">{user?.email}</div>
              </div>
              <span className="text-[10px] text-muted-light font-semibold">CAN'T BE CHANGED</span>
            </div>
            <EditableRow
              label="Phone number"
              value={user?.phoneNumber}
              placeholder="10-digit mobile number"
              validate={(v) => (!/^[6-9]\d{9}$/.test(v.replace(/\D/g, "")) ? "Enter a valid 10-digit Indian mobile number." : null)}
              onSave={async (phone) => {
                const digits = phone.replace(/\D/g, "").slice(-10);
                const updated = await updateProfile({ name: user?.name, phoneNumber: digits });
                setUser((prev) => ({ ...prev, ...updated }));
              }}
            />
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-muted tracking-wide mb-2">PAYMENT SETTINGS</div>
          <div className="bg-white rounded-xl2 p-1">
            <EditableRow
              label="Your UPI ID"
              value={user?.upiId}
              placeholder="name@bank"
              monospace
              validate={(v) => (!/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(v) ? "Enter a valid UPI ID, e.g. name@okhdfcbank" : null)}
              onSave={async (upiId) => {
                const updated = await updateUpiId(upiId);
                setUser((prev) => ({ ...prev, ...updated }));
              }}
            />
          </div>
          <div className="text-[11.5px] text-muted leading-relaxed mt-2 px-1">
            Shown to group-mates as a QR code and payment link when they settle up with you.
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="hs-btn-danger bg-danger-bg border-[1.3px] border-danger-border rounded-xl2 py-3.5 text-center text-danger text-sm font-bold"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
