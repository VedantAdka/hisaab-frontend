import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    upiId: "",
  });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updatePhone(e) {
    // Keep only digits as they type — RegisterRequest validates phoneNumber
    // as exactly 10 digits with no +91 prefix (unlike profile-update, which
    // does accept one); the "+91" shown next to the field is display-only.
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phoneNumber: digits }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate("/groups");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-[360px] flex flex-col gap-4">
        <div className="flex flex-col items-center mb-2 gap-2">
          <Logo size={64} wordmark={false} />
          <div className="text-xl font-extrabold text-wordmark">Create your account</div>
          <div className="text-[13px] text-muted text-center">Split expenses with your friends, the easy way</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full name">
            <input
              type="text"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Aman Patel"
              className="hs-input"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className="hs-input"
            />
          </Field>

          <Field label="Phone number">
            <div className="flex items-center gap-2 bg-white border border-border rounded-xl2 px-3.5 py-3 focus-within:border-brand transition-colors">
              <span className="text-sm text-muted font-semibold">+91</span>
              <input
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                title="Enter a valid 10-digit Indian mobile number"
                value={form.phoneNumber}
                onChange={updatePhone}
                placeholder="98765 43210"
                className="flex-1 outline-none text-sm text-ink-soft bg-transparent"
              />
            </div>
          </Field>

          <Field label="Password">
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={update("password")}
              placeholder="At least 6 characters"
              className="hs-input"
            />
          </Field>

          <Field label="UPI ID (optional)">
            <input
              type="text"
              value={form.upiId}
              onChange={update("upiId")}
              placeholder="you@okbank"
              className="hs-input"
            />
          </Field>

          {error && (
            <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="hs-btn-primary rounded-xl2 py-[15px] text-center text-sm font-bold mt-1"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="text-center text-[13px] text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="hs-icon-btn font-bold text-brand-dark">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs font-bold text-ink-soft mb-1.5">{label}</div>
      {children}
    </div>
  );
}
