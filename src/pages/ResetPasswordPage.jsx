import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { resetPassword } from "../api/auth";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.error) return data.error;
  if (data?.message && data.message !== "No message available") return data.message;
  return fallback;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword({ token, newPassword: password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(extractError(err, "Couldn't reset your password. The link may have expired."));
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        title="Link not valid"
        subtitle="This page needs a reset link from your email. Request a fresh one and open the link it sends you."
      >
        <Link
          to="/forgot-password"
          className="hs-btn-primary rounded-xl2 py-[15px] text-center text-sm font-bold text-white"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can log in with your new password now.">
        <div className="text-[13px] text-ink-soft bg-brand-tint rounded-xl2 px-3.5 py-3">
          Taking you to the login page...
        </div>
        <Link
          to="/login"
          className="hs-btn-primary rounded-xl2 py-[15px] text-center text-sm font-bold text-white"
        >
          Log in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Pick something you'll remember — at least 6 characters.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="text-xs font-bold text-ink-soft mb-1.5">New password</div>
          <input
            type="password"
            required
            autoFocus
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-white border border-border rounded-xl2 px-3.5 py-3 text-sm text-ink-soft outline-none focus:border-brand transition-colors"
          />
        </div>

        <div>
          <div className="text-xs font-bold text-ink-soft mb-1.5">Confirm new password</div>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
            className="w-full bg-white border border-border rounded-xl2 px-3.5 py-3 text-sm text-ink-soft outline-none focus:border-brand transition-colors"
          />
        </div>

        {error && (
          <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || password.length < 6 || confirm.length < 6}
          className="hs-btn-primary rounded-xl2 py-[15px] text-center text-sm font-bold mt-1.5"
        >
          {submitting ? "Saving..." : "Save new password"}
        </button>
      </form>

      <div className="text-center text-[13px] text-ink-soft mt-2">
        <Link to="/login" className="font-bold text-brand-dark">
          Back to log in
        </Link>
      </div>
    </AuthLayout>
  );
}
