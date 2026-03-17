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

interface BrentChartProps {
  data: { date: string; value: number }[];
}

export const BrentChart = ({ data }: BrentChartProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-card p-6 h-[250px] w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-display font-semibold text-sm">Contexto Global: Petróleo Brent (USD/barril)</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Benchmark internacional vs Tempo</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="70%">
        <LineChart data={data} syncId="fuelSync">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#4B5563" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            interval={48}
            tick={{ fill: '#4B5563' }}
          />
          <YAxis 
            stroke="#4B5563" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #d9770630', borderRadius: '8px' }}
            itemStyle={{ color: '#d97706' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Brent (USD)"
            stroke="#d97706" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#d97706' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
