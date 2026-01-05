import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  minify: false,
  splitting: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  outDir: 'dist',
});
