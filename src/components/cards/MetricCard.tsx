import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  colorClass: string;
  delay?: number;
}

export const MetricCard = ({ title, value, change, colorClass, delay = 0 }: MetricCardProps) => {
  const springValue = useSpring(0, { stiffness: 50, damping: 15 });
  const displayValue = useTransform(springValue, (v) => `R$ ${v.toFixed(2)}`);

  useEffect(() => {
    const timeout = setTimeout(() => {
      springValue.set(value);
    }, delay * 1000 + 500);
    return () => clearTimeout(timeout);
  }, [value, delay, springValue]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.03, rotateX: 2, rotateY: 2 }}
      className="glass-card p-6 flex flex-col justify-between h-full relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent blur-2xl -mr-8 -mt-8 transition-opacity duration-500 opacity-0 group-hover:opacity-100`} />
      
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <motion.div className={`text-4xl font-bold font-display ${colorClass}`}>
          {displayValue}
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-sm flex items-center ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          <span className="text-gray-500 ml-1 text-xs">vs mês ant.</span>
        </span>
        <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ delay: delay + 0.5, duration: 1 }}
            className={`h-full ${colorClass.replace('text-', 'bg-')}`} 
          />
        </div>
      </div>
    </motion.div>
  );
};
