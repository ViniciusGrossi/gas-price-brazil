import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Car, Fuel } from 'lucide-react';

export const CostSimulator: React.FC = () => {
  const [kmMonth, setKmMonth] = useState(1000);
  const [efficiency, setEfficiency] = useState(10);
  const [price, setPrice] = useState(5.85);

  const monthlyLiters = kmMonth / efficiency;
  const currentCost = monthlyLiters * price;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="exec-glass p-6 h-full flex flex-col justify-between border-white/5 shadow-xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
            <Calculator className="w-4 h-4 text-teal-400" /> Simulador de Custos
          </h3>
          <span className={`text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-md font-bold uppercase border border-teal-500/20`}>
            SIMULADOR
          </span>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> Km por Mês</span>
              <span className="text-white font-mono">{kmMonth} KM</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="100"
              value={kmMonth}
              onChange={(e) => setKmMonth(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> Eficiência da Frota</span>
              <span className="text-white font-mono">{efficiency} KM/L</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="25" 
              step="0.5"
              value={efficiency}
              onChange={(e) => setEfficiency(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
          </div>

           <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> Preço Unitário (R$)</span>
              <span className="text-white font-mono">R$ {price.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="10" 
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 group hover:border-teal-500/30 transition-all">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">OPEX Mensal Projetado</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-white">R$ {currentCost.toFixed(2)}</span>
              <span className="text-[10px] text-teal-400 font-bold tracking-tighter">ESTIMADO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        Sincronizado com Input Local
      </div>
    </motion.div>
  );
};
