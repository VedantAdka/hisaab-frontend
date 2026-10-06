import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Shown on the Groups screen until the user has a UPI ID set — without one,
// anyone trying to settle up with them has nothing to pay (no QR/link).
export default function UpiIdNudge() {
  const { user } = useAuth();

  // Still loading (upiId undefined) or already set — nothing to show.
  if (!user || user.upiId === undefined || user.upiId) return null;

  return (
    <div className="mx-4 mt-4 md:mx-10 md:mt-8 flex items-center gap-3 bg-brand-tint rounded-xl2 px-4 py-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b5570f" strokeWidth="2" className="flex-shrink-0">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 16v-4M12 8h.01"></path>
      </svg>
      <div className="text-[13px] text-[#8a4a0f] font-semibold flex-1">
        Add your UPI ID so friends can pay you back directly.
      </div>
      <Link
        to="/profile"
        className="hs-btn-outline flex-shrink-0 rounded-lg border border-brand text-brand-dark text-xs font-bold px-3 py-1.5 whitespace-nowrap"
      >
        Add UPI ID
      </Link>
    </div>
  );
}
