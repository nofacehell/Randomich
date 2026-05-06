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
        ink: {
          50: '#f5f1e8',     // off-white text on dark
          100: '#e8e1d0',
          400: '#9b8e7a',    // muted secondary
          500: '#73685a',    // small caps labels
          900: '#0c0a08',    // base bg
          950: '#070605',    // darker bg
        },
        ember: {
          400: '#ff8a3a',    // accent orange
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
