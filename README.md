
# 根据swagger生成前端api代码

## 使用
```bash
npm install @gritwork/swagger-generate-api
```

```ts
// 两个参数 swagger_config, tplPath
// swagger_config是swagger的配置
interface ConfigType {
    modules: Array<{
        name: string,
        publicURL?: string,
        swaggerUrl: string
    }>
}

// tplPath（可选）
// 生成模版的地址 使用handlebarsjs语法编写https://www.handlebarsjs.cn/guide/
```

>> 在项目中使用
```js
const swaggerGenerateApi = require('@gritwork/swagger-generate-api')
const swagger_config = {
    modules: [
        {
            name: "Miniprogram",
            publicURL: "/api/app/miniprogram",
            swaggerUrl: "https://api.jiugai.net/swagger/Miniprogram/swagger.json",
        },
        {
            name: 'WechatApp',
            publicURL: "/api/app/wechat-app",
            swaggerUrl: 'https://api.jiugai.net/swagger/WechatApp/swagger.json',
        }
    ]
}
const Path = require('path')
const tplPath = Path.join(__dirname, 'tpl/api.tpl')
new swaggerGenerateApi(swagger_config, tplPath)
```