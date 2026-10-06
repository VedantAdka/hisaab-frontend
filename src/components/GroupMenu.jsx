import { useEffect, useRef, useState } from "react";
import { KebabIcon, PencilIcon } from "./icons";

// Only rendered with handlers when the current user created the group
// (checked by the caller against group.createdByUserId) — the backend also
// enforces this, but there's no point showing the options otherwise.
export default function GroupMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="hs-icon-btn p-1 -m-1"
        aria-label="Group options"
      >
        <KebabIcon color="#1c1b1a" size={18} />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-48 bg-white border border-border rounded-xl2 shadow-card py-1.5 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="hs-btn-outline w-full flex items-center gap-2.5 px-3.5 py-2 text-left"
            >
              <PencilIcon color="#6b665d" size={15} />
              <span className="text-[13px] font-semibold text-ink-soft">Edit group</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="hs-btn-danger w-full flex items-center gap-2.5 px-3.5 py-2 text-left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c14a4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z"></path>
              </svg>
              <span className="text-[13px] font-semibold text-danger">Delete group</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
