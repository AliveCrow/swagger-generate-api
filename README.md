# swagger-generate-api

根据swagger文档生成前端api代码

## 安装
```bash
npm i @gritwork/swagger-generate-api
yarn add @gritwork/swagger-generate-api
pnpm add @gritwork/swagger-generate-api
```

## 配置文件格式
```javascript
module.exports = {
	modules: [
		{
			name: string, // 目录以及api名字
			publicURL: string, // 公共地址（可以为空）
			swaggerUrl: string, // swagger地址
		}
	]
}
```
## 使用
```javascript
const config = require('config')
const {init} = require('@gritwork/swagger-generate-api')

init(config)

/*
* 在package.json中
* 添加script
* "名称": "node init方法所在文件"
* */
```
