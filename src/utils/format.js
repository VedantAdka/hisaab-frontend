export function formatINR(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function todayISO() {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "2026-09-08" -> "8 SEPTEMBER"
export function formatDateHeader(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" }).toUpperCase();
}

// "2026-09-08" -> "Today, 8 Sep 2026" / "Yesterday, ..." / "8 Sep 2026"
export function formatDateFriendly(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / 86400000);
  const dayMonthYear = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (diffDays === 0) return `Today, ${dayMonthYear}`;
  if (diffDays === -1) return `Yesterday, ${dayMonthYear}`;
  return dayMonthYear;
}

// Instant string -> "10 minutes ago" / "2 hours ago" / "1 day ago" / date
export function relativeTime(instantStr) {
  if (!instantStr) return "";
  const then = new Date(instantStr).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.round((now - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return new Date(instantStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Groups the label shown above date buckets: "TODAY" / "YESTERDAY" / "8 SEPTEMBER"
export function dayBucketLabel(instantStr) {
  const d = new Date(instantStr);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((day - today) / 86400000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === -1) return "YESTERDAY";
  return day.toLocaleDateString("en-IN", { day: "numeric", month: "long" }).toUpperCase();
}
