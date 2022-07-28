const path = require('path');

module.exports = function(environment) {
  const DIST = path.resolve(__dirname, 'dist'),
        env = environment || {};

  return {
    mode: env.production ? 'production' : 'development',
    output: {
      clean: true,
      path: DIST,
      filename: 'index.js',
    },
    resolve: {
      extensions: [ '.js', '.ts' ],
    },
    optimization: {
      sideEffects: false,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
            compilerOptions: {
              noEmit: false,
            },
          },
        },
      ],
    },
  };
};
