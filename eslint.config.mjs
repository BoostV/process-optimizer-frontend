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
    rules: {
      // eslint-plugin-react-hooks 7 added this rule; it flags a few existing,
      // intentional patterns (e.g. an SSR hydration guard). Keep as guidance
      // rather than a hard error; address the call sites as separate work.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: [
      '.next/',
      'out/',
      'packages/**/out/',
      'packages/**/dist/',
      'sample-app/**/dist/',
      // Vendored, untracked sibling projects for local e2e testing — not part
      // of this repo (see AGENTS.md). They carry their own eslint configs.
      'brownie-bee/',
      'brownie-bee-backend/',
      'process-optimizer-api/',
    ],
  },
]
