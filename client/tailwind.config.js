/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'fi-bg':      'rgb(var(--color-bg) / <alpha-value>)',
        'fi-surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'fi-border':  'rgb(var(--color-border) / <alpha-value>)',
        'fi-text':    'rgb(var(--color-text) / <alpha-value>)',
        'fi-muted':   'rgb(var(--color-muted) / <alpha-value>)',
        'fi-accent':  'rgb(var(--color-accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Lato"', 'Georgia', 'serif'],
        body:    ['"Lora"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans:    ['"Lora"', 'Georgia', 'serif'],
        // display: ['"Playfair Display"', 'Georgia', 'serif'],
        // body:    ['"Lora"', 'Georgia', 'serif'],
        // mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        // sans:    ['"Lora"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
