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

interface ParityChartProps {
  data: FuelData[];
}

export const ParityChart = ({ data }: ParityChartProps) => {
  const chartData = data.map(item => ({
    time: item["Mês/Ano"],
    parity: calculateFuelParity(item["Etanol (R$/L)"], item["Gasolina (R$/L)"])
  })).filter(d => d.parity > 0);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="glass-card p-6 h-full w-full"
    >
      <div className="mb-6">
        <h3 className="text-white font-display font-semibold">Análise de Paridade (Etanol / Gasolina)</h3>
        <p className="text-xs text-gray-500">Valores abaixo de 0.70 indicam vantagem econômica para o Etanol.</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} syncId="fuelSync">
          <defs>
            <linearGradient id="parityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#4B5563" 
            fontSize={10} 
            tickLine={false}
            interval={36}
          />
          <YAxis 
            stroke="#4B5563" 
            fontSize={10} 
            tickLine={false} 
            domain={[0.4, 1]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#3B82F6' }}
          />
          <ReferenceLine y={0.7} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'right', value: '0.70', fill: '#10B981', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="parity" 
            name="Paridade"
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#parityGradient)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
