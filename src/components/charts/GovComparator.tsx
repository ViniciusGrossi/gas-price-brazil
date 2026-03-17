import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface GovStats {
  gasoline: number;
  ethanol: number;
  diesel: number;
  averages: { gasoline: number; ethanol: number; diesel: number };
  minMax: {
    gasoline: { min: number; max: number };
    ethanol: { min: number; max: number };
    diesel: { min: number; max: number };
  };
}

interface Period {
  name: string;
  start: string | number;
  end: string | number;
  stats: GovStats | null;
  evaluation?: { score: number; brief: string };
}

interface GovComparatorProps {
  periods: Period[];
  selectedFuel: 'Gasolina' | 'Etanol' | 'Diesel';
  onSelectPeriod: (name: string | null) => void;
  highlightedPeriod: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export const GovComparator: React.FC<GovComparatorProps> = ({ 
  periods, 
  selectedFuel, 
  onSelectPeriod,
  highlightedPeriod 
}) => {
  const [hoveredGov, setHoveredGov] = useState<string | null>(null);
  const fuelKey = selectedFuel === 'Gasolina' ? 'gasoline' : selectedFuel === 'Etanol' ? 'ethanol' : 'diesel';

  const validPeriods = periods.filter(p => p.stats);
  const maxAvg = validPeriods.length > 0 ? Math.max(...validPeriods.map(p => p.stats?.averages[fuelKey] || 0)) : 1;

  return (
    <div className="space-y-6">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex overflow-x-auto pb-6 gap-6 no-scrollbar snap-x"
      >
        {periods.map((period) => {
          const stats = period.stats;
          if (!stats) return null;

          const avg = stats.averages[fuelKey];
          const change = stats[fuelKey];
          const isSelected = highlightedPeriod === period.name;

          return (
            <motion.div
              key={period.name}
              variants={item}
              whileHover={{ y: -4 }}
              onClick={() => onSelectPeriod(isSelected ? null : period.name)}
              onMouseEnter={() => setHoveredGov(period.name)}
              onMouseLeave={() => setHoveredGov(null)}
              className={`flex-shrink-0 w-[280px] snap-start exec-glass p-6 border-b-2 transition-all cursor-pointer relative group overflow-hidden
              ${isSelected ? 'border-b-teal-500 bg-teal-500/5' : 'border-b-slate-800 border-white/5'}`}
            >
              <AnimatePresence>
                {hoveredGov === period.name && period.evaluation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md p-6 border border-teal-500/30 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-2 mb-4">
                       <Info className="w-5 h-5 text-teal-400" />
                       <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Avaliação Executiva</h4>
                    </div>
                    <div className="text-4xl font-display font-black text-white mb-2">
                       {period.evaluation.score}<span className="text-[10px] text-slate-500 ml-1">/100</span>
                    </div>
                    <p className="text-[10px] text-teal-400/80 font-medium leading-relaxed border-t border-teal-500/20 pt-3">
                       {period.evaluation.brief}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold text-sm uppercase tracking-tight">{period.name}</h4>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest font-mono">
                      {period.start} // {period.end}
                    </p>
                  </div>
                  <User className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-600'}`} />
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Média do Mandato</p>
                  <div className="text-2xl font-display font-bold text-white tracking-tight">
                    R$ {avg.toFixed(2)}
                  </div>
                </div>

                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(avg / maxAvg) * 100}%` }}
                    className="h-full bg-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-1.5">
                      {change >= 0 ? <TrendingUp className="w-3 h-3 text-red-400" /> : <TrendingDown className="w-3 h-3 text-emerald-400" />}
                      <span className={`text-[10px] font-bold ${change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {Math.abs(change).toFixed(1)}%
                      </span>
                   </div>
                   <span className="text-[9px] text-slate-600 font-bold uppercase">Impacto Variação</span>
                </div>
              </div>

              {/* Decorative Accent */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <div className="p-1 bg-teal-500/10 rounded border border-teal-500/20">
                    <ShieldCheck className="w-3 h-3 text-teal-400" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
