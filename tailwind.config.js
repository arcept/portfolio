/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#08090a',
        carbon: '#0f1011',
        obsidian: '#161718',
        graphite: '#23252a',
        ash: '#62666d',
        fog: '#8a8f98',
        mist: '#d0d6e0',
        paper: '#ffffff',
        accent: '#e4f222',
        'chart-1': '#eb5757',
        'chart-2': '#6366f1',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'plex-sans': ['var(--font-ibm-plex-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['72px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        heading: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        body: ['16px', { lineHeight: '1.5' }],
        caption: ['13px', { lineHeight: '1.4' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '510',
        semibold: '590',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        24: '96px',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
