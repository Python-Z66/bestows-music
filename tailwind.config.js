/**
 * @type(import('tailwindcss').Config)
 */

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ncm-red': '#EC4141', // 网易云红
        'ncm-bg': '#2B2B2B', // 深色背景
        'ncm-sidebar': '#2F2F2F', // 侧边栏背景
        'ncm-search': '#4B4B4B' // 搜索框背景
      }
    }
  },
  plugins: []
}
