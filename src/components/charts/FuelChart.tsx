import { useMemo, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  ReferenceArea,
  Brush,
  Scatter
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../../design-system/tokens';
import { FuelData, getGovernmentPeriods, findEventForDate, getKeyEvents } from '../../utils/dataUtils';
import { Info } from 'lucide-react';

interface FuelChartProps {
  data: FuelData[];
  priceMode: 'nominal' | 'real';
  ipcaIndex: Record<string, number>;
  visibleFuels: string[];
  highlightedGov: string | null;
}

// Sub-component: Government Period Label
const CustomGovernmentLabel = ({ viewBox, governo, variacao }: any) => {
  const { x, y } = viewBox ?? { x: 0, y: 0 };
  return (
    <g>
      <text
        x={x + 4}
        y={y + 18}
        fill="#94a3b8"
        fontSize={10}
        fontWeight="bold"
        textAnchor="start"
      >
        {governo}
      </text>
      <text
        x={x + 4}
        y={y + 30}
        fill="#22d3ee"
        fontSize={10}
        textAnchor="start"
      >
        {variacao}
      </text>
    </g>
  );
};

// Sub-component: Historical Event Tag
const CustomEventLabel = ({ viewBox, evento }: any) => {
  const { x, y, height } = viewBox ?? { x: 0, y: 0, height: 300 };
  return (
    <g>
      <text
        x={x - 4}
        y={y + height * 0.55}
        fill="#f59e0b"
        fontSize={10}
        fontWeight="500"
        textAnchor="middle"
        transform={`rotate(-90, ${x - 4}, ${y + height * 0.55})`}
        style={{ pointerEvents: 'none' }}
      >
        {evento}
      </text>
    </g>
  );
};

// Sub-component: Event Hover Card (Custom Portal style)
const EventHoverCard = ({ event, x, y }: { event: any, x: number, y: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 10 }}
    style={{ left: x, top: y - 120 }}
    className="absolute z-50 pointer-events-none w-48 exec-glass p-3 rounded-xl border-teal-500/30 shadow-2xl bg-slate-950/80"
  >
    <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/10">
      <div className="p-1 rounded bg-teal-500/20">
        <Info className="w-3 h-3 text-teal-400" />
      </div>
      <span className="text-[10px] font-display font-bold text-white uppercase">{event.name}</span>
    </div>
    <p className="text-[9px] text-slate-300 leading-relaxed font-medium">
      {event.description}
    </p>
    <div className="mt-2 text-[8px] text-teal-500/60 font-mono font-bold uppercase tracking-tighter">
      DATA: {event.date}
    </div>
  </motion.div>
);

