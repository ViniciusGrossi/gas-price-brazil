export const tokens = {
  colors: {
    background: {
      primary: '#0b1620',    // Midnight Onyx
      secondary: '#0e1a2a',  // Executive Navy
      glass: 'rgba(255, 255, 255, 0.03)',
      overlay: 'rgba(2, 6, 23, 0.85)',
    },
    accent: {
      primary: '#14b8a6',    // Deep Teal
      secondary: '#06b6d4',  // Soft Cyan
      muted: '#475569',     // Slate Slate
      success: '#a3e635',    // Sage Green
      warning: '#fbbf24',    // Amber
      error: '#f87171',      // Muted Red
    },
    text: {
      heading: '#f1f5f9',
      body: '#94a3b8',
      muted: '#475569',
      accent: '#2dd4bf',
    }
  },
  typography: {
    fontFamily: {
      display: '"Space Grotesk", system-ui, sans-serif',
      sans: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace' // Reserved for data
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
    }
  },
  borderRadius: {
    card: '16px',
    button: '8px',
    input: '8px',
  },
  animation: {
    duration: {
      fast: '200ms',
      normal: '400ms',
      slow: '600ms',
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
} as const;
