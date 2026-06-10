import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // pluginReactConfig,
  prettierConfig,
  {
    ignores: ['node_modules', 'src/**/*.d.ts', '**/__tests__/*.*'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
