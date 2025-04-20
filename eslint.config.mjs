import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

import github from 'eslint-plugin-github';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(["**/dist/", "**/lib/", "**/node_modules/", "**/jest.config.js"]),
    github.getFlatConfigs().recommended,
    tseslint.configs.recommended,
    {
        name: "Jest",
        plugins: {
            jest,
        },
        files: ["**/*.test.ts"]
    },
    {
        name: "Sources",
        languageOptions: {
            globals: {
                ...globals.node,
                ...jest.environments.globals.globals,
            },

            parser: tsParser,
            ecmaVersion: 9,
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            "eslint-comments/no-use": "off",
            "import/no-namespace": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",

            "@typescript-eslint/explicit-member-accessibility": ["error", {
                accessibility: "no-public",
            }],

            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/array-type": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            camelcase: "off",
            "@typescript-eslint/consistent-type-assertions": "error",

            "@typescript-eslint/explicit-function-return-type": ["error", {
                allowExpressions: true,
            }],

            "func-call-spacing": ["error", "never"],
            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-extraneous-class": "error",
            "@typescript-eslint/no-for-in-array": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "error",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",
            "@typescript-eslint/no-useless-constructor": "error",
            "@typescript-eslint/no-var-requires": "error",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-function-type": "warn",
            "@typescript-eslint/prefer-includes": "error",
            "@typescript-eslint/prefer-string-starts-ends-with": "error",
            "@typescript-eslint/promise-function-async": "error",
            "@typescript-eslint/require-array-sort-compare": "error",
            "@typescript-eslint/restrict-plus-operands": "error",
            semi: "off",
            "@typescript-eslint/unbound-method": "error",
            "i18n-text/no-en": "off",
            "sort-imports": "off",
            "no-shadow": "off",
            "@typescript-eslint/no-shadow": "error",
        },
    },
]);