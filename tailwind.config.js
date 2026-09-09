/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Tailwind consumes the CSS custom properties from styles/tokens.css.
    // Nothing here invents a colour that §2.1 does not define.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      void: 'var(--void)',
      hull: 'var(--hull)',
      seam: 'var(--seam)',
      bone: 'var(--bone)',
      amber: 'var(--amber)',
      oxide: 'var(--oxide)',
      verdigris: 'var(--verdigris)',
    },
    borderRadius: {
      none: '0',
      full: '9999px',
    },
    fontFamily: {
      display: ['Saira Condensed', 'Arial Narrow', 'sans-serif'],
      body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.8rem', { lineHeight: '1.4' }],
      sm: ['0.9333rem', { lineHeight: '1.45' }],
      base: ['1rem', { lineHeight: '1.5' }],
      lg: ['1.2667rem', { lineHeight: '1.4' }],
      xl: ['1.6rem', { lineHeight: '1.3' }],
      '2xl': ['2rem', { lineHeight: '1.2' }],
      '3xl': ['2.4667rem', { lineHeight: '1.15' }],
      '4xl': ['3.1333rem', { lineHeight: '1.1' }],
    },
    extend: {
      spacing: {
        band: '1px',
      },
    },
  },
  plugins: [],
};
