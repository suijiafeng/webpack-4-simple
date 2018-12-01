const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');
const path = require('path');
const Glob = require('glob')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const isProd = process.env.NODE_ENV !== 'dev'
console.log(isProd)

var getHtmlConfig = function (name, chunks) {
  return {
    template: `./src/pages/${name}/index.html`,
    filename: `${name}.html`,
    // favicon: './favicon.ico',
    // title: title,
    inject: true,
    hash: true, //开启hash  ?[hash]
    // chunksSortMode: 'none', //如果使用webpack4将该配置项设置为'none'
    chunks: chunks,
    minify: !isProd ? false : {
      removeComments: true, //移除HTML中的注释
      collapseWhitespace: true, //折叠空白区域 也就是压缩代码
      removeAttributeQuotes: true, //去除属性引用
    },
  };
};

function getEntry() {
  var entry = {};
  //读取src目录所有pages入口
  Glob.sync('./src/pages/**/*.js')
    .forEach(function (name) {
      var start = name.indexOf('src/') + 4,
        end = name.length - 3;
      var eArr = [];
      var n = name.slice(start, end);
      n = n.slice(0, n.lastIndexOf('/')); //保存各个组件的入口 
      n = n.split('/')[1];
      eArr.push(name);
      entry[n] = eArr;
    });
  return entry;
};
console.log(Glob.sync('./src/pages/**/*.js'))
module.exports = {
  entry: getEntry(),
  output: {
    publicPath: isProd ? './' : '',
    filename: 'js/[name][hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: { // 抽离第三方插件
          test: /node_modules/, // 指定是node_modules下的第三方包
          chunks: 'initial',
          name: 'vendor', // 打包后的文件名，任意命名    
          // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
          priority: 10
        },
        utils: { // 抽离自己写的公共代码，common这个名字可以随意起
          chunks: 'initial',
          name: 'common', // 任意命名
          minSize: 0, // 只要超出0字节就生成一个新包
          minChunks: 2
        }
      }
    }
  },
  module: {
    rules: [{
        test: /\.(sa|sc|c)ss$/,
        use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('autoprefixer')('last 100 versions') //浏览器兼容版本
              ];
            }
          }
        }, 'sass-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      // {
      //   test: /\.html$/,
      //   use: [{
      //     loader: "html-loader",
      //     options: {
      //       minimize: true
      //     }
      //   }]
      // },
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, './dist/'),
    hot: true,
    open: true
  },
  plugins: [
    new CleanWebpackPlugin(['dist']), //清理文件夹dist
    new webpack.HotModuleReplacementPlugin(), //热更新
    new MiniCssExtractPlugin({
      filename: "css/[name][hash].css",
      chunkFilename: "[id].css"
    })
  ]
}


const entryObj = getEntry();
const htmlArray = [];
Object.keys(entryObj).forEach(element => {
  htmlArray.push({
    _html: element,
    title: '',
    chunks: ['vendor', 'common', element]
  })
})

//自动生成html模板
htmlArray.forEach((element) => {

  module.exports.plugins.push(new HtmlWebPackPlugin(getHtmlConfig(element._html, element.chunks)));
})