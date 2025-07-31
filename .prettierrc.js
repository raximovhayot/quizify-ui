// Prettier configuration following start-ui standards
/** @type {import("prettier").Options} */
const config = {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  arrowParens: 'always',
  importOrder: ['^react$', '^(?!^react$|^@/|^[./]).*', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['jsx', 'typescript'],
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};

module.exports = config;
