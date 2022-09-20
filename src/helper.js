const Handlebars = require('handlebars')
const changeCase = require('change-case')

Handlebars.registerHelper({
	'getOptions': (opt) => {
		const {parameters, requestBody} = opt
		const allQuery = parameters.concat(requestBody)
		let query = ''
		allQuery.forEach(item => {
			query += changeCase.camelCase(item.name) + ','
		})
		query = query.replace(/,$/, '')
		return `{${query}}`
	},
	'formatUrl': (url) => {
		url.replace(/\{/g, '${')
		return url.replace(/\{/g, '${')
	},
	'formatParams': (opt) => {
		let obj = ''
		opt.forEach(item => {
			if(item.in === 'query') {
				obj += changeCase.camelCase(item.name) + ','
			}
		})
		obj = obj.replace(/,$/, '')
		return `{${obj}}`
	},
	'formatRequestBody': (opt) => {
		let obj = ''
		opt.forEach(item => {
			obj += changeCase.camelCase(item.name) + `,`
		})
		obj = obj.replace(/,$/, '')
		return `{${obj}}`
	}
})
