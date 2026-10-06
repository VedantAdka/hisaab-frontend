// Same four accent colors used throughout the wireframes for member avatars.
const PALETTE = ["#d9730d", "#3f7ec4", "#c25b8f", "#4c9a6a"];

export function colorFor(seed) {
  if (!seed) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function initial(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}
