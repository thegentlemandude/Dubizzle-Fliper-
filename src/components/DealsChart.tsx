import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { DealItem } from '../types';

export function DealsChart({ data }: { data: DealItem[] }) {
  const chartData = data.slice(0, 6).map(item => ({
    name: item.item.length > 14 ? item.item.slice(0, 13) + "…" : item.item,
    buy: item.buy_price,
    sell: item.sell_price,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'var(--font-sans)', fontWeight: 500 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'var(--font-sans)', fontWeight: 500 }} 
          tickFormatter={(val) => val.toLocaleString()} 
        />
        <Tooltip 
          cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0', fontFamily: 'var(--font-sans)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '12px' }}
          itemStyle={{ color: '#f8fafc', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
          labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
        />
        <Bar dataKey="buy" fill="#818cf8" radius={[4, 4, 0, 0]} name="Buy Price" maxBarSize={32} />
        <Bar dataKey="sell" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sell Price" maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
