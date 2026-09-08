import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Globbed with a leading **/ so build output nested under stray directories
  // (an old web/ tree still sits here untracked) is ignored too, not just the root.
  { ignores: ['**/.next/**', '**/node_modules/**', 'public/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // The pages are a faithful port of static markup: plain <img> is intentional,
      // and next/image would re-encode art-directed assets served straight from /public.
      '@next/next/no-img-element': 'off',
    },
  },
];

export default config;
