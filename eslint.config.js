import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginYml from 'eslint-plugin-yml'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import json from '@eslint/json'
import markdown from '@eslint/markdown'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },
  {
    files: ['**/*.json'],
    plugins: {
      json,
    },
    language: 'json/jsonc',
  },
  {
    files: ['**/*.md'],
    plugins: {
      markdown,
    },
    extends: ['markdown/recommended'],
    rules: {
      'markdown/no-html': 'error',
    },
  },
  {
    files: ['**/TODO.md'],
    plugins: { markdown },
    language: 'markdown/commonmark',
    rules: {
      'markdown/no-missing-label-refs': 'off',
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '.opencode/**']),

  {
    files: ['**/*.{js,mjs,jsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,jsx,vue}'],
    ...js.configs.recommended,
  },
  ...pluginVue.configs['flat/essential'].map(cfg => ({
    ...cfg,
    files: cfg.files || ['**/*.{js,mjs,jsx,vue}'],
  })),
  ...pluginYml.configs['flat/prettier'],
  skipFormatting,
])
