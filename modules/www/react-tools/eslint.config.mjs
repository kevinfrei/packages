import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
// import pluginReact from 'eslint-plugin-react';
// import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  // { plugins: { react: { pluginReact }, reactHooks: { pluginReactHooks } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
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