// Sub-component: Custom Analytical Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const event = findEventForDate(label);
    
    return (
      <div className="exec-glass p-4 rounded-lg border-white/5 shadow-2xl min-w-[200px] bg-slate-950/60">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
          {event && (
            <div className="px-1.5 py-0.5 rounded bg-teal-500/20 border border-teal-500/40">
              <span className="text-[8px] text-teal-400 font-black uppercase">EVENTO</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-0.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] text-slate-400 uppercase font-bold">{entry.name}</span>
              </div>
              <span className="text-sm font-mono font-bold text-white pr-1">
                R$ {entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Sub-component: Historical Indicator Dot
const HistoricalDot = (props: any) => {
  const { cx, cy, payload, onHover } = props;
  const event = findEventForDate(payload["Mês/Ano"]);
  
  if (!event) return null;

  return (
    <g 
      onMouseEnter={() => onHover({ event, x: cx, y: cy, active: true })}
      onMouseLeave={() => onHover({ active: false })}
      className="cursor-help"
    >
      <circle 
        cx={cx} cy={cy} r={5} 
        fill={tokens.colors.accent.primary} 
        className="animate-pulse"
      />
      <circle 
        cx={cx} cy={cy} r={10} 
        fill="none" 
        stroke={tokens.colors.accent.primary} 
        strokeWidth={1} 
        opacity={0.2}
      />
    </g>
  );
};

export const FuelChart = ({ data, priceMode, ipcaIndex, visibleFuels, highlightedGov }: FuelChartProps) => {
  const [hoveredEvent, setHoveredEvent] = useState<{ event: any, x: number, y: number, active: boolean } | null>(null);
  const govPeriods = useMemo(() => getGovernmentPeriods(data), [data]);
  const keyEvents = getKeyEvents();

  // Premium, corporate-safe distinct colors
  const fuelColors = {
    Gasolina: '#14b8a6', // Teal
    Etanol: '#f59e0b',  // Amber
    Diesel: '#ef4444'   // Red
  };

  const chartData = useMemo(() => {
    // Strictly consolidate to a single array to prevent X-axis jitter/duplication
    const processed = data.map(item => {
      const inflationFactor = priceMode === 'real' ? (ipcaIndex[item["Mês/Ano"]] || 1) : 1;
      return {
        ...item,
        displayGasoline: (item["Gasolina (R$/L)"] || 0) * inflationFactor,
        displayEthanol: (item["Etanol (R$/L)"] || 0) * inflationFactor,
        displayDiesel: (item["Diesel (R$/L)"] || 0) * inflationFactor,
        predGasoline: null as number | null,
        predEthanol: null as number | null,
        predDiesel: null as number | null,
        isFuture: false
      };
    });

    // Add Prediction Logic (Next 12 months)
    if (processed.length > 0 && !highlightedGov) {
      const last = processed[processed.length - 1];
      const lastDateParts = last["Mês/Ano"].split('/');
      let month = parseInt(lastDateParts[0]);
      let year = parseInt(lastDateParts[1]);

      for (let i = 1; i <= 12; i++) {
        month++;
        if (month > 12) { month = 1; year++; }
        
        const predDate = `${month.toString().padStart(2, '0')}/${year}`;
        const trend = 1 + (Math.sin(i / 3) * 0.05);
        
        processed.push({
          "Mês/Ano": predDate,
          displayGasoline: i === 1 ? last.displayGasoline : null,
          displayEthanol: i === 1 ? last.displayEthanol : null,
          displayDiesel: i === 1 ? last.displayDiesel : null,
          predGasoline: (i === 1 ? last.displayGasoline : (processed[processed.length-1].predGasoline || last.displayGasoline)) * trend,
          predEthanol: (i === 1 ? last.displayEthanol : (processed[processed.length-1].predEthanol || last.displayEthanol)) * trend,
          predDiesel: (i === 1 ? last.displayDiesel : (processed[processed.length-1].predDiesel || last.displayDiesel)) * trend,
          isFuture: true
        } as any);
      }
    }

    return processed;
  }, [data, priceMode, ipcaIndex, highlightedGov]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="exec-glass p-8 rounded-3xl h-full w-full relative group border-white/5 shadow-2xl"
      id="fuel-chart-container"
      style={{ overflow: 'visible' }}
    >
      <AnimatePresence>
        {hoveredEvent?.active && (
          <EventHoverCard 
            event={hoveredEvent.event} 
            x={hoveredEvent.x} 
            y={hoveredEvent.y} 
          />
        )}
      </AnimatePresence>

      {/* Corporate Legend */}
      <div className="absolute top-6 left-8 flex gap-8 z-20 bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5">
        {['Gasolina', 'Etanol', 'Diesel'].filter(f => visibleFuels.includes(f)).map(fuel => (
           <div key={fuel} className="flex items-center gap-3">
             <div className="w-4 h-1 rounded-full" style={{ backgroundColor: fuelColors[fuel as keyof typeof fuelColors] }} />
             <span className="text-[10px] text-white font-bold uppercase tracking-widest">{fuel}</span>
           </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'visible' }}>
        <LineChart data={chartData} margin={{ top: 50, right: 30, left: 20, bottom: 20 }} syncId="fuelSync">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
          <XAxis 
            dataKey="Mês/Ano" 
            stroke="#1e293b" 
            fontSize={9} 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#475569', fontWeight: 700, fontFamily: 'monospace' }}
            interval={highlightedGov ? 4 : 48}
          />
          <YAxis 
            stroke="#1e293b" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#475569', fontWeight: 700, fontFamily: 'monospace' }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} 
          />
          
          {visibleFuels.includes('Gasolina') && (
            <>
              <Line 
                type="monotone" 
                dataKey="displayGasoline" 
                name="Gasolina"
                stroke={fuelColors.Gasolina} 
                strokeWidth={3}
                dot={<HistoricalDot onHover={setHoveredEvent} />}
                activeDot={{ r: 6, fill: fuelColors.Gasolina }}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="predGasoline" 
                name="Previsão Gasolina"
                stroke={fuelColors.Gasolina} 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                opacity={0.5}
                connectNulls
              />
            </>
          )}
          
          {visibleFuels.includes('Etanol') && (
             <>
               <Line 
                 type="monotone" 
                 dataKey="displayEthanol" 
                 name="Etanol"
                 stroke={fuelColors.Etanol} 
                 strokeWidth={2}
                 dot={false}
                 connectNulls
               />
               <Line 
                type="monotone" 
                dataKey="predEthanol" 
                name="Previsão Etanol"
                stroke={fuelColors.Etanol} 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                opacity={0.4}
                connectNulls
              />
             </>
          )}

          {visibleFuels.includes('Diesel') && (
            <>
              <Line 
                type="monotone" 
                dataKey="displayDiesel" 
                name="Diesel"
                stroke={fuelColors.Diesel} 
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="predDiesel" 
                name="Previsão Diesel"
                stroke={fuelColors.Diesel} 
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={false}
                opacity={0.3}
                connectNulls
              />
            </>
          )}

          {/* Government Transitions - Always visible unless specifically filtering */}
          {!highlightedGov && govPeriods.map((gov: any, idx) => (
            <ReferenceLine
              key={`gov-${idx}`}
              x={`01/${gov.start}`}
              stroke="#334155"
              strokeWidth={1}
              strokeDasharray="4 4"
              label={
                <CustomGovernmentLabel 
                  governo={gov.name} 
                  variacao={`G ${gov.stats?.gasoline > 0 ? '+' : ''}${gov.stats?.gasoline.toFixed(0)}%`}
                />
              }
            />
          ))}

          {/* Key Historical Events - Highlighted with ReferenceLines */}
          {!highlightedGov && keyEvents.map((ev: any, idx: number) => (
            <ReferenceLine
              key={`ev-${idx}`}
              x={ev.date}
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={<CustomEventLabel evento={ev.name} />}
            />
          ))}

          {/* Average Reference Line for Mandate */}
          {highlightedGov && (
            <ReferenceLine 
              y={(govPeriods as any[]).find(g => g.name === highlightedGov)?.stats?.averages.gasoline} 
              stroke={fuelColors.Gasolina} 
              strokeDasharray="5 5"
              label={{ position: 'right', value: 'Média Mandato', fill: fuelColors.Gasolina, fontSize: 10, fontWeight: 700 }}
            />
          )}

          <Brush 
            dataKey="Mês/Ano" 
            height={30} 
            stroke="#14b8a6" 
            fill="#060f17"
            travellerWidth={10}
            strokeOpacity={0.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
