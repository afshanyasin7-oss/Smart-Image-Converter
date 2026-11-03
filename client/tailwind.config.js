/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Every colour resolves through a CSS variable defined in
      // src/styles/theme.css. The literal fallback inside each var() is the
      // default palette, so the app still renders correctly if theme.css is
      // ever emptied or deleted. The channel-triplet form is what enables
      // opacity modifiers (bg-primary/10, text-muted-foreground/70).
      colors: {
        background: 'rgb(var(--background, 248 249 250) / <alpha-value>)',
        foreground: 'rgb(var(--foreground, 11 15 25) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card, 255 255 255) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground, 11 15 25) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted, 241 245 249) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground, 100 116 139) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary, 13 124 102) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground, 255 255 255) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary, 241 245 249) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground, 11 15 25) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent, 240 253 250) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground, 13 124 102) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive, 220 38 38) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground, 255 255 255) / <alpha-value>)',
        },
        success: 'rgb(var(--success, 22 163 74) / <alpha-value>)',
        warning: 'rgb(var(--warning, 217 119 6) / <alpha-value>)',
        border: 'rgb(var(--border, 0 0 0) / <alpha-value>)',
        input: 'rgb(var(--input, 0 0 0) / <alpha-value>)',
        ring: 'rgb(var(--ring, 13 124 102) / <alpha-value>)',
      },
      // Radius derives from one --radius token so rounded-md/lg/xl stay in
      // proportion instead of drifting per component.
      borderRadius: {
        md: 'calc(var(--radius, 0.625rem) - 4px)',
        lg: 'calc(var(--radius, 0.625rem) - 2px)',
        xl: 'var(--radius, 0.625rem)',
        '2xl': 'calc(var(--radius, 0.625rem) + 4px)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'ambient': 'var(--shadow-ambient)',
        'hover': 'var(--shadow-hover)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
