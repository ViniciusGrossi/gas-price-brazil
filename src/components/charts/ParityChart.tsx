import { memo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { FuelData, calculateFuelParity } from '../../utils/dataUtils';
import { tokens } from '../../design-system/tokens';

interface ParityChartProps {
  data: FuelData[];
  highlightedGov: string | null;
}

export const ParityChart = memo(({ data, highlightedGov }: ParityChartProps) => {
  const chartData = data.map(item => ({
    time: item["Mês/Ano"],
    parity: calculateFuelParity(item["Etanol (R$/L)"], item["Gasolina (R$/L)"])
  })).filter(d => d.parity > 0);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="exec-glass p-6 h-full w-full border-white/5 shadow-xl"
    >
      <div className="mb-6">
        <h3 className="text-white font-display font-bold text-[10px] uppercase tracking-widest mb-1">Análise de Paridade de Eficiência</h3>
        <p className="text-[9px] text-slate-500 font-mono tracking-tight uppercase">Limite de Vantagem: 0.70 Relativo</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} syncId="fuelSync">
          <defs>
            <linearGradient id="parityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={tokens.colors.accent.primary} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={tokens.colors.accent.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="#ffffff03" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#1e293b" 
            fontSize={8} 
            tickLine={false}
            axisLine={false}
            interval={highlightedGov ? 4 : 48}
            tick={{ fill: '#475569', fontWeight: 700, fontFamily: 'monospace' }}
          />
          <YAxis 
            stroke="#1e293b" 
            fontSize={8} 
            tickLine={false} 
            axisLine={false}
            domain={[0.4, 1.1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: '#475569', fontWeight: 700, fontFamily: 'monospace' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0b1620', border: '1px solid #ffffff05', borderRadius: '8px', fontSize: '10px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: tokens.colors.accent.primary, fontWeight: 700 }}
          />
          <ReferenceLine y={0.7} stroke={tokens.colors.accent.primary} strokeDasharray="3 3" strokeWidth={1} label={{ position: 'right', value: 'Limite 70%', fill: tokens.colors.accent.primary, fontSize: 8, fontWeight: 700, fontFamily: 'monospace' }} />
          <Area 
            type="monotone" 
            dataKey="parity" 
            name="Paridade"
            stroke={tokens.colors.accent.primary} 
            fillOpacity={1} 
            fill="url(#parityGradient)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
});
