interface BudgetControlProps {
  budgetDir: string;
  setDir: (dir: string) => void;
  inputVal: string;
  setInput: (val: string) => void;
  commitBudget: () => void;
}

export function BudgetControl({ budgetDir, setDir, inputVal, setInput, commitBudget }: BudgetControlProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex rounded-xl border border-slate-800 bg-slate-900/50 p-1 shadow-inner h-[42px]">
        {["under", "above"].map(d => (
          <button 
            key={d} 
            onClick={() => setDir(d)} 
            className={`
              px-4 text-xs font-semibold rounded-lg capitalize transition-all
              ${budgetDir === d ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"}
            `}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl h-[42px] px-4 shadow-sm focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
        <input
          type="text" 
          inputMode="numeric" 
          value={inputVal}
          onChange={e => setInput(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commitBudget}
          className="w-[84px] text-sm font-semibold bg-transparent border-none text-white outline-none placeholder:text-slate-600 p-0 mr-2"
          placeholder="2000"
        />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">AED</span>
      </div>
    </div>
  );
}
