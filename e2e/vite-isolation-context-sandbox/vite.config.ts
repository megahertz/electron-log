import { builtinModules } from 'module';
import path from 'path';
import { defineConfig, mergeConfig, UserConfig } from 'vite';
import electronPlugin from 'vite-plugin-electron'
import electronRendererPlugin from 'vite-plugin-electron-renderer'

const commonConfig: UserConfig = {
  base: path.join(__dirname, 'dist'),
  resolve: {
    alias: {
      'electron-log': path.resolve(__dirname, '../..'),
    },
  },
  build: {
    minify: false,
    outDir: 'dist',
    commonjsOptions: {
      include: /electron-log/,
    },
    rollupOptions: {
      external: ['electron', ...builtinModules]
    },
  },
};

export default defineConfig({
  ...commonConfig,
  plugins: [
    electronPlugin([
      {
        entry: 'src/main.ts',
        vite: mergeConfig(commonConfig, {
          resolve: {
            browserField: false,
          }
        }),
      },
    ]),
    electronRendererPlugin(),
  ],
});
