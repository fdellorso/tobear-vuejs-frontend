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

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...pluginYml.configs['flat/prettier'],
  skipFormatting,
])
