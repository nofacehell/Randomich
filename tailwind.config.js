/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Cream / paper editorial palette
        paper: {
          50: '#faf6ec',     // page bg, lightest
          100: '#f3ecdb',    // sidebar / surface
          200: '#e8dec5',    // borders, dividers
          300: '#d8caa9',
        },
        ink: {
          50: '#faf6ec',     // text on dark surfaces (rare)
          400: '#9b8e76',    // muted secondary text
          500: '#6e6450',    // small caps labels
          700: '#3a3327',    // body text
          900: '#1a160e',    // headlines + black CTAs
          950: '#0c0a08',
        },
        ember: {
          400: '#ff8a3a',
          500: '#f76b1c',    // CTA orange
          600: '#d4520f',
        },
      },
      letterSpacing: {
        widest2: '0.18em',
      },
    },
  },
  plugins: [],
};
