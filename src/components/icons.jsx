// Small inline icon set, lifted directly from the wireframes so the built
// app uses exactly the same iconography.

export function GroupsIcon({ color = "currentColor", size = 21 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3"></circle>
      <path d="M2 20c0-3 3-5 7-5s7 2 7 5"></path>
      <circle cx="17" cy="8" r="2.5"></circle>
      <path d="M22 20c0-2.5-2-4.3-5-4.9"></path>
    </svg>
  );
}

export function ActivityIcon({ color = "currentColor", size = 21 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7v5l3 3"></path>
    </svg>
  );
}

export function ProfileIcon({ color = "currentColor", size = 21 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"></circle>
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7"></path>
    </svg>
  );
}

export function PencilIcon({ color = "#d9730d", size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
}

export function PlusIcon({ color = "#fff", size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"></path>
    </svg>
  );
}

export function ExternalLinkIcon({ color = "currentColor", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <path d="M15 3h6v6"></path>
      <path d="M10 14L21 3"></path>
    </svg>
  );
}

export function KebabIcon({ color = "#1c1b1a", size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="5" r="1.8"></circle>
      <circle cx="12" cy="12" r="1.8"></circle>
      <circle cx="12" cy="19" r="1.8"></circle>
    </svg>
  );
}

export function BackIcon({ color = "#1c1b1a", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"></path>
    </svg>
  );
}

export function ChevronDownIcon({ color = "#8a8478", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  );
}

export function CheckIcon({ color = "#fff", size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L19 7"></path>
    </svg>
  );
}

export function CameraIcon({ color = "#a39c8e", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"></path>
      <circle cx="12" cy="13" r="3.3"></circle>
    </svg>
  );
}

export function GalleryIcon({ color = "#a39c8e", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <path d="M21 15l-5-5L5 21"></path>
    </svg>
  );
}

export function CalendarIcon({ color = "#8a8478", size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"></rect>
      <path d="M16 3v4M8 3v4M3 10h18"></path>
    </svg>
  );
}

export function CopyIcon({ color = "#9a9284", size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2"></rect>
      <path d="M5 15V5a2 2 0 0 1 2-2h10"></path>
    </svg>
  );
}

export function InfoIcon({ color = "#b5570f", size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 16v-4M12 8h.01"></path>
    </svg>
  );
}

// Category icons — mapped to the Category enum values the backend uses
// (FOOD, TRAVEL, RENT, SHOPPING, FUN, OTHER).
export function CategoryIcon({ category, color = "#d9730d", size = 19 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (category) {
    case "FOOD":
      // Burger: bun dome, patty stripe, cheese/lettuce stripe, bottom bun.
      return (
        <svg {...common}>
          <path d="M4 10c0-3.5 3.5-6 8-6s8 2.5 8 6"></path>
          <path d="M3 10h18"></path>
          <path d="M4 13.5h16"></path>
          <path d="M2.5 17h19a1 1 0 0 1 1 1 2.5 2.5 0 0 1-2.5 2.5h-16A2.5 2.5 0 0 1 1.5 18a1 1 0 0 1 1-1z"></path>
        </svg>
      );
    case "TRAVEL":
      return <svg {...common}><path d="M3 12h18M3 12l3-7h12l3 7M3 12v6a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-6"></path></svg>;
    case "RENT":
      return <svg {...common}><path d="M4 21V10l8-6 8 6v11M9 21v-6h6v6"></path></svg>;
    case "SHOPPING":
      // Classic shopping cart with two wheels.
      return (
        <svg {...common}>
          <path d="M2 3h2l2.6 12.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 8H6"></path>
          <circle cx="9" cy="20" r="1.4" fill={color} stroke="none"></circle>
          <circle cx="18" cy="20" r="1.4" fill={color} stroke="none"></circle>
        </svg>
      );
    case "FUN":
      // Party popper: cone shooting confetti.
      return (
        <svg {...common}>
          <path d="M4 20L9 9l6 6-11 5z"></path>
          <path d="M9 9l2-5"></path>
          <path d="M15 15l5-2"></path>
          <circle cx="19" cy="5" r="1" fill={color} stroke="none"></circle>
          <circle cx="14" cy="4" r="1" fill={color} stroke="none"></circle>
          <circle cx="20" cy="10" r="1" fill={color} stroke="none"></circle>
        </svg>
      );
    default:
      // Other: a plain tag/label — reads as "misc" without competing with the rest.
      return (
        <svg {...common}>
          <path d="M12.6 2H4a2 2 0 0 0-2 2v8.6a2 2 0 0 0 .59 1.41l9.4 9.4a2 2 0 0 0 2.82 0l8.6-8.6a2 2 0 0 0 0-2.82l-9.4-9.4A2 2 0 0 0 12.6 2z"></path>
          <circle cx="7.5" cy="7.5" r="1.5" fill={color} stroke="none"></circle>
        </svg>
      );
  }
}

export const CATEGORIES = [
  { value: "FOOD", label: "Food" },
  { value: "TRAVEL", label: "Travel" },
  { value: "RENT", label: "Rent" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "FUN", label: "Fun" },
  { value: "OTHER", label: "Other" },
];
