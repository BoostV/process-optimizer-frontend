import boostv from '@boostv/eslint-config'

export default [
  ...boostv,
  {
    files: [
      'packages/**/*.ts',
      'packages/**/*.tsx',
      'sample-app/**/*.ts',
      'sample-app/**/*.tsx',
    ],
  },
  {
    ignores: [
      '.next/',
      'out/',
      'packages/**/out/',
      'packages/**/dist/',
      'sample-app/**/dist/',
    ],
  },
]
