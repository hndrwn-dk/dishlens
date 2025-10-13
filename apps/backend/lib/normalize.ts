const MAP: Record<string, string> = {
  "bell pepper": "capsicum",
  "sweet pepper": "capsicum",
  "spring onion": "scallion",
  courgette: "zucchini",
  tomatoes: "tomato",
  chilis: "chili"
};

export const PANTRY = new Set(["salt", "pepper", "oil"]);

export function canonicalize(name: string) {
  const n = (name || "").toLowerCase().trim();
  if (!n) return n;
  return MAP[n] ?? n.replace(/s\b/, ""); // crude singular
}