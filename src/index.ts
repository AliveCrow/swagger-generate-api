import {AxiosResponse} from "axios";

const questions = [
    {
        type: 'input',
        name: 'apiPath',
        message: "生成api目录路径?",
        default: ""
    }
]

const fs = require('fs')
const Path = require('path')
const changeCase = require('change-case')
const axios = require('axios')
const inquirer = require('inquirer');
const handlebars = require('handlebars')
const {parsePath} = require('./helper')

class Package {
    config: ConfigType
    static apiDirPath: string = ''
    tplPath?: string

    constructor(config: ConfigType, tplPath?: string) {
        this.tplPath = tplPath
        if (!config) {
            throw new Error('请先添加配置')
        } else {
            this.config = config
            inquirer.prompt(questions).then((answers: Record<string, any>) => {
                const generatePath = answers['apiPath'] || '/'
                const resolve = (dir: string) => Path.resolve(process.cwd(), dir)
                Package.apiDirPath = resolve(generatePath)
                this.parseConfig()
                this.requestConfig()
            })
        }
    }

    static resolve(path?: string) {
        return Path.resolve(Package.apiDirPath, path || '')
    }

    parseConfig() {
        const apiDirPath = Package.resolve()
        const allModules: Array<Record<string, string>> = []

        if (!fs.existsSync(apiDirPath)) {
            fs.mkdirSync(apiDirPath)
        }
        this.config.modules.forEach(({name, publicURL, swaggerUrl}) => {
            if (!fs.existsSync(Package.resolve(name))) {
                fs.mkdirSync(Package.resolve(name))
            }
            allModules.push({name})
        })
        const index_tpl = handlebars.compile(fs.readFileSync(Path.join(__dirname, './tpl/index.tpl'), 'utf-8'))
        const index_result = index_tpl({
            allModules
        })
        fs.writeFileSync(Package.resolve('index.js'), index_result, 'utf8')
    }

    requestConfig() {
        for (const module of this.config.modules) {
            const {swaggerUrl, name, publicURL} = module
            axios.get(swaggerUrl)
                .then((res: AxiosResponse<any>) => {
                    const data = res.data
                    const fileName = name
                    const apis: Record<string, any> = {}
                    const { paths, components } = data
                    for (const pathsKey in paths) {
                        const pathValue = paths[pathsKey]
                        const deletePublicUrlApi = pathsKey.replace(publicURL || '', '')
                        const apiPath = changeCase.camelCase(deletePublicUrlApi.replace(/\{|\}/g, ''))
                        apis[apiPath] = {}
                        for (const method in pathValue) {
                            const methodParams = pathValue[method]
                            const bodyPath = methodParams.requestBody?.content['application/json'].schema.$ref?.replace(/\/|\#\//g, '-').replace(/^-/, '')
                            let requestBody = []
                            if (bodyPath) {
                                const bodyObj = parsePath(bodyPath)(data) || {}
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
                                parameters: methodParams.parameters?.map((parameter: Record<string, any>) => {
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
                    let action_tpl
                    if(this.tplPath) {
                        action_tpl = handlebars.compile(fs.readFileSync(this.tplPath, 'utf-8'))
                    } else {
                        action_tpl = handlebars.compile(fs.readFileSync(Path.join(__dirname, './tpl/api.tpl'), 'utf-8'))
                    }
                    const action_result = action_tpl({
                        fileName,
                        apis
                    })
                    fs.writeFileSync(Package.resolve(`${fileName}/index.js`), action_result, 'utf8')
                    console.dir(`api/${fileName}创建成功`)
                })
        }

    }
}

module.exports = Package
