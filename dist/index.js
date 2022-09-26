"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const questions = [
    {
        type: 'input',
        name: 'apiPath',
        message: "生成api目录路径?",
        default: ""
    }
];
const fs = require('fs');
const Path = require('path');
const changeCase = require('change-case');
const axios = require('axios');
const inquirer = require('inquirer');
const handlebars = require('handlebars');
const { parsePath } = require('./helper');
class Package {
    constructor(config, tplPath) {
        this.tplPath = tplPath;
        if (!config) {
            throw new Error('请先添加配置');
        }
        else {
            this.config = config;
            inquirer.prompt(questions).then((answers) => {
                const generatePath = answers['apiPath'] || '/';
                const resolve = (dir) => Path.resolve(process.cwd(), dir);
                Package.apiDirPath = resolve(generatePath);
                this.parseConfig();
                this.requestConfig();
            });
        }
    }
    static resolve(path) {
        return Path.resolve(Package.apiDirPath, path || '');
    }
    parseConfig() {
        const apiDirPath = Package.resolve();
        const allModules = [];
        if (!fs.existsSync(apiDirPath)) {
            fs.mkdirSync(apiDirPath);
        }
        this.config.modules.forEach(({ name, publicURL, swaggerUrl }) => {
            if (!fs.existsSync(Package.resolve(name))) {
                fs.mkdirSync(Package.resolve(name));
            }
            allModules.push({ name });
        });
        const index_tpl = handlebars.compile(fs.readFileSync(Path.join(__dirname, './tpl/index.tpl'), 'utf-8'));
        const index_result = index_tpl({
            allModules
        });
        fs.writeFileSync(Package.resolve('index.js'), index_result, 'utf8');
    }
    requestConfig() {
        for (const module of this.config.modules) {
            const { swaggerUrl, name, publicURL } = module;
            axios.get(swaggerUrl)
                .then((res) => {
                var _a, _b, _c;
                const data = res.data;
                const fileName = name;
                const apis = {};
                const { paths, components } = data;
                for (const pathsKey in paths) {
                    const pathValue = paths[pathsKey];
                    const deletePublicUrlApi = pathsKey.replace(publicURL || '', '');
                    const apiPath = changeCase.camelCase(deletePublicUrlApi.replace(/\{|\}/g, ''));
                    apis[apiPath] = {};
                    for (const method in pathValue) {
                        const methodParams = pathValue[method];
                        const bodyPath = (_b = (_a = methodParams.requestBody) === null || _a === void 0 ? void 0 : _a.content['application/json'].schema.$ref) === null || _b === void 0 ? void 0 : _b.replace(/\/|\#\//g, '-').replace(/^-/, '');
                        let requestBody = [];
                        if (bodyPath) {
                            const bodyObj = parsePath(bodyPath)(data) || {};
                            const properties = bodyObj['properties'];
                            for (const propertiesKey in properties) {
                                requestBody.push({
                                    name: propertiesKey,
                                    type: properties[propertiesKey].type
                                });
                            }
                        }
                        apis[apiPath][changeCase.constantCase(method)] = {
                            url: deletePublicUrlApi,
                            method: changeCase.constantCase(method),
                            description: methodParams.summary || '',
                            parameters: ((_c = methodParams.parameters) === null || _c === void 0 ? void 0 : _c.map((parameter) => {
                                return {
                                    name: parameter.name,
                                    type: parameter.schema.type,
                                    in: parameter.in
                                };
                            })) || [],
                            requestBody: requestBody || []
                        };
                    }
                }
                let action_tpl;
                if (this.tplPath) {
                    action_tpl = handlebars.compile(fs.readFileSync(this.tplPath, 'utf-8'));
                }
                else {
                    action_tpl = handlebars.compile(fs.readFileSync(Path.join(__dirname, './tpl/api.tpl'), 'utf-8'));
                }
                const action_result = action_tpl({
                    fileName,
                    apis
                });
                fs.writeFileSync(Package.resolve(`${fileName}/index.js`), action_result, 'utf8');
                console.dir(`api/${fileName}创建成功`);
            });
        }
    }
}
Package.apiDirPath = '';
module.exports = Package;
