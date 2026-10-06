/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#d9730d',
          hover: '#c2650b',
          dark: '#b5570f',
          darker: '#8f460c',
          tint: '#fbe7d4',
        },
        wordmark: '#5c3a1e',
        tagline: '#8a6a52',
        ink: {
          DEFAULT: '#1c1b1a',
          soft: '#4a453d',
        },
        muted: {
          DEFAULT: '#9a9284',
          light: '#b3ada2',
          placeholder: '#c9c2b4',
        },
        surface: '#f7f6f3',
        border: {
          DEFAULT: '#eceae5',
          light: '#f2f0eb',
          dashed: '#d3cec5',
        },
        danger: {
          DEFAULT: '#c14a4a',
          bg: '#fdecec',
          border: '#f3c9c9',
        },
        success: {
          DEFAULT: '#4c9a6a',
          bg: '#eaf5ee',
          border: '#c8e6d3',
        },
        info: '#3f7ec4',
        accentPink: '#c25b8f',
        dark: {
          card: '#2a2620',
          gold: '#f4c98a',
          muted: '#c9c2b4',
        },
      },
      borderRadius: {
        xl2: '14px',
      },
      boxShadow: {
        card: '0 10px 24px rgba(28,27,26,0.10)',
        'card-lg': '0 20px 40px rgba(0,0,0,0.18)',
        modal: '0 30px 60px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
