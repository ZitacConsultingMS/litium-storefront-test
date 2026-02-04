const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.white,
        secondary: colors.black,
        'secondary-2': colors.slate[400],
        'secondary-3': colors.gray[100],
        tertiary: colors.gray[300],
        disabled: colors.neutral[300],
        hover: colors.gray[100],
        'hover-1': colors.neutral[600],
        error: colors.red[500],
        'disabled-background': '#f8f8f8',
        'disabled-border': '#dcdcdc',
        'seasea-blue': '#1d3d91',
        'af-orange': '#ff8a00',
        'af-bluegreen': '#214D65',
        'dark-green': '#0B615C',
        'light-green': '#62D99B',
        'dark-gray': '#696969',
        'medium-gray': '#efefef',
        'body-background': '#f9f9f9',
        'border': '#d0d0d0',
        'red': '#f36957',
      },
      textColor: {
        primary: '#1c1c1c',
        secondary: colors.white,
        tertiary: colors.neutral[400],
        hyperlink: colors.indigo[500],
        error: colors.red[500],
      },
      screens: {
        hoverable: { raw: '(pointer:fine)' },
        touchable: { raw: '(pointer:coarse)' },
        mobile: { max: '767px' },
        print: { raw: 'print' },
      },
      fontSize: {
        h1: ['2.5rem', '1.2'],
        h2: ['2rem', '1.2'],
        h3: ['1.75rem', '1.2'],
        h4: ['1rem', '1.2'],
        h5: ['0.875rem', '1.2'],
        h6: ['0.75rem', '1.2'],
      },
      fontFamily: {
        'body': ['Karla', 'sans-serif'],
        'heading': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(function ({ addVariant, e }) {
      addVariant("af", "html.af &");
    }),
  ],
};
