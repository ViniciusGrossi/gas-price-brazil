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

export const adjustForInflation = (nominalPrice: number, dateIndex: number, currentIPCAIndex: number, ipcaAtDate: number) => {
  if (ipcaAtDate <= 0) return nominalPrice;
  // Formula: Real Price = Nominal Price * (Current Index / Index at Date)
  // However, BCB API gives monthly percentage. We need to convert it to a cumulative index first.
  return nominalPrice * (currentIPCAIndex / ipcaAtDate);
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

  return {
    gasoline: getInc(start["Gasolina (R$/L)"], end["Gasolina (R$/L)"]),
    ethanol: getInc(start["Etanol (R$/L)"], end["Etanol (R$/L)"]),
    diesel: getInc(start["Diesel (R$/L)"], end["Diesel (R$/L)"]),
  };
};

export const getGovernmentPeriods = (data?: FuelData[]) => {
  const basePeriods = [
    { name: "FHC/Lula I", start: 2002, end: 2006 },
    { name: "Lula II", start: 2006, end: 2010 },
    { name: "Dilma I", start: 2010, end: 2014 },
    { name: "Dilma II/Temer", start: 2014, end: 2018 },
    { name: "Bolsonaro", start: 2018, end: 2022 },
    { name: "Lula III", start: 2022, end: 2026 },
  ];

  if (!data) return basePeriods;

  return basePeriods.map(p => ({
    ...p,
    stats: calculateGovStats(data, p.start, p.end)
  }));
};

export const getKeyEvents = () => {
  return [
    { year: 2007, name: "Descoberta do Pré-sal", description: "Anúncio da descoberta de grandes reservas na Bacia de Santos." },
    { year: 2008, name: "Crise Financeira Global", description: "Impacto da crise do subprime no mercado de commodities." },
    { year: 2014, name: "Investigações Petrobras", description: "Início da Operação Lava Jato e crise de governança na estatal." },
    { year: 2016, name: "Impeachment Dilma", description: "Mudança na política de preços da Petrobras (PPI - Paridade de Importação)." },
    { year: 2020, name: "Pandemia COVID-19", description: "Queda drástica na demanda global seguida de volatilidade extrema." },
    { year: 2022, name: "Guerra na Ucrânia", description: "Crise energética global e disparada nos preços internacionais do barril." },
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
