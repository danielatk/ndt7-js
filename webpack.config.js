path = require('path');
const merge = require('webpack-merge').merge;

const config = {
  entry: './src/ndt7.js',
  mode: 'development',
  output: {
    filename: 'ndt7.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
    library: {
      name: 'ndt7',
      type: 'umd',
    },
  },
  externals: {
    'web-worker': 'umd web-worker',
    'node-fetch': 'umd node-fetch',
    'ws': 'umd ws',
  },
  externalsPresets: {
    node: true,
  },
};

// Generate two separate bundles for the client and the server.
const targets = ['web', 'node'].map((target) => {
  const base = merge(config, {
    target: target,
    output: {
      filename: `ndt7.${target}.js`,
    },
  });
  return base;
});

module.exports = targets;
