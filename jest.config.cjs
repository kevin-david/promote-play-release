"use strict";
/** @type {import('jest').Config} */
const config = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs'
            }
        }]
    },
    verbose: true
};

module.exports = config;
