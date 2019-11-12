# Enhanced Scripts

> 此项目是基于 [react-scripts](https://github.com/facebook/create-react-app/tree/master/packages/react-scripts) 修改而来，当中融合了[Elixir Phoenix Umbrella 项目结构](https://medium.com/@cedric_30386/how-to-build-multiple-web-apps-with-elixir-thanks-to-umbrella-part-2-set-up-the-project-800d6d731dbd)
>
> 与 Phoenix Umbrella 不同的是，每个`enhanced-scripts`都可以管理自己的项目依赖，不会出现依赖版本冲突的问题

### 安装

yarn

```bash
yarn add https://github.com/Fi2zz/enhanced-scripts.git
```

npm

```bash
npm install https://github.com/Fi2zz/enhanced-scripts.git
```

### Examples

```bash
git clone https://github.com/Fi2zz/enhanced-scripts.git
//start watcher
cd enhanced-scripts/examples && yarn start
//build apps
cd enhanced-scripts/examples && yarn build
//start dev-server
cd enhanced-scripts/examples && webpack-dev-server --config ./apps/dev-server/webpackDevServer.js
```

### 项目结构 (以 examples 为例)

```
examples
  |-config.yaml //如果有
  |-apps
  | |-dev-server
  | |---index.js
  | |---package.json
  | |---webpack.config.js //如果需要
  | |---webpackDevServer.config.js //如果需要
  | |-vue-app
  | |---index.js
  | |---package.json
  | |---webpack.config.js //如果需要
  | |---project_42
  | |---index.js
  | |---package.json
```

### 命令

```bash
enhanced-scripts build
//运行build命令，production mode

enhanced-scripts watch
//development mode

```

> NOTE: `enhanced-scripts` 目前没有提供 `init`，`create`, `dev-server` 命令

> `enhanced-scripts build` 和 `enhanced-scripts watch` 都会自动安装每个子项目的依赖，

> `enhanced-scripts build`会先清除掉子项目的 `node_modules`,目的是确保依赖能被正确的解析

### 命令选项

    --dist <path/to/dist>  //产物目录
    --only  <child_app_name> //只编译某个项目
    --clean //清除上次产出
    --use-config <path/to/config.yaml>， Yaml配置文件
    --source-map //是否产生source-map文件, YES | NO,默认YES

### 以下选项需要在根目录 `package.json`配置

```javascript
{
  //  webpack ouput.publicPath
  "homepage":"path/to/publicpath",
  //被忽略的目录，这些目录下的内容不会生成webpack的entry
  "ignored_paths":['path/to/ignore/of/<src>']
}
```

### 使用 webpack-dev-server

> <a href="https://webpack.js.org/configuration/dev-server/">如何配置 WebpackDevServer </a>

1.在项目安装 webpack-dev-server

2.在项目内创建 webpackDevServer.config.js

3.在 webpackDevServer.config.js 内写入如下内容

```javascript
//引入`enhanced-scripts` 的 `createDevServerConfig`函数
const createDevServerConfig = require("enhanced-scripts").createDevServerConfig;
//引入`webpack.config.js`
const webpackConfig = require("<child-app>/webpack.config.js");
//导出 devServer配置

module.exports = createDevServerConfig(webpackConfig);
```

4.启动 webpack-dev-server

```bash
webpack-dev-server --config webpackDevServer.config.js
```

### Yaml 配置文件

```yaml
excludes:
  - <example> # 不被编译的项目
dist: # 产物目录,优先使用命令行的 `--dist` 选项,默认值 `build`,
clean_last_build: YES # 是否清除上次产出目录, 可选值:YES|NO,默认值 `YES`
generate_source_map: YES # 是否生成source map ,可选值:YES|NO, 默认值,`YES`
only: some_child_app #只编译某个项目
```

### 合并配置

通过根项目的`webpack.config.js`来合并默认配置,[配置详情](#webpack.config.js)

> 例如:`project/`webpack.config.s

> 例如: `project/apps/child-app/`webpack.config.js

### TypeScript 支持

1. 在 <project_dir> 创建 `tsconfig.json`
2. 在 <project_dir/apps/child_app>创建 `tsconfig.json`
   > NOTE: 优先使用 <project_dir/apps/child_app> 的 tsconfig

### `webpack.config.js`

```typescript
//webpack 配置必须是个工厂函数
module.exports = (mode) => {
  //如果配置了<WebpackOptions.Entry>且entry 不以index.js结尾, entry将被删除
  //如果配置了<WebpackOptions.OutputOptions.filename>, filename将被重置回 <child_app>/[name].js
  //【仅限于子项目】配置 <WebpackOptions.OutputOptions.path>可以实现打包到不同的目录
  return <WebpackOptions>
};

//添加额外Babel/Postcss/Vue支持
//babel和postcss必须是工厂函数
exports =module.exports
//添加额外的babel配置
//只支持plugins和presets
exports.babel = (webpackEnv)=> {
    return {
      presets: BabelPreset[],
      plugins: BabelPlugin[]
    }
}
//添加额外的postcss配置
//只支持plugins,由于postcss-loader options的限制，plugins必须是个工厂函数
exports.postcss = webpackEnv =>{
  return {
      plugins(loader){
        return  PotcssPlugin[]
      }
  }
}
//添加vue支持
//由于vue-loader需要和vue-template-compiler在同一个node_modules目录下
//所以需要手动指定vue-loader options.compiler  =require('vue-template-compiler')，
//故在此处需要手动指定 vueTemplateCompiler
exports.vueTemplateCompiler =require('vue-template-compiler')

```
