import Logo from "./Logo";

/**
 * The split-screen shell the login page uses — brand panel on desktop, plain
 * centered card on mobile. Shared by the password-reset screens so they don't
 * feel like a different app.
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-surface md:bg-white">
      <div className="hidden md:flex md:w-[58%] bg-brand flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute w-[520px] h-[520px] rounded-full bg-white/[0.06] -top-[140px] -left-[120px]" />
        <div className="absolute w-[360px] h-[360px] rounded-full bg-white/[0.06] -bottom-[100px] -right-[80px]" />

        <div className="relative w-[110px] h-[110px] rounded-[26px] overflow-hidden mb-6 shadow-card-lg">
          <img
            src={new URL("../assets/hisaab-icon.png", import.meta.url).href}
            alt="Hisaab"
            className="w-full h-full object-cover block"
          />
        </div>
        <div className="relative text-4xl font-extrabold text-white tracking-tight">Hisaab</div>
        <div className="relative text-base text-[#fbe7d4] mt-2 font-semibold">Chalo, Hisaab karte hain</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[360px] flex flex-col gap-4">
          <div className="md:hidden flex flex-col items-center mb-4 gap-3">
            <Logo size={72} wordmark={false} />
            <div className="text-2xl font-extrabold text-wordmark">Hisaab</div>
          </div>

          <div className="mb-2">
            <div className="text-2xl font-extrabold">{title}</div>
            {subtitle && <div className="text-[13.5px] text-muted mt-1 leading-relaxed">{subtitle}</div>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
