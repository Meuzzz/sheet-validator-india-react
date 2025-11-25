import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const external = [
  'react', 
  'react-dom', 
  'react/jsx-runtime',
  'react/jsx-dev-runtime'
];

export default [
  // ESM Build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.es.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
      }),
    ],
  },

  // CJS Build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
      }),
    ],
  },

  // UMD Build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'SheetValidatorIndia',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react/jsx-runtime': 'jsxRuntime',
        'react/jsx-dev-runtime': 'jsxDevRuntime'
      },
      sourcemap: true,
    },
    plugins: [
      resolve({ preferBuiltins: false }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
      }),
    ],
  },
];