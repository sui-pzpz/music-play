/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        /* 浅抹茶绿色板 - 低饱和森系 */
        emerald: {
          50: '#f2f7ef',
          100: '#e4efe0',
          200: '#c8dfc0',
          300: '#a8c99b',
          400: '#8bb07e',
          500: '#739968',
          600: '#5c7d52',
          700: '#4a6442',
          800: '#3a4f34',
          900: '#2d3d29',
          950: '#1a2b16',
        },
        /* 暖抹茶强调色 - 用于按钮/进度条等原orange位置 */
        orange: {
          50: '#f0f4ec',
          100: '#dce6d3',
          200: '#b9ceaa',
          300: '#96b382',
          400: '#7d9a6a',
          500: '#678255',
          600: '#536e43',
          700: '#435937',
          800: '#36472c',
          900: '#2b3823',
        },
        /* 浅绿背景色 */
        green: {
          50: '#f4f8f2',
          100: '#e8f0e4',
          200: '#d0e0c8',
          300: '#b0cc9f',
          400: '#8fb07e',
          500: '#739968',
          600: '#5c7d52',
          700: '#4a6442',
          800: '#3a4f34',
          900: '#2d3d29',
        },
        /* 暖米白色板 */
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F5F0E8',
          300: '#EDE7DD',
          400: '#E2DAD0',
        },
      },
      borderRadius: {
        'card': '16px',
        'btn': '14px',
      },
      boxShadow: {
        'matcha': '0 4px 20px rgba(115, 153, 104, 0.08), 0 1px 4px rgba(115, 153, 104, 0.04)',
        'matcha-md': '0 6px 28px rgba(115, 153, 104, 0.10), 0 2px 6px rgba(115, 153, 104, 0.05)',
        'matcha-lg': '0 8px 36px rgba(115, 153, 104, 0.12), 0 2px 8px rgba(115, 153, 104, 0.06)',
      },
    },
  },
  plugins: [],
};
