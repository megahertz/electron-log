#!/usr/bin/env node

import esbuild from 'esbuild';
import path from 'path';
import url from 'url';

// eslint-disable-next-line no-underscore-dangle
const __root = path.dirname(url.fileURLToPath(import.meta.url));

main(process.argv).catch((e) => {
  console.error(e.stack); // eslint-disable-line no-console
  process.exit(1);
});

async function main() {
  const esbuildConfigs = createESBuildConfigs();

  const startBuildTimeMs = Date.now();
  await Promise.all(
    Object.values(esbuildConfigs).map((config) => esbuild.build(config)),
  );

  const duration = ((Date.now() - startBuildTimeMs) / 1000).toFixed(2);
  console.info( // eslint-disable-line no-console
    `✓ Built complete in ${duration}s`,
  );
}

/**
 * @returns {Record<string, BuildOptions>}
 */
function createESBuildConfigs() {
  return {
    main: {
      banner: {
        js:
          'import { createRequire } from \'module\';\n'
          + 'const require = createRequire(import.meta.url);',
      },
      bundle: true,
      entryPoints: [path.resolve(__root, 'src/main.ts')],
      external: ['electron'],
      format: 'esm',
      outfile: path.resolve(__root, 'dist/main.js'),
      platform: 'node',
      sourcemap: 'linked',
      target: 'node20',
    },

    renderer: {
      bundle: true,
      entryPoints: [path.resolve(__root, 'src/renderer.ts')],
      format: 'esm',
      outfile: path.resolve(__root, 'dist/renderer.js'),
      platform: 'browser',
      sourcemap: 'linked',
    },
  };
}

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */
