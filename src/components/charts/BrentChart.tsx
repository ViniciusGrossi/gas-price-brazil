import { memo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { tokens } from '../../design-system/tokens';

interface BrentChartProps {
  data: { date: string; value: number }[];
  highlightedGov: string | null;
}

export const BrentChart = memo(({ data, highlightedGov }: BrentChartProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="exec-glass p-6 h-[250px] w-full border-white/5 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-display font-bold text-[10px] uppercase tracking-widest">Índice Global Brent</h3>
          <p className="text-[9px] text-slate-500 uppercase font-mono mt-1">USD_POR_BARRIL // SYNC_EXTERNO</p>
        </div>
        <div className="w-6 h-6 rounded bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
           <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="70%">
        <LineChart data={data} syncId="fuelSync">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#1e293b" 
            fontSize={8} 
            tickLine={false}
            axisLine={false}
            interval={highlightedGov ? 12 : 48}
            tick={{ fill: '#475569', fontWeight: 700, fontFamily: 'monospace' }}
          />
          <YAxis 
            stroke="#1e293b" 
            fontSize={8} 
            tickLine={false} 
            axisLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value}`}
            tick={{ fill: '#475569', fontWeight: 700, fontFamily: 'monospace' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0b1620', border: '1px solid #ffffff05', borderRadius: '8px', fontSize: '10px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: tokens.colors.accent.secondary, fontWeight: 700 }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Brent (USD)"
            stroke={tokens.colors.accent.secondary} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: tokens.colors.accent.secondary, stroke: '#0b1620', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
});
