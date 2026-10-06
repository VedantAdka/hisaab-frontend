import hisaabIcon from "../assets/hisaab-icon.png";

export default function Logo({ size = 36, wordmark = true, wordmarkSize = "text-lg" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-[10px] overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <img src={hisaabIcon} alt="Hisaab" className="w-full h-full object-cover block" />
      </div>
      {wordmark && (
        <span className={`${wordmarkSize} font-extrabold text-wordmark tracking-tight`}>
          Hisaab
        </span>
      )}
    </div>
  );
}
