import { cn } from "../lib/utils";

interface StatCardProps {
  label: string;
  val: string | number;
  sub?: string;
  accentClass?: string;
}

export function StatCard({ label, val, sub, accentClass }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between h-full">
      <p className="text-[10px] text-slate-500 mb-3 tracking-widest uppercase font-semibold">{label}</p>
      <div className="flex items-end gap-3 mt-1">
        <span className={cn("text-3xl font-bold text-white leading-none tracking-tight", accentClass)}>{val}</span>
        {sub && <span className="text-slate-500 text-[11px] font-medium mb-0.5">{sub}</span>}
      </div>
    </div>
  );
}
