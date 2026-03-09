/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 25px rgba(169, 120, 255, 0.35)',
        panel: '0 25px 60px rgba(18, 8, 40, 0.45)'
      }
    }
  },
  plugins: []
};
