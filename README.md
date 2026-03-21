# 📊 Hub de Análise Executiva: Preços de Combustíveis no Brasil

Uma plataforma analítica de alta performance desenvolvida para visualização histórica, correlação de mercado e avaliação de governança sobre o setor de combustíveis brasileiro (2002-2026).

---

## 🚀 Tecnologias (Stack)

O projeto utiliza o que há de mais moderno em desenvolvimento web frontend para garantir performance, tipagem forte e interfaces fluidas:

- **Core**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) (para HMR ultra-rápido)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) com design system customizado via `tokens.ts`.
- **Animações**: [Framer Motion](https://www.framer.com/motion/) (micro-interações e transições de estado).
- **Gráficos**: [Recharts](https://recharts.org/) (visualização de dados vetoriais responsiva).
- **Icons**: [Lucide React](https://lucide.dev/).
- **Exportação**: [html2canvas](https://html2canvas.hertzen.com/) (captura de dashboards para relatórios).

---

## 📈 Componentes Gráficos e Insights

### 1. Horizonte Integrado de Preços (`FuelChart`)
Gráfico de linhas interativo que consolida o histórico de **Gasolina, Etanol e Diesel**.
- **Análise Nominal vs. Real**: Filtro que ajusta os preços históricos pelo IPCA (inflação), permitindo comparar o poder de compra de diferentes décadas.
- **Predição por IA**: Algoritmo de tendência que projeta os próximos 12 meses baseado em sazonalidade senoidal.
- **Eventos Históricos**: Linhas de referência verticais marcando momentos críticos (Crise de 2008, Greve dos Caminhoneiros, Guerra na Ucrânia, etc.).

### 2. Preço Médio do Barril de Petróleo (`BrentChart`)
Monitoramento do **Brent (USD)** sincronizado temporalmente com os preços domésticos.
- **Insight**: Permite visualizar o *gap* entre a cotação internacional e o repasse nas bombas brasileiras.

### 3. Análise de Paridade de Eficiência (`ParityChart`)
Gráfico de área que monitora a relação **Etanol / Gasolina**.
- **Técnica**: Baseia-se na regra dos **70%**. Se o Etanol custa menos de 70% da gasolina, o gráfico indica vantagem financeira para o consumidor.

---

## 🧠 Inteligência e Técnicas de Análise

O dashboard não apenas exibe dados, mas aplica camadas de inteligência para gerar insights executivos:

### Sistema de Avaliação Analítica (Rating Governamental)
Desenvolvi um motor de cálculo (`calculateGovRating`) que atribui uma nota de **0 a 100** para cada período de governo baseado em:
- **Estabilidade (40%)**: Medida através do Desvio Padrão dos preços. Menor volatilidade resulta em pontuação superior.
- **Contexto Global (50%)**: Comparação delta entre a subida do **Brent internacional** vs. **Combustível local**. Um governo que mantém preços estáveis frente a uma disparada do petróleo recebe rating máximo.
- **Resiliência (10%)**: Pontuação extra para estabilidade mantida durante eventos de crise documentados.

### Metodologia de Dados
- **Sincronização SGS (Banco Central)**: Consumo real da API do BCB para obter índices do IPCA em tempo real.
- **Normalização de Mandatos**: Agrupamento automático de estatísticas (Média, Mínimo, Máximo e Variação %) por períodos presidenciais.

---

## 🎨 Design System
O projeto utiliza um conceito de **Executive Glassmorphism**:
- Fundos em `slate-950/80` com desfoque de fundo (backdrop-blur).
- Bordas sutis em `white/5`.
- Tipografia focada em legibilidade técnica (Monospace para números e Display para títulos).
- Cores de destaque: `Teal` (Gasolina), `Amber` (Etanol) e `Red` (Diesel).

---

*Desenvolvido com foco em precisão analítica e experiência do usuário profissional.*
