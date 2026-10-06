import { useState } from "react";
import { colorFor, initial } from "../utils/avatarColor";
import { formatINR } from "../utils/format";
import { InfoIcon } from "./icons";
import SettleUpModal from "./SettleUpModal";
import { sendReminder } from "../api/settlement";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message && data.message !== "No message available") return data.message;
  if (data?.error) return data.error;
  return fallback;
}

export default function BalancesTab({
  groupId,
  groupName,
  balanceData,
  simplified,
  onToggleSimplified,
  currentUserId,
  loading,
  error,
  onRefresh,
}) {
  const [settleTarget, setSettleTarget] = useState(null); // { userId, name }
  const [reminded, setRemindedFor] = useState(null);
  const [sendingReminderTo, setSendingReminderTo] = useState(null);
  const [remindError, setRemindError] = useState(null);

  if (loading) return <div className="text-sm text-muted py-6">Loading balances...</div>;
  if (error) {
    return (
      <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
        {error}
      </div>
    );
  }

  const settlements = balanceData?.settlements || [];
  const myRows = settlements
    .filter((s) => s.fromUserId === currentUserId || s.toUserId === currentUserId)
    .map((s) => {
      const iOwe = s.fromUserId === currentUserId;
      return {
        otherUserId: iOwe ? s.toUserId : s.fromUserId,
        otherName: iOwe ? s.toUserName : s.fromUserName,
        amount: s.amount,
        iOwe,
      };
    });

  const netTotal = myRows.reduce((sum, r) => sum + (r.iOwe ? -r.amount : r.amount), 0);
  const peopleCount = myRows.length;

  async function handleRemind(row) {
    setRemindError(null);
    setSendingReminderTo(row.otherUserId);
    try {
      await sendReminder(groupId, row.otherUserId);
      setRemindedFor(row.otherUserId);
      setTimeout(() => setRemindedFor(null), 2500);
    } catch (err) {
      setRemindError(extractError(err, `Couldn't send a reminder to ${row.otherName}.`));
    } finally {
      setSendingReminderTo(null);
    }
  }

  return (
    <div>
      <div className="bg-dark-card rounded-2xl p-5 md:p-6 flex flex-col gap-1 max-w-[420px] mb-4">
        <div className="text-xs text-dark-muted font-semibold tracking-wide">
          {netTotal >= 0 ? "YOU ARE OWED" : "YOU OWE"}
        </div>
        <div className="text-[28px] md:text-[32px] font-bold text-dark-gold">{formatINR(Math.abs(netTotal))}</div>
        <div className="text-xs text-muted mt-0.5">
          {peopleCount > 0 ? `across ${peopleCount} ${peopleCount === 1 ? "person" : "people"}` : "you're all settled up"}
        </div>
      </div>

      {onToggleSimplified && (
        <div className="flex bg-border rounded-xl2 p-1 mb-4 max-w-[320px] gap-1">
          <button
            type="button"
            onClick={() => onToggleSimplified(true)}
            className={`flex-1 text-center py-2 rounded-[9px] text-[12.5px] font-bold ${
              simplified ? "bg-white shadow-sm" : "text-muted font-semibold"
            }`}
          >
            Simplified
          </button>
          <button
            type="button"
            onClick={() => onToggleSimplified(false)}
            className={`flex-1 text-center py-2 rounded-[9px] text-[12.5px] font-bold ${
              !simplified ? "bg-white shadow-sm" : "text-muted font-semibold"
            }`}
          >
            Exact
          </button>
        </div>
      )}

      {peopleCount > 0 && (
        <div className="flex items-center gap-2 bg-brand-tint rounded-lg px-3 py-2.5 mb-5 max-w-[520px]">
          <InfoIcon />
          <div className="text-xs text-brand-darker font-semibold">
            {simplified
              ? "Balances are simplified so everyone owes as few people as possible"
              : "Showing exactly who shares an expense with whom — more payments, but each one is directly between two people who split something together"}
          </div>
        </div>
      )}

      {remindError && (
        <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5 mb-5 max-w-[520px]">
          {remindError}
        </div>
      )}

      {peopleCount === 0 ? (
        <div className="text-sm text-muted py-4">Nobody owes anybody anything here right now.</div>
      ) : (
        <div className="flex flex-col gap-2.5 md:grid md:grid-cols-3 md:gap-4">
          {myRows.map((row) => (
            <div key={row.otherUserId} className="hs-card flex items-center gap-3 md:flex-col md:items-stretch bg-white rounded-2xl p-3.5 md:p-5">
              <div className="flex items-center gap-3 md:gap-3 flex-1 min-w-0">
                <div
                  className="w-[38px] h-[38px] md:w-10 md:h-10 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: colorFor(row.otherName) }}
                >
                  {initial(row.otherName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{row.otherName}</div>
                  <div className={`text-[13px] font-semibold mt-0.5 ${row.iOwe ? "text-danger" : "text-success"}`}>
                    {row.iOwe ? `you owe ${formatINR(row.amount)}` : `owes you ${formatINR(row.amount)}`}
                  </div>
                </div>
              </div>
              {row.iOwe ? (
                <button
                  type="button"
                  onClick={() => setSettleTarget(row)}
                  className="hs-btn-primary rounded-[10px] px-4 py-2.5 md:py-2.5 text-xs font-bold whitespace-nowrap"
                >
                  Settle up
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRemind(row)}
                  disabled={sendingReminderTo === row.otherUserId}
                  className="hs-btn-outline rounded-[10px] px-4 py-2.5 border-[1.3px] border-brand text-brand text-xs font-bold whitespace-nowrap disabled:opacity-60"
                >
                  {sendingReminderTo === row.otherUserId
                    ? "Sending..."
                    : reminded === row.otherUserId
                    ? "Sent!"
                    : "Remind"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {settleTarget && (
        <SettleUpModal
          groupId={groupId}
          otherUserId={settleTarget.otherUserId}
          otherUserName={settleTarget.otherName}
          groupName={groupName}
          onClose={() => setSettleTarget(null)}
          onSettled={() => {
            setSettleTarget(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
