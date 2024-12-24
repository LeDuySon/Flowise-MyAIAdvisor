"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFollowUpPrompts = void 0;
var Interface_1 = require("./Interface");
var utils_1 = require("./utils");
var anthropic_1 = require("@langchain/anthropic");
var google_genai_1 = require("@langchain/google-genai");
var mistralai_1 = require("@langchain/mistralai");
var openai_1 = require("@langchain/openai");
var zod_1 = require("zod");
var prompts_1 = require("@langchain/core/prompts");
var output_parsers_1 = require("@langchain/core/output_parsers");
var FollowUpPromptType = zod_1.z
    .object({
    questions: zod_1.z.array(zod_1.z.string())
})
    .describe('Generate Follow Up Prompts');
var generateFollowUpPrompts = function (followUpPromptsConfig, apiMessageContent, options) { return __awaiter(void 0, void 0, void 0, function () {
    var providerConfig, credentialId, credentialData, followUpPromptsPrompt, _a, llm, structuredLLM, structuredResponse, azureOpenAIApiKey, azureOpenAIApiInstanceName, azureOpenAIApiDeploymentName, azureOpenAIApiVersion, llm, parser, formatInstructions, prompt_1, chain, structuredResponse, llm, parser, formatInstructions, prompt_2, chain, structuredResponse, model, structuredLLM, structuredResponse, model, structuredLLM, structuredResponse;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!followUpPromptsConfig) return [3 /*break*/, 13];
                if (!followUpPromptsConfig.status)
                    return [2 /*return*/, undefined];
                providerConfig = followUpPromptsConfig[followUpPromptsConfig.selectedProvider];
                if (!providerConfig)
                    return [2 /*return*/, undefined];
                credentialId = providerConfig.credentialId;
                return [4 /*yield*/, (0, utils_1.getCredentialData)(credentialId !== null && credentialId !== void 0 ? credentialId : '', options)];
            case 1:
                credentialData = _b.sent();
                followUpPromptsPrompt = providerConfig.prompt.replace('{history}', apiMessageContent);
                _a = followUpPromptsConfig.selectedProvider;
                switch (_a) {
                    case Interface_1.FollowUpPromptProvider.ANTHROPIC: return [3 /*break*/, 2];
                    case Interface_1.FollowUpPromptProvider.AZURE_OPENAI: return [3 /*break*/, 4];
                    case Interface_1.FollowUpPromptProvider.GOOGLE_GENAI: return [3 /*break*/, 6];
                    case Interface_1.FollowUpPromptProvider.MISTRALAI: return [3 /*break*/, 8];
                    case Interface_1.FollowUpPromptProvider.OPENAI: return [3 /*break*/, 10];
                }
                return [3 /*break*/, 12];
            case 2:
                llm = new anthropic_1.ChatAnthropic({
                    apiKey: credentialData.anthropicApiKey,
                    model: providerConfig.modelName,
                    temperature: parseFloat("".concat(providerConfig.temperature))
                });
                structuredLLM = llm.withStructuredOutput(FollowUpPromptType);
                return [4 /*yield*/, structuredLLM.invoke(followUpPromptsPrompt)];
            case 3:
                structuredResponse = _b.sent();
                return [2 /*return*/, structuredResponse];
            case 4:
                azureOpenAIApiKey = credentialData['azureOpenAIApiKey'];
                azureOpenAIApiInstanceName = credentialData['azureOpenAIApiInstanceName'];
                azureOpenAIApiDeploymentName = credentialData['azureOpenAIApiDeploymentName'];
                azureOpenAIApiVersion = credentialData['azureOpenAIApiVersion'];
                llm = new openai_1.ChatOpenAI({
                    azureOpenAIApiKey: azureOpenAIApiKey,
                    azureOpenAIApiInstanceName: azureOpenAIApiInstanceName,
                    azureOpenAIApiDeploymentName: azureOpenAIApiDeploymentName,
                    azureOpenAIApiVersion: azureOpenAIApiVersion,
                    model: providerConfig.modelName,
                    temperature: parseFloat("".concat(providerConfig.temperature))
                });
                parser = output_parsers_1.StructuredOutputParser.fromZodSchema(FollowUpPromptType);
                formatInstructions = parser.getFormatInstructions();
                prompt_1 = prompts_1.PromptTemplate.fromTemplate("\n                    ".concat(providerConfig.prompt, "\n                                \n                    {format_instructions}\n                "));
                chain = prompt_1.pipe(llm).pipe(parser);
                return [4 /*yield*/, chain.invoke({
                        history: apiMessageContent,
                        format_instructions: formatInstructions
                    })];
            case 5:
                structuredResponse = _b.sent();
                return [2 /*return*/, structuredResponse];
            case 6:
                llm = new google_genai_1.ChatGoogleGenerativeAI({
                    apiKey: credentialData.googleGenerativeAPIKey,
                    model: providerConfig.modelName,
                    temperature: parseFloat("".concat(providerConfig.temperature))
                });
                parser = output_parsers_1.StructuredOutputParser.fromZodSchema(FollowUpPromptType);
                formatInstructions = parser.getFormatInstructions();
                prompt_2 = prompts_1.PromptTemplate.fromTemplate("\n                    ".concat(providerConfig.prompt, "\n                     \n                    {format_instructions}\n                "));
                chain = prompt_2.pipe(llm).pipe(parser);
                return [4 /*yield*/, chain.invoke({
                        history: apiMessageContent,
                        format_instructions: formatInstructions
                    })];
            case 7:
                structuredResponse = _b.sent();
                return [2 /*return*/, structuredResponse];
            case 8:
                model = new mistralai_1.ChatMistralAI({
                    apiKey: credentialData.mistralAIAPIKey,
                    model: providerConfig.modelName,
                    temperature: parseFloat("".concat(providerConfig.temperature))
                });
                structuredLLM = model.withStructuredOutput(FollowUpPromptType);
                return [4 /*yield*/, structuredLLM.invoke(followUpPromptsPrompt)];
            case 9:
                structuredResponse = _b.sent();
                return [2 /*return*/, structuredResponse];
            case 10:
                model = new openai_1.ChatOpenAI({
                    apiKey: credentialData.openAIApiKey,
                    model: providerConfig.modelName,
                    temperature: parseFloat("".concat(providerConfig.temperature))
                });
                structuredLLM = model.withStructuredOutput(FollowUpPromptType);
                return [4 /*yield*/, structuredLLM.invoke(followUpPromptsPrompt)];
            case 11:
                structuredResponse = _b.sent();
                return [2 /*return*/, structuredResponse];
            case 12: return [3 /*break*/, 14];
            case 13: return [2 /*return*/, undefined];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.generateFollowUpPrompts = generateFollowUpPrompts;
