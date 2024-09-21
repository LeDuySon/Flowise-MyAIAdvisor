import { ICommonObject, INode, INodeData, PromptTemplate, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { PromptTemplateInput, ChatPromptTemplate, BasePromptTemplate } from '@langchain/core/prompts'


class PromptTemplateByIntent_Prompts implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Prompt Template By Intent'
        this.name = 'promptTemplateByIntent'
        this.version = 1.0
        this.type = 'ChatPromptTemplate'
        this.icon = 'prompt.svg'
        this.category = 'Prompts'
        this.description = 'Select a prompt template based on the intent of the user input'
        this.baseClasses = [this.type, ...getBaseClasses(ChatPromptTemplate)]
        this.inputs = [
            {
                label: 'Prompt Name',
                name: 'name',
                type: 'string',
                placeholder: 'physics-qa'
            },
            {
                label: 'Prompt Description',
                name: 'description',
                type: 'string',
                rows: 3,
                description: 'Description of what the prompt does',
                placeholder: 'Good for answering questions about physics'
            },
            {
                label: 'PromptTemplates',
                name: 'promptTemplates',
                type: 'BasePromptTemplate',
                list: true
            },
            {
                label: 'Prompt values',
                name: 'promptValues',
                type: 'json',
                acceptVariable: true,
                list: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const promptTemplates = nodeData.inputs?.promptTemplates as any[]
        const promptValuesStr = nodeData.inputs?.promptValues

        console.log("promptValuesStr: ", promptValuesStr)

        let promptValues: ICommonObject = {}
        if (promptValuesStr) {
            try {
                promptValues = typeof promptValuesStr === 'object' ? promptValuesStr : JSON.parse(promptValuesStr)
            } catch (exception) {
                throw new Error("Invalid JSON in the Route output values: " + exception)
            }
        }

        const routeOutputStr = promptValues?.routeOutput

        let routeOutput: ICommonObject = {}
        if (routeOutputStr) {
            try {
                routeOutput = typeof routeOutputStr === 'object' ? routeOutputStr : JSON.parse(routeOutputStr)
            } catch (exception) {
                throw new Error("Invalid JSON in the Route output values: " + exception)
            }
        }

        console.log("routeOutput: ", routeOutput)

        const routeIntent = routeOutput?.queryIntent
        console.log("Route intent: ", routeIntent)
        // We have to define the name of the prompt template using the format prompt values of chat prompt template
        const intent2PromptTemplate: Record<string, any> = {}
        promptTemplates.forEach(prompt => {
            const intent = prompt?.promptValues?.name
            intent2PromptTemplate[intent] = prompt
        })
        console.log(intent2PromptTemplate)

        const targetPromptTemplate = intent2PromptTemplate[routeIntent]
        if (!targetPromptTemplate) {
            throw new Error("No prompt template found for the intent: " + routeIntent)
        }

        return targetPromptTemplate;
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string | object> {
        const name = nodeData.inputs?.name as string
        const description = nodeData.inputs?.description as string
        const promptTemplates = nodeData.inputs?.promptTemplates as any[]
        const promptValuesStr = nodeData.inputs?.promptValues

        console.log("promptValuesStr: ", promptValuesStr)

        let promptValues: ICommonObject = {}
        if (promptValuesStr) {
            try {
                promptValues = typeof promptValuesStr === 'object' ? promptValuesStr : JSON.parse(promptValuesStr)
            } catch (exception) {
                throw new Error("Invalid JSON in the Route output values: " + exception)
            }
        }

        const routeOutputStr = promptValues?.routeOutput

        let routeOutput: ICommonObject = {}
        if (routeOutputStr) {
            try {
                routeOutput = typeof routeOutputStr === 'object' ? routeOutputStr : JSON.parse(routeOutputStr)
            } catch (exception) {
                throw new Error("Invalid JSON in the Route output values: " + exception)
            }
        }

        console.log("routeOutput: ", routeOutput)

        const routeIntent = routeOutput?.queryIntent
        console.log("Route intent: ", routeIntent)
        // We have to define the name of the prompt template using the format prompt values of chat prompt template
        const intent2PromptTemplate: Record<string, any> = promptTemplates.reduce((acc, prompt) => {
            const intent = prompt?.promptValues?.name
            acc[intent] = prompt
            return acc
        })
        console.log(intent2PromptTemplate)

        const targetPromptTemplate = intent2PromptTemplate[routeIntent]
        if (!targetPromptTemplate) {
            throw new Error("No prompt template found for the intent: " + routeIntent)
        }

        targetPromptTemplate.promptValues = {
            ...targetPromptTemplate.promptValues,
            ...routeOutput
        }

        console.log("targetPromptTemplate: ", targetPromptTemplate)

        return targetPromptTemplate;
    }
}


module.exports = { nodeClass: PromptTemplateByIntent_Prompts }
