import { useState, useEffect } from 'react';

export type IPCAValue = {
  data: string;
  valor: string;
};

export const useIPCAData = () => {
  const [ipcaData, setIpcaData] = useState<number[]>([]);
  const [cumulativeIndex, setCumulativeIndex] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIPCA = async () => {
      try {
        // BCB API for IPCA Monthly (%)
        const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json');
        const data: IPCAValue[] = await response.json();
        
        // Filter from 2002 onwards to match fuel data
        const filtered = data.filter(item => {
          const year = parseInt(item.data.split('/')[2]);
          return year >= 2002;
        });

        const rawValues = filtered.map(item => parseFloat(item.valor));
        setIpcaData(rawValues);

        // Calculate cumulative index: Index_t = Index_{t-1} * (1 + IPCA_t / 100)
        let currentIndex = 100;
        const indexSeries = rawValues.map(val => {
          currentIndex = currentIndex * (1 + val / 100);
          return currentIndex;
        });
        setCumulativeIndex(indexSeries);
        
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
