import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, Database } from 'lucide-react';
import { tokens } from '../../design-system/tokens';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend: number;
  color: 'primary' | 'secondary' | 'muted';
  isHero?: boolean;
}

export const MetricCard = memo(({ title, value, unit, trend, color, isHero }: MetricCardProps) => {
  const isPositive = trend >= 0;
  const accentColor = tokens.colors.accent[color];

  const Icon = color === 'primary' ? Activity : color === 'secondary' ? Zap : Database;

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`exec-glass p-6 rounded-2xl relative border-white/5 transition-all shadow-xl
      ${isHero ? 'border-l-4 border-l-teal-500' : ''}`}
    >
      {/* Decorative Glow */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 pointer-events-none rounded-full"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg bg-slate-900/50 border border-white/5"
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{title}</h3>
        </div>
        
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border
          ${isPositive ? 'text-rose-400 bg-rose-400/5 border-rose-400/20' : 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-display font-bold text-white tracking-tight">
          {unit === 'R$/L' ? `R$ ${value.toFixed(2)}` : value.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{unit}</span>
      </div>

      {isHero && (
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              className="h-full bg-teal-500"
            />
          </div>
          <span className="text-[8px] text-slate-600 font-bold uppercase font-mono">Índice_Confiança</span>
        </div>
      )}
    </motion.div>
  );
});
