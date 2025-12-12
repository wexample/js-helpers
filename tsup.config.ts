import {defineConfig} from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/helper/string.ts',
    'src/helper/log.ts',
    'src/helper/object.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  minify: false,
  splitting: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  outDir: 'dist'
});
