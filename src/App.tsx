import { useState, useEffect } from "react";
import { Radar } from "lucide-react";
import { scanMarket } from "./lib/genai";
import { CACHE_KEY, CATS } from "./lib/constants";
import { storage } from "./lib/utils";
import type { DealItem } from "./types";
import { StatCard } from "./components/StatCard";
import { DealCard } from "./components/DealCard";
import { DealsChart } from "./components/DealsChart";
import { BudgetControl } from "./components/BudgetControl";

export default function App() {
  const [items, setItems] = useState<DealItem[]>([]);
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setDone] = useState(false);
  const [cached, setCached] = useState(false);
  const [category, setCat] = useState("All");
  const [sortBy, setSort] = useState("roi_pct");
  const [diffFilter, setDiff] = useState("All");
  const [view, setView] = useState("dashboard");
  const [lastScan, setLast] = useState<Date | null>(null);
  const [budget, setBudget] = useState(2000);
  const [budgetDir, setDir] = useState("under");
  const [inputVal, setInput] = useState("2000");

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(CACHE_KEY);
        if (res?.value) {
          const data = JSON.parse(res.value);
          if (data.items?.length) {
            setItems(data.items);
            setBudget(data.budget || 2000);
            setInput(String(data.budget || 2000));
            setDir(data.budgetDir || "under");
            setLast(data.timestamp ? new Date(data.timestamp) : null);
            setDone(true);
            setCached(true);
          }
        }
      } catch {}
    })();
  }, []);

  const commitBudget = () => {
    const n = parseInt(inputVal.replace(/[^0-9]/g, ""), 10);
    if (n > 0) setBudget(n); else setInput(String(budget));
  };

  const handleScan = async () => {
    setLoad(true); 
    setError(null); 
    setCached(false);
    const b = parseInt(inputVal.replace(/[^0-9]/g, ""), 10) || budget;
    setBudget(b);
    
    try {
      const parsed = await scanMarket(b, budgetDir);
      const ts = new Date();
      
      setItems(parsed); 
      setDone(true); 
      setLast(ts); 
      setView("dashboard");
      
      try {
        await storage.set(CACHE_KEY, JSON.stringify({ 
          items: parsed, 
          budget: b, 
          budgetDir, 
          timestamp: ts.toISOString() 
        }));
      } catch {}
    } catch (e: any) {
      setError(e.message || "Scan failed — unknown error.");
    } finally { 
      setLoad(false); 
    }
  };

  const clearCache = async () => {
    await storage.delete(CACHE_KEY);
    setItems([]); 
    setDone(false); 
    setCached(false); 
    setError(null); 
    setLast(null);
  };

  const deriveDiff = (i: DealItem) => {
    if (i.demand === "High" && (i.days_to_sell || 7) <= 5) return "Easy";
    if (i.demand === "Low" || (i.days_to_sell || 7) >= 14) return "Hard";
    return "Medium";
  };

  const filtered = items
    .filter(i => category === "All" || i.category === category)
    .filter(i => diffFilter === "All" || (i.sell_difficulty || deriveDiff(i)) === diffFilter)
    .sort((a: any, b: any) => (sortBy === "buy_price" || sortBy === "days_to_sell") ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]);

  const diffCounts: Record<string, number> = { All: items.length, Easy: 0, Medium: 0, Hard: 0 };
  items.forEach(i => { 
    const d = i.sell_difficulty || deriveDiff(i); 
    if (diffCounts[d] !== undefined) diffCounts[d]++; 
  });

  const totalMargin = filtered.reduce((s, i) => s + (i.margin_aed || 0), 0);
  const avgRoi = filtered.length ? Math.round(filtered.reduce((s, i) => s + (i.roi_pct || 0), 0) / filtered.length) : 0;
  const totalCapital = filtered.reduce((s, i) => s + (i.buy_price || 0), 0);
  const avgDays = filtered.length ? Math.round(filtered.reduce((s, i) => s + (i.days_to_sell || 7), 0) / filtered.length) : 0;
  const best = filtered[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Dubizzle Flipper</h1>
              <span className="text-sm font-medium text-slate-500 ml-2">by UJ</span>
            </div>
            <p className="text-slate-400 text-sm pl-11">
              {lastScan ? (
                <span className="flex items-center gap-2">
                  {cached ? 
                    <span className="text-slate-500 font-medium">Loaded from cache</span> : 
                    <span className="text-emerald-400 font-medium tracking-tight flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Scan</span>
                  }
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  {lastScan.toLocaleString()}
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  {budgetDir.charAt(0).toUpperCase() + budgetDir.slice(1)} <strong className="text-slate-200">{budget.toLocaleString()} AED</strong>
                </span>
              ) : (
                "Set your budget and scan the market to find profitable items to resell."
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
            <BudgetControl budgetDir={budgetDir} setDir={setDir} inputVal={inputVal} setInput={setInput} commitBudget={commitBudget} />
            <div className="flex items-center gap-3">
              {scanned && !loading && (
                <button 
                  onClick={clearCache} 
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}
              <button 
                onClick={handleScan} 
                disabled={loading} 
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <>
                    <Radar className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    {scanned ? "Re-scan Market" : "Scan Market"}
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {loading && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse shadow-xl" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
            <div className="h-[400px] rounded-3xl bg-slate-900 border border-slate-800 animate-pulse mb-8 shadow-xl" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse mb-4 shadow-xl" style={{ animationDelay: `${i * 0.15 + 0.3}s` }} />)}
            <div className="text-center text-sm font-sans text-slate-500 mt-6 flex items-center justify-center gap-2">
              <Radar className="w-4 h-4 text-indigo-400 animate-spin" /> Pulling live listings from dubizzle.com...
            </div>
          </div>
        )}

        {error && (
          <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 mb-6 flex flex-col items-start shadow-sm">
            <div className="text-sm font-bold text-rose-400 mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Scan failed
            </div>
            <div className="text-xs text-rose-300 font-mono break-all">{error}</div>
          </div>
        )}

        {!loading && !scanned && !error && (
          <div className="text-center py-32 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Radar className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">No market data yet</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Set your budget in the top right, then hit <strong className="text-white font-medium">Scan Market</strong> to begin viewing potential deals.
            </p>
          </div>
        )}

        {!loading && scanned && filtered.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex gap-2 mb-8 border-b border-slate-800 pb-[10px]">
              {[["dashboard", "Dashboard"], ["deals", "All Deals"]].map(([v, l]) => (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={`
                    px-5 py-2.5 text-sm font-medium rounded-xl transition-colors
                    ${view === v ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800"}
                  `}
                >
                  {l}
                </button>
              ))}
            </div>

            {view === "dashboard" && (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-900 border border-slate-800 p-2 rounded-2xl w-fit">
                  <span className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold mx-3">Pace</span>
                  {[
                    { key: "All",    label: "All",    color: "#64748b", bg: "transparent" },
                    { key: "Easy",   label: "Easy",   color: "#34d399", bg: "rgba(16, 185, 129, 0.1)" },
                    { key: "Medium", label: "Medium", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
                    { key: "Hard",   label: "Hard",   color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" },
                  ].map(({ key, label, color, bg }) => (
                    <button 
                      key={key} 
                      onClick={() => setDiff(key)} 
                      className={`
                        px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2
                        ${diffFilter === key ? "" : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"}
                      `}
                      style={diffFilter === key ? { backgroundColor: bg, color } : {}}
                    >
                      {key !== "All" && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: diffFilter === key ? 1 : 0.5 }} />}
                      {label} <span className="opacity-60 text-[10px] font-medium tracking-wide">({diffCounts[key]})</span>
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total profit potential" val={`${totalMargin.toLocaleString()} AED`} sub="if all flipped" accentClass="text-emerald-400" />
                  <StatCard label="Average ROI" val={`${avgRoi}%`} sub="across all deals" accentClass="text-indigo-400" />
                  <StatCard label="Capital to buy all" val={`${totalCapital.toLocaleString()} AED`} sub="total outlay" />
                  <StatCard label="Avg flip time" val={`~${avgDays}d`} sub="est. on Dubizzle" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="High demand deals" val={`${filtered.filter(i=>i.demand==="High").length} / ${filtered.length}`} />
                  <StatCard label="Low risk deals" val={`${filtered.filter(i=>i.risk==="Low").length} / ${filtered.length}`} />
                  <StatCard label="Best single ROI" val={`${best?.roi_pct || 0}%`} sub={best?.item} accentClass="text-indigo-400" />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <h3 className="font-semibold text-white">Buy vs Resell Value</h3>
                    <div className="flex gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-400/50" /> Buy
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500" /> Sell
                      </span>
                    </div>
                  </div>
                  <div className="h-[280px] w-full">
                    <DealsChart data={filtered} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
                  <h3 className="font-semibold text-white mb-6">Resell Value Breakdown</h3>
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {["Item", "Buy (AED)", "Sell (AED)", "Profit (AED)", "ROI", "Risk", "Demand"].map((h, i) => (
                          <th key={h} className={`text-[10px] text-slate-500 font-semibold uppercase tracking-widest pb-4 ${i > 0 && i < 5 ? "text-right" : i >= 5 ? "text-center" : ""}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filtered.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className={`py-4 pr-4 text-sm ${i===0 ? "text-indigo-400 font-semibold" : "text-slate-200"}`}>
                            {item.item.length > 35 ? item.item.slice(0,34)+"…" : item.item}
                            {i === 0 && <span className="ml-2 text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Top</span>}
                          </td>
                          <td className="py-4 px-2 text-sm text-slate-400 text-right">{(item.buy_price||0).toLocaleString()}</td>
                          <td className="py-4 px-2 text-sm text-slate-400 text-right">{(item.sell_price||0).toLocaleString()}</td>
                          <td className="py-4 px-2 text-sm text-emerald-400 font-semibold text-right">+{(item.margin_aed||0).toLocaleString()}</td>
                          <td className={`py-4 px-2 text-sm font-semibold text-right ${item.roi_pct >= 40 ? "text-indigo-400" : item.roi_pct >= 20 ? "text-slate-300" : "text-slate-500"}`}>
                            {item.roi_pct}%
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className={`text-[10px] px-2.5 py-1 rounded-xl font-semibold uppercase tracking-wider ${
                              item.risk === "Low" ? "bg-emerald-500/10 text-emerald-400" : 
                              item.risk === "High" ? "bg-rose-500/10 text-rose-400" : 
                              "bg-amber-500/10 text-amber-500"
                            }`}>{item.risk}</span>
                          </td>
                          <td className={`py-4 pl-2 text-xs font-semibold text-center ${
                            item.demand === "High" ? "text-emerald-400" : 
                            item.demand === "Low" ? "text-slate-500" : 
                            "text-amber-500"
                          }`}>{item.demand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold text-white mb-6">Top 3 Deals</h3>
                  <div className="flex flex-col gap-6">
                    {filtered.slice(0, 3).map((item, idx) => <DealCard key={idx} item={item} isTop={idx === 0 && sortBy === "roi_pct"} />)}
                  </div>
                  <button 
                    onClick={() => setView("deals")} 
                    className="mt-8 w-full py-4 text-sm font-semibold rounded-2xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    View All {filtered.length} Deals <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {view === "deals" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-900 border border-slate-800 p-2 rounded-2xl w-fit">
                  <span className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold mx-3">Pace</span>
                  {[
                    { key: "All",    label: "All",    color: "#64748b", bg: "transparent" },
                    { key: "Easy",   label: "Easy",   color: "#34d399", bg: "rgba(16, 185, 129, 0.1)" },
                    { key: "Medium", label: "Medium", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
                    { key: "Hard",   label: "Hard",   color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" },
                  ].map(({ key, label, color, bg }) => (
                    <button 
                      key={key} 
                      onClick={() => setDiff(key)} 
                      className={`
                        px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2
                        ${diffFilter === key ? "" : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"}
                      `}
                      style={diffFilter === key ? { backgroundColor: bg, color } : {}}
                    >
                      {key !== "All" && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: diffFilter === key ? 1 : 0.5 }} />}
                      {label} <span className="opacity-60 text-[10px] font-medium tracking-wide">({diffCounts[key]})</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {CATS.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setCat(cat)} 
                        className={`
                          px-4 py-1.5 text-xs rounded-xl transition-colors font-semibold
                          ${category === cat 
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                            : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"}
                        `}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">Sort by</span>
                    <select 
                      value={sortBy} 
                      onChange={e => setSort(e.target.value)} 
                      className="bg-transparent text-slate-300 text-xs outline-none font-semibold cursor-pointer appearance-none pr-4"
                    >
                      <option value="roi_pct">ROI %</option>
                      <option value="margin_aed">Profit AED</option>
                      <option value="buy_price">Buy Price ↑</option>
                      <option value="days_to_sell">Fastest Flip</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {filtered.map((item, idx) => <DealCard key={idx} item={item} isTop={idx === 0 && sortBy === "roi_pct"} />)}
                  {filtered.length === 0 && (
                    <div className="text-center py-16 text-slate-500 font-semibold bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                      No deals match your current filters.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
