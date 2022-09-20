const fs = require('fs')
const Path = require('path')
const Handlebars = require('handlebars')
require('./helper')
const changeCase = require('change-case')
const axios = require('axios')
const inquirer = require('inquirer');

const questions = [
	{
		type: 'input',
		name: 'apiPath',
		message: "生成api目录的层级?",
		default: ""
	}
]

/**
 * Parse simple path.
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 */
const bailRE = /[^\w-.$]/

function parsePath(path) {
	if (bailRE.test(path)) {
		return
	}
	const segments = path.split('-')
	return function (obj) {
		for (let i = 0; i < segments.length; i++) {
			if (!obj) return
			obj = obj[segments[i]]
		}
		return obj
	}
}

let Config = null
const init = (config) => {
	Config = config
	const generate = (apiPath) => {
		const resolve = dir => Path.join(apiPath, dir)
		const allModules = []
		Config.modules.forEach(({name, publicURL, swaggerUrl}) => {
			if (!fs.existsSync(resolve('api'))) {
				fs.mkdirSync(resolve('api'))
			}
			allModules.push({name})
			const index_tpl = Handlebars.compile(fs.readFileSync(Path.join(__dirname, './tpl/index.tpl'), 'utf-8'))
			const index_result = index_tpl({
				allModules
			})
			fs.writeFileSync(resolve(`api/index.js`), index_result, 'utf8')
			
			axios.get(swaggerUrl)
				.then(res => {
					const data = res.data
					const fileName = name
					fs.mkdir(resolve(`api/${fileName}`), () => {
						const apis = {}
						const {paths, components} = data
						for (const pathsKey in paths) {
							const pathValue = paths[pathsKey]
							const deletePublicUrlApi = pathsKey.replace(publicURL, '')
							const apiPath = changeCase.camelCase(deletePublicUrlApi.replace(/\{|\}/g, ''))
							apis[apiPath] = {}
							for (const method in pathValue) {
								const methodParams = pathValue[method]
								const bodyPath = methodParams.requestBody?.content['application/json'].schema.$ref?.replace(/\/|\#\//g, '-').replace(/^-/, '')
								let requestBody = []
								if (bodyPath) {
									const bodyObj = parsePath(bodyPath)(data)
									const properties = bodyObj['properties']
									for (const propertiesKey in properties) {
										requestBody.push({
											name: propertiesKey,
											type: properties[propertiesKey].type
										})
									}
								}
								
								apis[apiPath][changeCase.constantCase(method)] = {
									url: deletePublicUrlApi,
									method: changeCase.constantCase(method),
									description: methodParams.summary || '',
									parameters: methodParams.parameters?.map(parameter => {
										return {
											name: parameter.name,
											type: parameter.schema.type,
											in: parameter.in
										}
									}) || [],
									requestBody: requestBody || []
								}
							}
						}
						const action_tpl = Handlebars.compile(fs.readFileSync(Path.join(__dirname, './tpl/api.tpl'), 'utf-8'))
						const action_result = action_tpl({
							fileName,
							apis
						})
						fs.writeFileSync(resolve(`api/${fileName}/index.js`), action_result, 'utf8')
						console.dir(`api/${fileName}创建成功`)
					})
				})
			
		})
	}
	if (!Config) {
		console.log('请先添加配置')
	} else {
		inquirer.prompt(questions).then(answers => {
			generate(answers['apiPath'])
		})
	}
}

init(require('./config'))

module.exports = {
	init
}
