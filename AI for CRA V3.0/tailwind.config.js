/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx}',
    './src/index.html'
  ],
  theme: {
    extend: {
      // Larger font sizes for accessibility (User Experience First)
      fontSize: {
        'xs': ['14px', '1.5'],
        'sm': ['16px', '1.5'],
        'base': ['18px', '1.5'],      // Increased from 16px
        'lg': ['20px', '1.5'],
        'xl': ['24px', '1.5'],
        '2xl': ['28px', '1.5'],
        '3xl': ['32px', '1.5'],
        '4xl': ['36px', '1.2'],
      },
      // Larger spacing for better touch targets
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '7': '1.75rem',   // 28px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
      },
      // Rounded corners for friendly appearance
      borderRadius: {
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      // Minimum touch target size (44px)
      minHeight: {
        '11': '2.75rem',  // 44px
        '12': '3rem',     // 48px
      },
      // Colors with good contrast (WCAG AA compliant)
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // Main brand color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
}
