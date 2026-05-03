import { ExternalLink } from "lucide-react";
import React from 'react';
import { RATING, RISK, DEMAND } from "../lib/constants";
import type { DealItem } from "../types";
import { cn } from "../lib/utils";

interface DealCardProps {
  key?: React.Key;
  item: DealItem;
  idx?: number;
  isTop?: boolean;
}

export function DealCard({ item, isTop }: DealCardProps) {
  const ratingData = RATING[item.deal_rating] || RATING.B;
  const riskData = RISK[item.risk] || RISK.Medium;
  const demandData = DEMAND[item.demand] || DEMAND.Medium;

  return (
    <div className={cn(
      "bg-slate-900 border rounded-3xl p-5 sm:p-6 relative flex flex-col gap-5 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl",
      isTop ? "border-indigo-500" : "border-slate-800"
    )}>
      {isTop && (
        <div className="absolute -top-[1px] right-6 bg-indigo-500 text-white text-[10px] sm:text-[9px] font-bold px-4 py-1.5 rounded-b-xl tracking-widest uppercase shadow-md shadow-indigo-500/20">
          Best ROI
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1 pr-2">
          <div className="text-lg font-bold text-white mb-1 tracking-tight">{item.item}</div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-700"></span>
             {item.category}
             <span className="w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-700"></span>
             {item.platforms}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap sm:justify-end">
          <span 
            className="text-[10px] font-bold px-3 py-1 rounded-xl"
            style={{ backgroundColor: ratingData.bg, color: ratingData.color }}
          >
            {ratingData.label} &middot; {ratingData.full}
          </span>
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-xl"
            style={{ backgroundColor: riskData.bg, color: riskData.color }}
          >
            {item.risk} Risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-[1px] bg-slate-800 rounded-2xl overflow-hidden shrink-0 mt-2">
        <MetricCard label="Buy for" val={typeof item.buy_price === 'number' ? item.buy_price.toLocaleString() : item.buy_price} unit="AED" />
        <MetricCard label="Sell for" val={typeof item.sell_price === 'number' ? item.sell_price.toLocaleString() : item.sell_price} unit="AED" />
        <MetricCard label="Profit" val={`+${typeof item.margin_aed === 'number' ? item.margin_aed.toLocaleString() : item.margin_aed}`} unit="AED" accentClass="text-emerald-400 font-bold" />
        <MetricCard label="ROI" val={`${item.roi_pct}`} unit="%" accentClass="text-indigo-400 font-bold" />
        <MetricCard label="Flip time" val={`~${item.days_to_sell || "?"}`} unit="days" />
      </div>

      <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800/50 mt-1">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex-shrink-0">Demand</div>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden shrink border border-slate-700/50">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ 
              backgroundColor: demandData.color, 
              width: item.demand === "High" ? "85%" : (item.demand === "Medium" ? "50%" : "25%") 
            }} 
          />
        </div>
        <div className="text-[10px] font-bold flex-shrink-0 text-right w-12 tracking-wide" style={{ color: demandData.color }}>{item.demand}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto pt-2">
        <div className="bg-slate-950 border border-slate-800/50 rounded-2xl p-4 flex flex-col justify-start">
           <div className="text-[10px] text-slate-500 tracking-widest uppercase mb-2 font-semibold">Source on Dubizzle</div>
           <a 
             href={`https://www.dubizzle.com/search/?q=${encodeURIComponent(item.item)}`} 
             target="_blank" 
             rel="noreferrer"
             className="text-sm text-indigo-400 hover:text-indigo-300 font-medium leading-relaxed max-w-full truncate inline-block underline-offset-4 hover:underline"
           >
             {item.source} ↗
           </a>
        </div>
        <div className="bg-slate-950 border border-slate-800/50 rounded-2xl p-4 flex flex-col justify-start">
           <div className="text-[10px] text-slate-500 tracking-widest uppercase mb-2 font-semibold">How to relist</div>
           <div className="text-sm text-slate-300 leading-relaxed overflow-hidden text-ellipsis line-clamp-3" title={item.sell_tip}>
             {item.sell_tip}
           </div>
        </div>
      </div>

      {item.listing_url && (
        <a 
          href={item.listing_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-5 h-12 mt-2 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group shadow-sm bg-slate-950"
        >
          <span className="text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">View listing on Dubizzle</span>
          <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-transform group-hover:scale-110" />
        </a>
      )}
    </div>
  );
}

function MetricCard({ label, val, unit, accentClass }: { label: string; val: React.ReactNode; unit: string; accentClass?: string }) {
  return (
    <div className="bg-slate-950 p-3 sm:p-4 flex flex-col items-start justify-center">
      <div className="text-[9px] text-slate-500 tracking-widest uppercase font-semibold mb-1">{label}</div>
      <div className={cn("text-base sm:text-sm lg:text-base font-bold text-white truncate w-full tracking-tight", accentClass)}>
        {val}
      </div>
      <div className="text-[10px] text-slate-500 mt-1 font-medium">{unit}</div>
    </div>
  );
}
