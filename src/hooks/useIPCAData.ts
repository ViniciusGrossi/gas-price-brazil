import { useState, useEffect } from 'react';

export type IPCAValue = {
  data: string;
  valor: string;
};

export const useIPCAData = () => {
  const [ipcaData, setIpcaData] = useState<number[]>([]);
  const [cumulativeIndex, setCumulativeIndex] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIPCA = async () => {
      try {
        const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json');
        const data: IPCAValue[] = await response.json();
        
        const filtered = data.filter(item => {
          const year = parseInt(item.data.split('/')[2]);
          return year >= 2002;
        });

        const rawValues = filtered.map(item => parseFloat(item.valor));
        setIpcaData(rawValues);

        const indexMap: Record<string, number> = {};
        let currentIndex = 1; // Base 1 for multiplication
        
        // The API returns MM/YYYY. We need to match FuelData's "Mês/Ano" (MM/YYYY)
        filtered.forEach((item, idx) => {
          const val = parseFloat(item.valor);
          currentIndex = currentIndex * (1 + val / 100);
          indexMap[item.data.substring(0, 10).split('/').slice(1, 3).join('/')] = currentIndex;
        });

        // The date format in API is DD/MM/YYYY. We need MM/YYYY.
        const formattedIndexMap: Record<string, number> = {};
        let runningIndex = 1;
        filtered.forEach(item => {
          const [d, m, y] = item.data.split('/');
          const val = parseFloat(item.valor);
          runningIndex = runningIndex * (1 + val / 100);
          formattedIndexMap[`${m}/${y}`] = runningIndex;
        });

        setCumulativeIndex(formattedIndexMap);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch IPCA:", error);
        setLoading(false);
      }
    };

    fetchIPCA();
  }, []);

  return { ipcaData, cumulativeIndex, loading };
};
