import { defineConfig } from 'eslint/config'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import stylisticJs from '@stylistic/eslint-plugin-js'
import mochaPlugin from 'eslint-plugin-mocha'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),
    files: ['*.{ts,mjs}'],

    plugins: {
        '@typescript-eslint': typescriptEslint,
        '@stylistic/js': stylisticJs
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 6,
        sourceType: 'module',
    },

    rules: {
        '@stylistic/js/quotes': ['warn', 'single'],
        '@stylistic/js/quote-props': ['error', 'as-needed'],
    },
}, {
    extends: [...compat.extends('eslint:recommended'), mochaPlugin.configs.recommended],
    files: ['test/**/*.mjs', 'test/**/*.ts'],

    plugins: {
        '@typescript-eslint': typescriptEslint,
        '@stylistic/js': stylisticJs
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 6,
        sourceType: 'module',
    },

    rules: {
        'mocha/no-setup-in-describe': ['off'],
        '@stylistic/js/quotes': ['warn', 'single'],
        '@stylistic/js/quote-props': ['error', 'as-needed'],
    },
}, {
    extends: [...compat.extends('eslint:recommended'), mochaPlugin.configs.recommended],
    files: ['test/**/*.js', '*.js'],


    plugins: {
        '@stylistic/js': stylisticJs
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: 8,
        sourceType: 'commonjs',
    },

    rules: {
        'mocha/no-setup-in-describe': ['off'],
        '@stylistic/js/quotes': ['warn', 'single'],
        '@stylistic/js/quote-props': ['error', 'as-needed'],
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }
        ]
    },
}]);