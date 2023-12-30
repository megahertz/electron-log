#!/usr/bin/env node

'use strict';

const esbuild = require('esbuild');
const path = require('path');

const __root = __dirname; // eslint-disable-line no-underscore-dangle

if (module === require.main) {
  main(process.argv).catch((e) => {
    console.error(e.stack); // eslint-disable-line no-console
    process.exit(1);
  });
}

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
      bundle: true,
      entryPoints: [path.resolve(__root, 'src/main.ts')],
      external: ['electron'],
      format: 'cjs',
      outfile: path.resolve(__root, 'dist/main.js'),
      platform: 'node',
      sourcemap: 'linked',
      target: 'node18',
    },

    renderer: {
      bundle: true,
      entryPoints: [path.resolve(__root, 'src/renderer.ts')],
      format: 'cjs',
      outfile: path.resolve(__root, 'dist/renderer.js'),
      platform: 'browser',
      sourcemap: 'linked',
    },
  };
}

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */
