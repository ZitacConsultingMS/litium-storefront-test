const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'prettier'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: 'next/link',
          message: "Please use 'components/Link' instead",
        },
      ],
    },
  }),
];
