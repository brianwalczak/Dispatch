import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        $: 'readonly',
        jQuery: 'readonly'
      }
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // it's so annoying
      'react/prop-types': 'off' // we're extra careful anyway
    },
  },
  {
    files: ["tailwind.config.js", "vite.config.js"],
    languageOptions: {
      globals: globals.node
    }
  },
];