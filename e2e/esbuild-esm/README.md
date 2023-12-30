# electron-log-e2e-esbuild-esm

Currently, it requires the following workaround for esbuild to make it work:

```js
const esBuildOptions = {
  banner: {
    js:
      'import { createRequire } from \'module\';\n'
      + 'const require = createRequire(import.meta.url);',
  },
  ...
};
```

See https://github.com/evanw/esbuild/issues/1921
