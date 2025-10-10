import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import prettierPlugin from 'eslint/eslint-plugin-prettier'
import prettierConfig from 'eslint/eslint-config-prettier'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      js,
      prettierPlugin,
    },
    extends: ['js/recommended', prettierConfig],
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      'no-console': 'warn',
      eqeqeq: 'warn',
      curly: 'warn',
      'no-else-return': 'warn',
    },
    languageOptions: { globals: globals.browser },
  },
])
