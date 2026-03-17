import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Brush
} from 'recharts';
import { motion } from 'framer-motion';
import { tokens } from '../../design-system/tokens';
import { FuelData, getGovernmentPeriods, getKeyEvents, adjustForInflation } from '../../utils/dataUtils';

interface FuelChartProps {
  data: FuelData[];
  priceMode: 'nominal' | 'real';
  ipcaIndex: number[];
  visibleFuels: string[];
}

const GovLabel = (props: any) => {
  const { x, width, value, stats } = props;
  if (!stats) return null;

  const centerX = x + width / 2;
  const labelY = -50; // Relative to top of reference area (top of chart grid)

  return (
    <g className="pointer-events-none overflow-visible">
      <text
        x={centerX}
        y={labelY}
        textAnchor="middle"
        fill="#FFFFFF"
        fillOpacity={0.8}
        fontSize={11}
        fontWeight="800"
        style={{ letterSpacing: '0.05em' }}
      >
        {value}
      </text>
      <text
        x={centerX}
        y={labelY + 16}
        textAnchor="middle"
        fontSize={10}
        fontWeight="bold"
      >
        <tspan fill="#8B5CF6">G:{stats.gasoline >= 0 ? '+' : ''}{stats.gasoline.toFixed(0)}%</tspan>
        <tspan dx={6} fill="#3B82F6">E:{stats.ethanol >= 0 ? '+' : ''}{stats.ethanol.toFixed(0)}%</tspan>
        <tspan dx={6} fill="#EC4899">D:{stats.diesel >= 0 ? '+' : ''}{stats.diesel.toFixed(0)}%</tspan>
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label, priceMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border-white/20 shadow-2xl backdrop-blur-xl min-w-[200px] z-50">
        <p className="text-white font-bold mb-3 border-b border-white/10 pb-2">{label}</p>
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => {
            const isReal = priceMode === 'real';
            return (
              <div key={index} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-400 text-xs font-bold uppercase">{entry.name}</span>
                </div>
                <div className="flex items-baseline justify-between pl-4">
                  <span className="text-white font-display font-bold text-lg">
                    R$ {entry.value.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-2">
                    ({isReal ? 'Real' : 'Nominal'})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const FuelChart = ({ data, priceMode, ipcaIndex, visibleFuels }: FuelChartProps) => {
  const govPeriods = getGovernmentPeriods(data) as any[];
  const events = getKeyEvents();

  const processedData = data.map((item, idx) => {
    const currentIndex = ipcaIndex[ipcaIndex.length - 1] || 1;
    const dateIndex = ipcaIndex[idx] || currentIndex;

    return {
      ...item,
      "Gasolina Adjusted": adjustForInflation(item["Gasolina (R$/L)"], idx, currentIndex, dateIndex),
      "Etanol Adjusted": adjustForInflation(item["Etanol (R$/L)"], idx, currentIndex, dateIndex),
      "Diesel Adjusted": adjustForInflation(item["Diesel (R$/L)"], idx, currentIndex, dateIndex),
    };
  });

  const chartData = processedData.map(item => ({
    ...item,
    displayGasoline: priceMode === 'real' ? item["Gasolina Adjusted"] : item["Gasolina (R$/L)"],
    displayEthanol: priceMode === 'real' ? item["Etanol Adjusted"] : item["Etanol (R$/L)"],
    displayDiesel: priceMode === 'real' ? item["Diesel Adjusted"] : item["Diesel (R$/L)"],
  }));

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="glass-card p-6 md:p-8 h-[650px] w-full relative group"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 80, right: 30, left: 20, bottom: 120 }}
          syncId="fuelSync"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="Mês/Ano"
            stroke="#4B5563"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={24}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis
            stroke="#4B5563"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$ ${value.toFixed(1)}`}
            tick={{ fill: '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip priceMode={priceMode} />} />

          {/* Government Periods */}
          {govPeriods.map((period, index) => (
            <ReferenceArea
              key={period.name}
              x1={`01/${period.start}`}
              x2={`12/${period.end - 1}`}
              fill={index % 2 === 0 ? "rgba(108, 59, 255, 0.04)" : "rgba(255, 255, 255, 0.01)"}
              label={(props: any) => (
                <GovLabel
                  {...props}
                  value={period.name}
                  stats={period.stats}
                />
              )}
            />
          ))}

          {/* Event Markers - Moved lower to avoid overlap */}
          {events.map((event) => (
            <ReferenceLine
              key={event.name}
              x={`01/${event.year}`}
              stroke="#6C3BFF"
              strokeWidth={1}
              strokeDasharray="4 4"
              label={{
                position: 'insideBottomLeft',
                value: event.name,
                fill: '#8B5CF6',
                fontSize: 9,
                fontWeight: '600',
                offset: -45,
                angle: -90,
              }}
            />
          ))}

          <Line
            type="monotone"
            dataKey="displayGasoline"
            name="Gasolina"
            stroke={tokens.colors.gasoline}
            strokeWidth={3}
            dot={false}
            hide={!visibleFuels.includes('Gasolina')}
            activeDot={{ r: 6, fill: tokens.colors.gasoline, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="displayEthanol"
            name="Etanol"
            stroke={tokens.colors.ethanol}
            strokeWidth={3}
            dot={false}
            hide={!visibleFuels.includes('Etanol')}
            activeDot={{ r: 6, fill: tokens.colors.ethanol, stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="displayDiesel"
            name="Diesel"
            stroke={tokens.colors.diesel}
            strokeWidth={3}
            dot={false}
            hide={!visibleFuels.includes('Diesel')}
            activeDot={{ r: 6, fill: tokens.colors.diesel, stroke: '#fff', strokeWidth: 2 }}
          />

          <Brush
            dataKey="Mês/Ano"
            height={40}
            stroke="#6C3BFF"
            fill="#0B0B0F"
            travellerWidth={10}
            gap={1}
            startIndex={0}
            y={550} // Explicit y-position to move it down
          >
            <LineChart>
              <Line type="monotone" dataKey="Gasolina (R$/L)" stroke="#8B5CF6" dot={false} />
            </LineChart>
          </Brush>
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
