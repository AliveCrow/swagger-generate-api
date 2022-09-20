{{#each allModules}}
import {{this.name}} from "./{{this.name}}";
{{/each}}

export default {
{{#each allModules}}
	{{this.name}},
{{/each}}
}
