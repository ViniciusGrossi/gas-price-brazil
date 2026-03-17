import { getIPCAMultiplier } from '../data/ipcaData';

export type FuelData = {
  "Mês/Ano": string;
  "Gasolina (R$/L)": number;
  "Etanol (R$/L)": number;
  "Diesel (R$/L)": number;
  "Brent (USD)"?: number; // Optional Brent field
};

export const calculateCAGR = (startValue: number, endValue: number, years: number) => {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
};

export const calculateFuelParity = (ethanolPrice: number, gasolinePrice: number) => {
  if (gasolinePrice <= 0) return 0;
  return ethanolPrice / gasolinePrice;
};

export const adjustForInflation = (nominalPrice: number, dateStr: string) => {
  if (!dateStr) return nominalPrice;
  const year = dateStr.split('/')[1];
  const multiplier = getIPCAMultiplier(year);
  return nominalPrice * multiplier;
};

export const calculateCorrelation = (x: number[], y: number[]) => {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export const filterDataByPeriod = (data: FuelData[], startYear: number, endYear: number) => {
  return data.filter(item => {
    const year = parseInt(item["Mês/Ano"].split('/')[1]);
    return year >= startYear && year <= endYear;
  });
};

export const calculateGovStats = (data: FuelData[], startYear: number, endYear: number) => {
  const periodData = filterDataByPeriod(data, startYear, endYear);
  if (periodData.length < 2) return null;
  
  const start = periodData[0];
  const end = periodData[periodData.length - 1];

  const getInc = (s: number, e: number) => ((e - s) / s) * 100;
  
  const getAvg = (field: keyof FuelData) => {
    const values = periodData.map(d => d[field] as number).filter(v => typeof v === 'number');
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  const getMinMax = (field: keyof FuelData) => {
    const values = periodData.map(d => d[field] as number).filter(v => typeof v === 'number');
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  return {
    gasoline: getInc(start["Gasolina (R$/L)"], end["Gasolina (R$/L)"]),
    ethanol: getInc(start["Etanol (R$/L)"], end["Etanol (R$/L)"]),
    diesel: getInc(start["Diesel (R$/L)"], end["Diesel (R$/L)"]),
    averages: {
      gasoline: getAvg("Gasolina (R$/L)"),
      ethanol: getAvg("Etanol (R$/L)"),
      diesel: getAvg("Diesel (R$/L)"),
    },
    minMax: {
      gasoline: getMinMax("Gasolina (R$/L)"),
      ethanol: getMinMax("Etanol (R$/L)"),
      diesel: getMinMax("Diesel (R$/L)"),
    }
  };
};

export const calculateGovRating = (stats: any, startYear: number, endYear: number, data: FuelData[]) => {
  if (!stats) return { score: 0, brief: "Dados Insuficientes" };

  const periodData = filterDataByPeriod(data, startYear, endYear);
  const events = getKeyEvents().filter(e => {
    const y = parseInt(e.date.split('/')[1]);
    return y >= startYear && y <= endYear;
  });

  // 1. Stability (Gasoline StdDev)
  const gasValues = periodData.map(d => d["Gasolina (R$/L)"]);
  const mean = gasValues.reduce((a, b) => a + b, 0) / gasValues.length;
  const variance = gasValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gasValues.length;
  const stdDev = Math.sqrt(variance);
  const stabilityScore = Math.max(0, 100 - (stdDev / mean) * 400);

  // 2. Global Context (Brent vs Fuel)
  const brentStart = periodData[0]["Brent (USD)"] || 50;
  const brentEnd = periodData[periodData.length - 1]["Brent (USD)"] || 50;
  const brentDelta = ((brentEnd - brentStart) / brentStart) * 100;
  const fuelDelta = stats.gasoline;
  
  // High score if Fuel rose less than Brent significantly
  let contextScore = 50;
  if (brentDelta > 0) {
    contextScore = fuelDelta < brentDelta ? 80 + (brentDelta - fuelDelta) : 40 - (fuelDelta - brentDelta);
  } else {
    contextScore = fuelDelta < 0 ? 90 : 30; // If Brent fell, Fuel SHOULD fall
  }

  // 3. Event Resilience
  const resilienceBonus = events.length > 0 ? 10 : 0;

  const totalScore = Math.min(100, (stabilityScore * 0.4) + (contextScore * 0.5) + resilienceBonus);
  
  let brief = "";
  if (totalScore > 80) brief = "Resiliência excepcional em cenários voláteis.";
  else if (totalScore > 60) brief = "Gestão estável com alinhamento de paridade.";
  else if (totalScore > 40) brief = "Impacto moderado de fatores externos.";
  else brief = "Alta volatilidade e descolamento de mercado.";

  return { score: Math.round(totalScore), brief };
};

export const getGovernmentPeriods = (data?: FuelData[]) => {
  const basePeriods = [
    { name: "Lula I", start: 2003, end: 2006 },
    { name: "Lula II", start: 2007, end: 2010 },
    { name: "Dilma I", start: 2011, end: 2014 },
    { name: "Dilma II / Temer", start: 2015, end: 2018 },
    { name: "Bolsonaro", start: 2019, end: 2022 },
    { name: "Lula III", start: 2023, end: 2026 },
  ];

  if (!data) return basePeriods;

  return basePeriods.map(p => {
    const stats = calculateGovStats(data, p.start, p.end);
    const evaluation = calculateGovRating(stats, p.start, p.end, data);
    return {
      ...p,
      stats,
      evaluation
    };
  });
};

export const getKeyEvents = () => {
  return [
    { date: "11/2007", name: "Pré-sal", description: "Anúncio da descoberta de grandes reservas na Bacia de Santos." },
    { date: "09/2008", name: "Crise Lehman", description: "Auge da crise financeira global com colapso do banco americano." },
    { date: "03/2014", name: "Lava Jato", description: "Início das investigações sobre corrupção na Petrobras." },
    { date: "05/2016", name: "Impeachment", description: "Michel Temer assume a presidência e altera política de preços." },
    { date: "05/2018", name: "Greve dos Caminhoneiros", description: "Paralisação nacional contra a alta do diesel." },
    { date: "03/2020", name: "Pandemia COVID-19", description: "Colapso dos preços do petróleo e queda drástica na demanda." },
    { date: "02/2022", name: "Guerra na Ucrânia", description: "Disparada nos preços internacionais do petróleo." },
  ];
};

// Mock Brent Data Generator for 2002-2026 (Monthly)
// This simulates a macro trend to be used in the absence of a live API for local testing
export const getBrentMockData = (monthsCount: number) => {
  const basePrices = [25, 40, 60, 100, 45, 80, 110, 50, 65, 85, 40, 75]; // Rough yearly trend
  const result = [];
  for (let i = 0; i < monthsCount; i++) {
    const yearIdx = Math.floor(i / 12) % basePrices.length;
    const noise = (Math.random() - 0.5) * 5;
    result.push(basePrices[yearIdx] + noise);
  }
  return result;
};

export const getFuelCurrentPrices = (data: FuelData[]) => {
  if (!data || data.length === 0) return { gasoline: 0, ethanol: 0, diesel: 0 };
  const last = data[data.length - 1];
  return {
    gasoline: last["Gasolina (R$/L)"],
    ethanol: last["Etanol (R$/L)"],
    diesel: last["Diesel (R$/L)"]
  };
};

export const findEventForDate = (date: string) => {
  return getKeyEvents().find(e => e.date === date);
};
