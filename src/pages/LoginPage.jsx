import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { GroupsIcon, PencilIcon, ExternalLinkIcon } from "../components/icons";

const FEATURES = [
  { Icon: GroupsIcon, text: "Split any expense with your group" },
  { Icon: PencilIcon, text: "Fewest possible payments to settle up" },
  { Icon: ExternalLinkIcon, text: "Pay by UPI QR or link, no gateway needed" },
];

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login({ email, password });
    if (ok) navigate("/groups");
  }

  return (
    <div className="min-h-screen flex bg-surface md:bg-white">
      {/* Desktop brand panel */}
      <div className="hidden md:flex md:w-[58%] bg-brand flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute w-[520px] h-[520px] rounded-full bg-white/[0.06] -top-[140px] -left-[120px]" />
        <div className="absolute w-[360px] h-[360px] rounded-full bg-white/[0.06] -bottom-[100px] -right-[80px]" />

        <div className="relative w-[110px] h-[110px] rounded-[26px] overflow-hidden mb-6 shadow-card-lg">
          <img src={new URL("../assets/hisaab-icon.png", import.meta.url).href} alt="Hisaab" className="w-full h-full object-cover block" />
        </div>
        <div className="relative text-4xl font-extrabold text-white tracking-tight">Hisaab</div>
        <div className="relative text-base text-[#fbe7d4] mt-2 font-semibold">Chalo, Hisaab karte hain</div>

        <div className="relative mt-14 flex flex-col gap-4 w-[340px]">
          {FEATURES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-white/[0.16] flex items-center justify-center flex-shrink-0">
                <Icon color="#fff" size={17} />
              </div>
              <span className="text-sm text-white font-semibold">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[360px] flex flex-col gap-4">
          <div className="md:hidden flex flex-col items-center mb-4 gap-3">
            <Logo size={72} wordmark={false} />
            <div className="text-2xl font-extrabold text-wordmark">Hisaab</div>
            <div className="text-sm text-tagline font-semibold">Chalo, Hisaab karte hain</div>
          </div>

          <div className="hidden md:block mb-2">
            <div className="text-2xl font-extrabold">Welcome back</div>
            <div className="text-[13.5px] text-muted mt-1">Log in to see what everyone owes</div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-bold text-ink-soft mb-1.5">Email</div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-border rounded-xl2 px-3.5 py-3 text-sm text-ink-soft outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <div className="text-xs font-bold text-ink-soft mb-1.5">Password</div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                className="w-full bg-white border border-border rounded-xl2 px-3.5 py-3 text-sm text-ink-soft outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-dark hover:text-brand-darker"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="hs-btn-primary rounded-xl2 py-[15px] text-center text-sm font-bold mt-1.5"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="flex items-center gap-2.5 my-1.5">
            <div className="flex-1 h-px bg-border" />
            <div className="text-[11px] text-muted-light font-semibold">OR</div>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="text-center text-[13px] text-ink-soft">
            Don't have an account?{" "}
            <Link to="/register" className="hs-icon-btn font-bold text-brand-dark">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
