import { useState, useEffect, useMemo } from 'react'
import { 
  FuelData, 
  filterDataByPeriod, 
  getBrentMockData, 
  calculateCorrelation, 
  calculateCAGR 
} from './utils/dataUtils'
import fuelDataRaw from './data/fuel_data.json'

import { LoadingSkeleton } from './components/layout/LoadingSkeleton'
import { MetricCard } from './components/cards/MetricCard'
import { FuelChart } from './components/charts/FuelChart'
import { ParityChart } from './components/charts/ParityChart'
import { BrentChart } from './components/charts/BrentChart'
import { useIPCAData } from './hooks/useIPCAData'
import { TrendingUp, Activity, BarChart3, Clock, DollarSign, Globe } from 'lucide-react'

type PriceMode = 'nominal' | 'real';
type TimeRange = 'Full' | '2002-2008' | '2008-2014' | '2014-2020' | '2020-2026';

function App() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FuelData[]>([])
  const [priceMode, setPriceMode] = useState<PriceMode>('nominal')
  const [visibleFuels, setVisibleFuels] = useState<string[]>(['Gasolina', 'Etanol', 'Diesel'])
  
  const { cumulativeIndex, loading: ipcaLoading } = useIPCAData()

  useEffect(() => {
    const timer = setTimeout(() => {
      const fuelWithBrent = (fuelDataRaw as FuelData[]).map((item, idx) => ({
        ...item,
        "Brent (USD)": getBrentMockData(fuelDataRaw.length)[idx]
      }))
      setData(fuelWithBrent)
      setLoading(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  const toggleFuel = (fuel: string) => {
    setVisibleFuels(prev => 
      prev.includes(fuel) 
        ? prev.filter(f => f !== fuel) 
        : [...prev, fuel]
    )
  }

  const currentData = data[data.length - 1] || {}
  const prevData = data[data.length - 2] || {}

  const getChange = (curr: number, prev: number) => {
    if (!curr || !prev) return 0
    return ((curr - prev) / prev) * 100
  }

  // Dynamic Insights Calculations
  const insights = useMemo(() => {
    if (data.length < 2) return null;
    
    const gasolinePrices = data.map(d => d["Gasolina (R$/L)"]);
    const brentPrices = data.map(d => d["Brent (USD)"] || 0);
    
    const correlation = calculateCorrelation(gasolinePrices, brentPrices);
    const cagr = calculateCAGR(
      gasolinePrices[0], 
      gasolinePrices[gasolinePrices.length - 1], 
      data.length / 12
    );

    const parityValues = data.map(d => d["Etanol (R$/L)"] / d["Gasolina (R$/L)"]);
    const competitiveMonths = parityValues.filter(v => v < 0.7).length;
    const competitivePct = (competitiveMonths / data.length) * 100;

    return { correlation, cagr, competitivePct };
  }, [data]);

  const brentChartData = data.map(d => ({
    date: d["Mês/Ano"],
    value: d["Brent (USD)"] || 0
  }));

  const isGlobalLoading = loading || ipcaLoading;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0F] text-gray-100 font-sans pb-20">
      {/* Background Decorative Elements */}
      <div className="bg-orb bg-orb-violet -top-40 -right-40 opacity-20" />
      <div className="bg-orb bg-orb-blue -bottom-40 -left-40 opacity-10" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <main className="container mx-auto px-6 py-10 relative z-10 max-w-7xl">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-violet-500" />
              <span className="text-violet-400 font-bold uppercase tracking-[0.3em] text-[10px]">Macro Analysis Engine</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tighter text-white leading-[0.9]">
              Fuel Analytics <br /><span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">Insight Dashboard</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium tracking-wide mt-4">
              Brazilian Fuel Prices vs Global Oil Market (2002–2026)
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Fuel Filter */}
            <div className="flex flex-wrap gap-2 self-start md:self-end bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-xl">
              {[
                { id: 'Gasolina', color: 'bg-[#8B5CF6]' },
                { id: 'Etanol', color: 'bg-[#3B82F6]' },
                { id: 'Diesel', color: 'bg-[#EC4899]' }
              ].map(fuel => (
                <button
                  key={fuel.id}
                  onClick={() => toggleFuel(fuel.id)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2
                  ${visibleFuels.includes(fuel.id) 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-gray-500 hover:text-gray-400 opacity-50'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${fuel.color}`} />
                  {fuel.id}
                </button>
              ))}
            </div>

            {/* Price Mode Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-xl self-start md:self-end">
              <button 
                onClick={() => setPriceMode('nominal')}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2
                ${priceMode === 'nominal' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <DollarSign className="w-3 h-3" /> Preço Nominal
              </button>
              <button 
                onClick={() => setPriceMode('real')}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2
                ${priceMode === 'real' ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <TrendingUp className="w-3 h-3" /> Preço Real (IPCA)
              </button>
            </div>
          </div>
        </header>

        {isGlobalLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            
            {/* Metric Cards Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Gasolina Comum" 
                value={currentData["Gasolina (R$/L)"]} 
                change={getChange(currentData["Gasolina (R$/L)"], prevData["Gasolina (R$/L)"])} 
                colorClass="neon-text-gasoline"
                delay={0.1}
              />
              <MetricCard 
                title="Etanol Hidratado" 
                value={currentData["Etanol (R$/L)"]} 
                change={getChange(currentData["Etanol (R$/L)"], prevData["Etanol (R$/L)"])} 
                colorClass="neon-text-ethanol"
                delay={0.3}
              />
              <MetricCard 
                title="Óleo Diesel" 
                value={currentData["Diesel (R$/L)"]} 
                change={getChange(currentData["Diesel (R$/L)"], prevData["Diesel (R$/L)"])} 
                colorClass="neon-text-diesel"
                delay={0.5}
              />
            </section>

            {/* Main Charts Architecture */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column: Historical Fuel Series */}
              <div className="lg:col-span-3 space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 px-2">
                     <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-violet-500" />
                        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Série Temporal Comparativa</h2>
                     </div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-8">Ajuste o controle inferior para navegar na história</p>
                  </div>
                  <FuelChart 
                    data={data} 
                    priceMode={priceMode} 
                    ipcaIndex={cumulativeIndex} 
                    visibleFuels={visibleFuels}
                  />
                </div>
                
                {/* Brent Sync Chart */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3 px-2">
                      <BarChart3 className="w-5 h-5 text-amber-500" />
                      <h2 className="text-xl font-display font-bold text-white tracking-tight">Variação do Petróleo Brent (USD)</h2>
                   </div>
                   <BrentChart data={brentChartData} />
                </div>
              </div>

              {/* Right Column: Analytical Panel */}
              <div className="lg:col-span-1 space-y-8">
                {/* Analyst Insight Panel */}
                <div className="glass-card p-8 flex flex-col justify-between h-fit bg-gradient-to-br from-violet-600/10 via-transparent to-transparent border-violet-500/20">
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold text-white flex items-center gap-2">
                           <Activity className="w-5 h-5 text-violet-400" /> Key Insights
                         </h3>
                      </div>
                      
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-[0.2em]">Correlação Óleo/Fuel</p>
                            <div className="flex items-center gap-3">
                               <div className="text-2xl font-display font-bold text-white">{insights?.correlation.toFixed(2)}</div>
                               <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">Pearson R</div>
                            </div>
                         </div>

                         <div className="h-px bg-white/5 w-full" />

                         <div className="space-y-2">
                            <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-[0.2em]">CAGR Total (Histórico)</p>
                            <div className="text-2xl font-display font-bold text-violet-400">+{insights?.cagr.toFixed(1)}% / ano</div>
                         </div>

                         <div className="h-px bg-white/5 w-full" />

                         <div className="space-y-2">
                            <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-[0.2em]">Vantagem Etanol</p>
                            <div className="text-2xl font-display font-bold text-blue-400">{insights?.competitivePct.toFixed(0)}% do tempo</div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-12 space-y-4">
                      <button className="w-full py-4 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-600/30 font-bold text-xs hover:bg-violet-600/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                         <Clock className="w-4 h-4" /> Relatório Pro
                      </button>
                   </div>
                </div>
              </div>
            </section>

            {/* Alcohol Parity - Wide View */}
            <section className="space-y-4">
               <div className="flex items-center gap-3 px-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-display font-bold text-white tracking-tight">Competitividade: Etanol vs Gasolina</h2>
               </div>
               <div className="h-[450px]">
                  <ParityChart data={data} />
               </div>
            </section>

          </div>
        )}

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
           <div className="flex items-center gap-4">
              <span>&copy; 2026 Fuel Dashboard Analytics</span>
              <span className="text-gray-800">|</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-3 h-3"/> IPCA Source: SGS 433 (BCB)</span>
           </div>
           <div className="flex gap-6">
              <a href="#" className="hover:text-violet-400 transition-colors">Economic API</a>
              <a href="#" className="hover:text-violet-400 transition-colors">Documentation</a>
           </div>
        </footer>
      </main>
    </div>
  )
}

export default App
