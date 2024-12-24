"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowUpPromptProvider = exports.FlowiseSummaryBufferMemory = exports.FlowiseSummaryMemory = exports.FlowiseWindowMemory = exports.FlowiseMemory = exports.VectorStoreRetriever = exports.PromptRetriever = exports.PromptTemplate = void 0;
var memory_1 = require("langchain/memory");
/**
 * Classes
 */
var prompts_1 = require("@langchain/core/prompts");
var PromptTemplate = /** @class */ (function (_super) {
    __extends(PromptTemplate, _super);
    function PromptTemplate(input) {
        return _super.call(this, input) || this;
    }
    return PromptTemplate;
}(prompts_1.PromptTemplate));
exports.PromptTemplate = PromptTemplate;
var fixedTemplate = "Here is a question:\n{input}\n";
var PromptRetriever = /** @class */ (function () {
    function PromptRetriever(fields) {
        this.name = fields.name;
        this.description = fields.description;
        this.systemMessage = "".concat(fields.systemMessage, "\n").concat(fixedTemplate);
    }
    return PromptRetriever;
}());
exports.PromptRetriever = PromptRetriever;
var VectorStoreRetriever = /** @class */ (function () {
    function VectorStoreRetriever(fields) {
        this.name = fields.name;
        this.description = fields.description;
        this.vectorStore = fields.vectorStore;
    }
    return VectorStoreRetriever;
}());
exports.VectorStoreRetriever = VectorStoreRetriever;
var FlowiseMemory = /** @class */ (function (_super) {
    __extends(FlowiseMemory, _super);
    function FlowiseMemory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FlowiseMemory;
}(memory_1.BufferMemory));
exports.FlowiseMemory = FlowiseMemory;
var FlowiseWindowMemory = /** @class */ (function (_super) {
    __extends(FlowiseWindowMemory, _super);
    function FlowiseWindowMemory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FlowiseWindowMemory;
}(memory_1.BufferWindowMemory));
exports.FlowiseWindowMemory = FlowiseWindowMemory;
var FlowiseSummaryMemory = /** @class */ (function (_super) {
    __extends(FlowiseSummaryMemory, _super);
    function FlowiseSummaryMemory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FlowiseSummaryMemory;
}(memory_1.ConversationSummaryMemory));
exports.FlowiseSummaryMemory = FlowiseSummaryMemory;
var FlowiseSummaryBufferMemory = /** @class */ (function (_super) {
    __extends(FlowiseSummaryBufferMemory, _super);
    function FlowiseSummaryBufferMemory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FlowiseSummaryBufferMemory;
}(memory_1.ConversationSummaryBufferMemory));
exports.FlowiseSummaryBufferMemory = FlowiseSummaryBufferMemory;
var FollowUpPromptProvider;
(function (FollowUpPromptProvider) {
    FollowUpPromptProvider["ANTHROPIC"] = "chatAnthropic";
    FollowUpPromptProvider["AZURE_OPENAI"] = "azureChatOpenAI";
    FollowUpPromptProvider["GOOGLE_GENAI"] = "chatGoogleGenerativeAI";
    FollowUpPromptProvider["MISTRALAI"] = "chatMistralAI";
    FollowUpPromptProvider["OPENAI"] = "chatOpenAI";
})(FollowUpPromptProvider || (exports.FollowUpPromptProvider = FollowUpPromptProvider = {}));
