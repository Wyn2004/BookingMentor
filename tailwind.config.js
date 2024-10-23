/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        Merriweather: ['Merriweather']
      },
      backgroundColor: {
        'main-1': '#EA580B',
        'main-2': '#DD813C'
      },
      colors: {
        'main-1': '#EA580B'
      },
      height: {
        'min-heigh-custom': 'calc(100vh - 116px)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
