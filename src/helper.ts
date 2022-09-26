// @ts-nocheck
"use strict";
const changeCase = require('change-case')
const Handlebars = require('handlebars')

/**
 * Parse simple path.
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 */
const bailRE = /[^\w-.$]/;
export function parsePath(path: string) {
    if (bailRE.test(path)) {
        return;
    }
    const segments = path.split('-');
    return function (obj: Record<string, any>) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj)
                return;
            obj = obj[segments[i]];
        }
        return obj;
    };
}

Handlebars.registerHelper({
    'getOptions': (opt) => {
        const { parameters, requestBody } = opt;
        const allQuery = parameters.concat(requestBody);
        let query = '';
        allQuery.forEach((item) => {
            query += changeCase.camelCase(item.name) + ',';
        });
        query = query.replace(/,$/, '');
        return `{${query}}`;
    },
    'formatUrl': (url) => {
        url.replace(/\{/g, '${');
        return url.replace(/\{/g, '${');
    },
    'formatParams': (opt) => {
        let obj = '';
        opt.forEach(item => {
            if (item.in === 'query') {
                obj += changeCase.camelCase(item.name) + ',';
            }
        });
        obj = obj.replace(/,$/, '');
        return `{${obj}}`;
    },
    'formatRequestBody': (opt) => {
        let obj = '';
        opt.forEach(item => {
            obj += changeCase.camelCase(item.name) + `,`;
        });
        obj = obj.replace(/,$/, '');
        return `{${obj}}`;
    }
});
