import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { getSettleUpLink, markSettled } from "../api/settlement";
import { colorFor, initial } from "../utils/avatarColor";
import { formatINR } from "../utils/format";
import { CopyIcon, ExternalLinkIcon } from "./icons";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message && data.message !== "No message available") return data.message;
  if (data?.error) return data.error;
  return fallback;
}

export default function SettleUpModal({ groupId, otherUserId, otherUserName, groupName, onClose, onSettled }) {
  const [tab, setTab] = useState("qr");
  const [link, setLink] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSettleUpLink(groupId, otherUserId)
      .then(async (data) => {
        if (cancelled) return;
        setLink(data);
        try {
          const dataUrl = await QRCode.toDataURL(data.upiDeepLink, { margin: 1, width: 220 });
          if (!cancelled) setQrDataUrl(dataUrl);
        } catch {
          // QR rendering is a nicety — the link/copy/open options still work without it.
        }
      })
      .catch((err) => {
        if (!cancelled) setError(extractError(err, "Couldn't load settle-up details."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, otherUserId]);

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.upiDeepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be blocked — the link is still shown on screen to copy manually.
    }
  }

  async function handleMarkSettled() {
    setSettling(true);
    setError(null);
    try {
      await markSettled(groupId, otherUserId);
      onSettled?.();
    } catch (err) {
      setError(extractError(err, "Couldn't mark this as settled."));
      setSettling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(28,27,26,0.42)] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[20px] shadow-modal max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="text-base font-extrabold">Settle up</div>
          <button type="button" onClick={onClose} className="hs-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9a9284" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full text-white flex items-center justify-center text-[15px] font-bold flex-shrink-0"
              style={{ background: colorFor(otherUserName) }}
            >
              {initial(otherUserName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold truncate">{otherUserName}</div>
              {groupName && <div className="text-xs text-muted mt-0.5">{groupName}</div>}
            </div>
            {link && (
              <div className="text-right">
                <div className="text-[11px] text-muted font-semibold">YOU OWE</div>
                <div className="text-lg font-bold text-danger">{formatINR(link.amount)}</div>
              </div>
            )}
          </div>

          {loading && <div className="text-sm text-muted py-8 text-center">Loading...</div>}

          {error && !loading && (
            <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5 mt-4">
              {error}
            </div>
          )}

          {!loading && link && (
            <>
              <div className="flex bg-border rounded-xl2 p-1 mt-5 gap-1">
                <button
                  type="button"
                  onClick={() => setTab("qr")}
                  className={`flex-1 text-center py-2 rounded-[9px] text-[13px] font-bold ${
                    tab === "qr" ? "bg-white shadow-sm" : "text-muted font-semibold"
                  }`}
                >
                  Scan QR
                </button>
                <button
                  type="button"
                  onClick={() => setTab("link")}
                  className={`flex-1 text-center py-2 rounded-[9px] text-[13px] font-bold ${
                    tab === "link" ? "bg-white shadow-sm" : "text-muted font-semibold"
                  }`}
                >
                  Payment Link
                </button>
              </div>

              {tab === "qr" ? (
                <div className="bg-white border border-border rounded-xl2 p-6 mt-4 flex flex-col items-center gap-3.5">
                  <div className="w-[184px] h-[184px] rounded-xl2 border border-border p-2 flex items-center justify-center">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="UPI QR code" className="w-full h-full" />
                    ) : (
                      <div className="text-xs text-muted">Generating QR...</div>
                    )}
                  </div>
                  <div className="text-[13px] font-bold font-mono">{link.upiId}</div>
                  <div className="text-xs text-muted text-center leading-relaxed">
                    Scan with any UPI app — Google Pay, PhonePe, Paytm and more
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-xl2 p-5 mt-4 flex flex-col gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-muted tracking-wide mb-1.5">PAYING</div>
                    <div className="flex items-center justify-between bg-surface rounded-lg px-3 py-2.5">
                      <span className="text-[13px] font-bold font-mono">{link.upiId}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-muted tracking-wide mb-1.5">UPI LINK</div>
                    <div className="bg-surface rounded-lg px-3 py-2.5 text-[11.5px] font-mono text-ink-soft leading-relaxed break-all">
                      {link.upiDeepLink}
                    </div>
                  </div>
                  <button type="button" onClick={handleCopy} className="hs-btn-outline border border-brand rounded-xl2 py-3 text-center text-brand text-[13px] font-bold flex items-center justify-center gap-2">
                    <CopyIcon color="#d9730d" />
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <a
                    href={link.upiDeepLink}
                    className="hs-btn-primary rounded-xl2 py-3 text-center text-white text-[13px] font-bold flex items-center justify-center gap-2"
                  >
                    <ExternalLinkIcon color="#fff" />
                    Open in UPI app
                  </a>
                </div>
              )}

              <div className="mt-4 p-3.5 border-[1.3px] border-dashed border-border-dashed rounded-xl2">
                <div className="text-xs font-bold text-ink-soft mb-1">After you pay</div>
                <div className="text-xs text-muted leading-relaxed">
                  There's no payment gateway watching this — so either you or {otherUserName} can mark it settled once the money has actually moved.
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && link && (
          <div className="px-5 pb-5 pt-1 border-t border-border sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={handleMarkSettled}
              disabled={settling}
              className="hs-btn-primary w-full rounded-xl2 py-3.5 text-center text-white text-sm font-bold mt-4"
            >
              {settling ? "Marking..." : "I've paid — Mark as settled"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
