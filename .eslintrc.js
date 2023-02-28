module.exports = {
    env: {
        node: true,
        es2022: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    root: true,
    rules: {
        indent: [
            'error',
            4,
            {
                SwitchCase: 1
            }
        ],
        quotes: ['error', 'single'],
        semi: ['error', 'always']
    },
    overrides: [{
        files: ['**/*.test.js'],
        plugins: ['jest'],
        extends: [
            'plugin:jest/recommended',
            'plugin:jest/style'
        ]
    }]
};
