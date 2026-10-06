import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { requestPasswordReset } from "../api/auth";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.error) return data.error;
  if (data?.message && data.message !== "No message available") return data.message;
  return fallback;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(extractError(err, "Couldn't send the reset email. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`If ${email.trim()} has a Hisaab account, a reset link is on its way. It works once and expires in 30 minutes.`}
      >
        <div className="text-[13px] text-ink-soft bg-brand-tint rounded-xl2 px-3.5 py-3 leading-relaxed">
          Nothing after a minute or two? Check your spam folder, or try again with a different email.
        </div>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            setError(null);
          }}
          className="hs-btn-outline rounded-xl2 border border-border py-3 text-center text-sm font-bold text-ink-soft"
        >
          Try a different email
        </button>

        <div className="text-center text-[13px] text-ink-soft mt-1">
          <Link to="/login" className="font-bold text-brand-dark">
            Back to log in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter the email you signed up with and we'll send you a link to set a new one."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="text-xs font-bold text-ink-soft mb-1.5">Email</div>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
          disabled={submitting || !email.trim()}
          className="hs-btn-primary rounded-xl2 py-[15px] text-center text-sm font-bold mt-1.5"
        >
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="text-center text-[13px] text-ink-soft mt-2">
        Remembered it?{" "}
        <Link to="/login" className="font-bold text-brand-dark">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
