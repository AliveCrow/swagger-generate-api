import axios from "axios";

{{#each apis}}
const {{@key}} = {
{{#each this}}
    {{#with this}}
        {{@key}}: function ({{getOptions this}}) {
            return axios({
                url: `{{formatUrl url}}`,
                method: `{{@key}}`,
                params: {{formatParams parameters}},
                data: {{formatRequestBody requestBody}}
            })
        },
    {{/with}}
{{/each}}
}
{{/each}}

export default {
{{#each apis}}
    {{@key}},
{{/each}}
}
