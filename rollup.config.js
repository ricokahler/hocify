import babel from '@rollup/plugin-babel';

const extensions = ['.js', '.ts', '.tsx'];

export default [
  {
    input: './index.js',
    output: {
      file: './dist/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'hocify',
      globals: { react: 'React' },
    },
    plugins: [
      babel({
        babelrc: false,
        presets: [
          ['@babel/preset-env', { targets: { node: true } }],
          '@babel/preset-react',
        ],
        babelHelpers: 'bundled',
        extensions,
      }),
    ],
    external: [/^@babel\/runtime/, 'react'],
  },
  {
    input: './index.js',
    output: {
      file: './dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      babel({
        babelrc: false,
        presets: ['@babel/preset-react'],
        plugins: ['@babel/plugin-transform-runtime'],
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    external: [/^@babel\/runtime/, 'react'],
  },
];
