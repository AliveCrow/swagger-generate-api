const fs=require("fs"),Path=require("path"),Handlebars=require("handlebars"),changeCase=(require("./helper"),require("change-case")),axios=require("axios"),inquirer=require("inquirer"),questions=[{type:"input",name:"apiPath",message:"生成api目录的层级?",default:""}],bailRE=/[^\w-.$]/;function parsePath(e){if(!bailRE.test(e)){const i=e.split("-");return function(a){for(let e=0;e<i.length;e++){if(!a)return;a=a[i[e]]}return a}}}let Config=null;const init=e=>{Config=e;Config?inquirer.prompt(questions).then(e=>{{var a=e.apiPath;const g=e=>Path.join(a,e),n=[];Config.modules.forEach(({name:a,publicURL:d,swaggerUrl:e})=>{fs.existsSync(g("api"))||fs.mkdirSync(g("api")),n.push({name:a});var i=Handlebars.compile(fs.readFileSync(Path.join(__dirname,"./tpl/index.tpl"),"utf-8"))({allModules:n});fs.writeFileSync(g("api/index.js"),i,"utf8"),axios.get(e).then(e=>{const h=e.data,m=a;fs.mkdir(g("api/"+m),()=>{var e={},a=h["paths"];for(const c in a){var i=a[c],n=c.replace(d,""),r=changeCase.camelCase(n.replace(/\{|\}/g,""));e[r]={};for(const u in i){var t=i[u],s=t.requestBody?.content["application/json"].schema.$ref?.replace(/\/|\#\//g,"-").replace(/^-/,""),o=[];if(s){var p=parsePath(s)(h).properties;for(const f in p)o.push({name:f,type:p[f].type})}e[r][changeCase.constantCase(u)]={url:n,method:changeCase.constantCase(u),description:t.summary||"",parameters:t.parameters?.map(e=>({name:e.name,type:e.schema.type,in:e.in}))||[],requestBody:o||[]}}}var l=Handlebars.compile(fs.readFileSync(Path.join(__dirname,"./tpl/api.tpl"),"utf-8"))({fileName:m,apis:e});fs.writeFileSync(g(`api/${m}/index.js`),l,"utf8"),console.dir(`api/${m}创建成功`)})})})}}):console.log("请先添加配置")};init(require("./config")),module.exports={init:init};