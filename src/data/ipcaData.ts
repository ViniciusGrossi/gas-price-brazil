export const ipcaAcumulado: Record<string, number> = {
  "2002": 12.53,
  "2003": 9.30,
  "2004": 7.60,
  "2005": 5.69,
  "2006": 3.14,
  "2007": 4.46,
  "2008": 5.90,
  "2009": 4.31,
  "2010": 5.91,
  "2011": 6.50,
  "2012": 5.84,
  "2013": 5.91,
  "2014": 6.41,
  "2015": 10.67,
  "2016": 6.29,
  "2017": 2.95,
  "2018": 3.75,
  "2019": 4.31,
  "2020": 4.52,
  "2021": 10.06,
  "2022": 5.79,
  "2023": 4.62,
  "2024": 4.83,
  "2025": 4.20 // Projeção
};

/**
 * Retorna o índice acumulado real para um ano específico.
 * Para simplificação, converteremos o percentual anual em um multiplicador de deflação.
 */
export const getIPCAMultiplier = (year: string): number => {
  const years = Object.keys(ipcaAcumulado).sort();
  const targetYear = parseInt(year);
  
  let multiplier = 1.0;
  // Multiplicamos os índices de todos os anos de targetYear+1 até 2024
  for (let y = targetYear + 1; y <= 2024; y++) {
    const rate = ipcaAcumulado[y.toString()] || 0;
    multiplier *= (1 + rate / 100);
  }
  
  return multiplier;
};
