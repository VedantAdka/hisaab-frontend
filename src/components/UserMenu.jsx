import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KebabIcon, ProfileIcon } from "./icons";
import { useAuth } from "../context/AuthContext";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function goToProfile() {
    setOpen(false);
    navigate("/profile");
  }

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hs-icon-btn p-1 -m-1"
        aria-label="Account menu"
      >
        <KebabIcon color="#9a9284" size={15} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-44 bg-white border border-border rounded-xl2 shadow-card py-1.5 z-20">
          <button
            type="button"
            onClick={goToProfile}
            className="hs-nav-item w-full flex items-center gap-2.5 px-3.5 py-2 text-left"
          >
            <ProfileIcon color="#4a453d" size={16} />
            <span className="text-[13px] font-semibold text-ink-soft">View profile</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="hs-btn-danger w-full flex items-center gap-2.5 px-3.5 py-2 text-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c14a4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <path d="M16 17l5-5-5-5"></path>
              <path d="M21 12H9"></path>
            </svg>
            <span className="text-[13px] font-semibold text-danger">Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
