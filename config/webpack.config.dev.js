const { join } = require('path')
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
      // 处理 js 包括 babel 编译 js 代码 eslint 检查 js 代码(eslint是插件，卸载 plugins 里)
      {
        test: /\.(jsx|js)$/,
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
}
