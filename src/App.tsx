import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { 
  FuelData, 
  getBrentMockData, 
  getGovernmentPeriods,
  getFuelCurrentPrices
} from './utils/dataUtils'
import fuelDataRaw from './data/fuel_data.json'
import html2canvas from 'html2canvas'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Activity, 
  BarChart3, 
  Zap, 
  Activity as AnalyticsIcon,
  Download
} from 'lucide-react'

import { LoadingSkeleton } from './components/layout/LoadingSkeleton'
import { MetricCard } from './components/cards/MetricCard'
import { FuelChart } from './components/charts/FuelChart'
import { ParityChart } from './components/charts/ParityChart'
import { BrentChart } from './components/charts/BrentChart'
import { GovComparator } from './components/charts/GovComparator'
import { CostSimulator } from './components/tools/CostSimulator'
import { useIPCAData } from './hooks/useIPCAData'

type PriceMode = 'nominal' | 'real';

function App() {
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [data, setData] = useState<FuelData[]>([])
  const [priceMode, setPriceMode] = useState<PriceMode>('nominal')
  const [visibleFuels, setVisibleFuels] = useState<string[]>(['Gasolina', 'Etanol', 'Diesel'])
  const [highlightedGov, setHighlightedGov] = useState<string | null>(null)
  
  const { cumulativeIndex, loading: ipcaLoading } = useIPCAData()
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const fuelWithBrent = (fuelDataRaw as FuelData[]).map((item, idx) => ({
        ...item,
        "Brent (USD)": getBrentMockData(fuelDataRaw.length)[idx]
      }))
      setData(fuelWithBrent)
      setLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const toggleFuel = useCallback((fuel: string) => {
    setVisibleFuels(prev => 
      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
    )
  }, []);

  // Filtering data based on highlightedGov
  const filteredData = useMemo(() => {
    if (!highlightedGov) return data;
    const gov = getGovernmentPeriods().find(g => g.name === highlightedGov);
    if (!gov) return data;
    
    return data.filter(item => {
      const year = parseInt(item["Mês/Ano"].split('/')[1]);
      return year >= gov.start && year <= gov.end;
    });
  }, [data, highlightedGov]);

  const exportChart = useCallback(async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#0b1620',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `analise_executiva_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export falhou', err);
    }
    setExporting(false);
  }, []);

  const currentPrices = useMemo(() => getFuelCurrentPrices(data), [data])
  const govPeriods = useMemo(() => getGovernmentPeriods(data), [data])

  const brentChartData = useMemo(() => filteredData.map(d => ({
    date: d["Mês/Ano"],
    value: d["Brent (USD)"] || 0
  })), [filteredData]);

  const isGlobalLoading = loading || ipcaLoading;

  if (isGlobalLoading) {
    return (
      <div className="min-h-screen bg-[#0b1620] flex items-center justify-center p-10">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#0b1620]" ref={dashboardRef}>
      {/* Background Depth Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-[1600px] mx-auto w-full p-6 lg:p-10 gap-8">
        
        {/* Header: Executive Brand & Status */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-teal-500/10">
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">Hub de Análise Executiva</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Protocolo de Sincronização Ativo // BCB_ANP_DATA_NODE</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="flex p-1 exec-glass border-white/5 rounded-lg">
                <button 
                  onClick={() => setPriceMode('nominal')}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all
                  ${priceMode === 'nominal' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Nominal
                </button>
                <button 
                  onClick={() => setPriceMode('real')}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all
                  ${priceMode === 'real' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Ajustado (IPCA)
                </button>
             </div>
            
            <button 
              onClick={exportChart}
              disabled={exporting}
              className="px-4 py-2 exec-glass border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-teal-500/10 transition-all flex items-center gap-2 text-teal-400"
            >
              <Download className="w-4 h-4" />
              {exporting ? '...' : 'Exportar'}
            </button>
          </div>
        </header>

        {/* Hero Row: Performance Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Preço Gasolina" 
            value={currentPrices.gasoline} 
            unit="R$/L"
            trend={-0.3} 
            color="primary"
            isHero={true}
          />
          <MetricCard 
            title="Preço Etanol" 
            value={currentPrices.ethanol} 
            unit="R$/L"
            trend={1.2} 
            color="secondary"
          />
          <MetricCard 
            title="Preço Diesel" 
            value={currentPrices.diesel} 
            unit="R$/L"
            trend={-0.8} 
            color="muted"
          />
          <div className="exec-glass p-6 rounded-2xl flex flex-col justify-center border-white/5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Período_Ref // Q1</p>
            <p className="text-xl text-white font-display font-semibold">Março 2024</p>
            <div className="h-1 w-12 bg-teal-500/50 rounded-full mt-4" />
          </div>
        </section>

        {/* Analytical Deck: Correlation & History */}
        <main className="grid grid-cols-12 gap-8 flex-1 min-h-0">
          
          {/* Sidebar: Executive Utilities */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs text-slate-500 uppercase font-black tracking-[0.2em]">Painel Operacional</h3>
              <div className="h-[2px] w-8 bg-teal-500/50" />
            </div>

            {/* Fuel Filters */}
            <div className="exec-glass p-6 rounded-2xl border-white/5 space-y-4">
              <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Filtros de Combustível</h4>
              <div className="flex flex-col gap-2">
                {['Gasolina', 'Etanol', 'Diesel'].map(fuel => (
                  <button 
                    key={fuel}
                    onClick={() => toggleFuel(fuel)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      visibleFuels.includes(fuel) 
                        ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                        : 'bg-transparent border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">{fuel}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${visibleFuels.includes(fuel) ? 'bg-teal-400 animate-pulse' : 'bg-slate-800'}`} />
                  </button>
                ))}
              </div>
            </div>

            <CostSimulator />
            
            <div className="exec-glass p-6 rounded-2xl border-white/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BarChart3 className="w-12 h-12 text-teal-400" />
              </div>
              <h4 className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-6">Market Intel</h4>
              <div className="flex items-end gap-1 h-12 mb-4">
                {[40, 60, 45, 70, 55, 90, 65].map((h, i) => (
                  <div key={i} className="flex-1 bg-teal-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">"Índices de paridade integrados aos limites corporativos da ANP."</p>
            </div>
          </aside>

          {/* Main View: Timeline Engine */}
          <section className="col-span-12 lg:col-span-9 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                  <AnalyticsIcon className="w-4 h-4 text-teal-400" />
                </div>
                <h3 className="text-slate-100 font-display font-bold text-lg">Horizonte Integrado de Preços</h3>
              </div>
              {highlightedGov && (
                <button 
                  onClick={() => setHighlightedGov(null)}
                  className="text-[10px] text-teal-500 font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-teal-500/20 hover:bg-teal-500/10"
                >
                  Limpar Filtro Mandato: {highlightedGov}
                </button>
              )}
            </div>

            <div className="flex-1 min-h-[500px]">
              <FuelChart 
                data={filteredData} 
                priceMode={priceMode} 
                ipcaIndex={cumulativeIndex}
                visibleFuels={visibleFuels}
                highlightedGov={highlightedGov}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <BrentChart data={brentChartData} highlightedGov={highlightedGov} />
               <ParityChart data={filteredData} highlightedGov={highlightedGov} />
            </div>
          </section>
        </main>

        {/* Narrative Deck: Political History */}
        <section className="mt-4 flex flex-col gap-6">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-slate-800/50 border border-white/5">
                <Zap className="w-4 h-4 text-teal-400" />
             </div>
             <h3 className="text-slate-100 font-display font-bold text-lg">Registro Narrativo de Governança</h3>
           </div>
           
           <GovComparator 
              periods={govPeriods as any}
              selectedFuel={visibleFuels[0] as any || 'Gasolina'}
              onSelectPeriod={setHighlightedGov}
              highlightedPeriod={highlightedGov}
           />
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">
           <div className="flex items-center gap-8">
             <p>© 2025 PRECISE_ENERGY_ALALYTICS</p>
             <p>SYSTEM_ID: EXE_ANP_992</p>
           </div>
           <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                PROTOCOLO_SEGURO
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                SINCRONIA_MERCADO_GLOBAL
              </span>
           </div>
        </footer>
      </div>
    </div>
  );
}

export default App
