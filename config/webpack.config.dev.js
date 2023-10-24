const { join } = require('path')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const getStyleLoader = pre => {
  return [
    'style-loader',
    'css-loader',
    {
      // 处理 css 兼容问题 配合package.json 中的browserslist来限制兼容性程度
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['postcss-preset-env'],
        },
      },
    },
    pre,
  ].filter(Boolean)
}

module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[hash:8][ext][query]',
  },
  module: {
    rules: [
      {
        oneOf: [
          // 处理 css less s[ac]ss styl 等样式文件
          {
            test: /\.css$/i,
            use: getStyleLoader(),
          },
          {
            test: /\.less$/i,
            use: getStyleLoader('less-loader'),
          },
          {
            test: /\.s[ac]ss$/i,
            use: getStyleLoader('sass-loader'),
          },
          {
            test: /\.styl$/i,
            use: getStyleLoader('stylus-loader'),
          },
          // 处理 图片
          {
            test: /\.(jpe?g|png|gif|webp|svg)$/,
            type: 'asset',
            // 小于 4kb 用 base64
            parser: {
              dataUrlCondition: {
                maxSize: 4 * 1024,
              },
            },
          },
          // 处理其他资源 包括字体图标 音视频等
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
          },
          // 处理 js 包括 babel 编译 js 代码 eslint 检查 js 代码(eslint是插件，写在 plugins 里)
          {
            test: /\.jsx?$/,
            include: join(__dirname, '../src'),
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              plugins: [
                // "@babel/plugin-transform-runtime", // presets中包含了
                'react-refresh/babel', // 开启js的HMR功能
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      context: join(__dirname, '../src'),
      exclude: 'node_modules',
      cache: true,
      cacheLocation: join(__dirname, '../node_modules/.cache/.eslintcache'),
    }),
    new HtmlWebpackPlugin({
      template: join(__dirname, '../public/index.html'),
    }),
    new ReactRefreshWebpackPlugin(), // 解决js的HMR功能运行时全局变量的问题
    // 将public下面的资源复制到dist目录去（除了index.html）
    new CopyPlugin({
      patterns: [
        {
          from: join(__dirname, '../public'),
          to: join(__dirname, '../dist'),
          toType: 'dir',
          noErrorOnMissing: true, // 不生成错误
          globOptions: {
            // 忽略文件
            ignore: ['**/index.html'],
          },
          info: {
            // 跳过terser压缩js
            minimized: true,
          },
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}`,
    },
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'], // 自动补全文件扩展名，让jsx可以使用
  },
  devServer: {
    open: true,
    host: 'localhost',
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true, // 解决react-router刷新404问题
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
}
