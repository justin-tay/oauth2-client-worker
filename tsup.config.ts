/* eslint-disable no-param-reassign */
import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  const production = options.env?.NODE_ENV === 'production';
  return {
    target: 'es2020',
    format: ['cjs', 'esm'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    esbuildOptions(buildOptions) {
      if (production) {
        buildOptions.drop = ['console', 'debugger'];
      }
    },
  };
});
