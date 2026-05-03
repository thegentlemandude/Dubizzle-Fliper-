export const CACHE_KEY = "flipper-scan-v3";

export const RATING: Record<string, { label: string; bg: string; color: string; border: string; full: string }> = {
  S: { label: "S", bg: "rgba(99, 102, 241, 0.1)", color: "#818cf8", border: "rgba(99, 102, 241, 0.2)", full: "Exceptional" },
  A: { label: "A", bg: "rgba(16, 185, 129, 0.1)", color: "#34d399", border: "rgba(16, 185, 129, 0.2)", full: "Strong" },
  B: { label: "B", bg: "rgba(100, 116, 139, 0.1)", color: "#94a3b8", border: "rgba(100, 116, 139, 0.2)", full: "Decent" },
  C: { label: "C", bg: "rgba(244, 63, 94, 0.1)", color: "#fb7185", border: "rgba(244, 63, 94, 0.2)", full: "Thin" },
};

export const RISK: Record<string, { color: string; bg: string }> = {
  Low: { color: "#34d399", bg: "rgba(16, 185, 129, 0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  High: { color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" }
};

export const DEMAND: Record<string, { color: string }> = {
  High: { color: "#34d399" },
  Medium: { color: "#f59e0b" },
  Low: { color: "#94a3b8" }
};

export const CATS = ["All", "Electronics", "Sneakers", "Gaming", "Watches", "Accessories"];

export const DIFF_ORDER: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
