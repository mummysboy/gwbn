/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['Source Sans Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      colors: {
        background: '#ffffff',
        foreground: '#1a1a1a',
        primary: {
          DEFAULT: '#1a1a1a',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f8f9fa',
          foreground: '#1a1a1a',
        },
        muted: {
          DEFAULT: '#f8f9fa',
          foreground: '#6c757d',
        },
        border: '#dee2e6',
        accent: {
          DEFAULT: '#dc3545',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        DEFAULT: '0',
      },
    },
  },
  plugins: [],
}
