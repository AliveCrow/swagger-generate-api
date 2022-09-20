// 仅适用于swagger >= 3.0.1
module.exports = {
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
