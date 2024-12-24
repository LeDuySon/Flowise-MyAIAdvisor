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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticHandler = exports.additionalCallbacks = exports.CustomChainHandler = exports.ConsoleCallbackHandler = void 0;
var uuid_1 = require("uuid");
var langsmith_1 = require("langsmith");
var langfuse_langchain_1 = require("langfuse-langchain");
var lunary_1 = require("lunary");
var langsmith_2 = require("langsmith");
var langfuse_1 = require("langfuse");
var base_1 = require("@langchain/core/callbacks/base");
var tracer_langchain_1 = require("@langchain/core/tracers/tracer_langchain");
var base_2 = require("@langchain/core/tracers/base");
var lunary_2 = require("@langchain/community/callbacks/handlers/lunary");
var utils_1 = require("./utils");
var langwatch_1 = require("langwatch");
function tryGetJsonSpaces() {
    var _a;
    try {
        return parseInt((_a = (0, utils_1.getEnvironmentVariable)('LOG_JSON_SPACES')) !== null && _a !== void 0 ? _a : '2');
    }
    catch (err) {
        return 2;
    }
}
function tryJsonStringify(obj, fallback) {
    try {
        return JSON.stringify(obj, null, tryGetJsonSpaces());
    }
    catch (err) {
        return fallback;
    }
}
function elapsed(run) {
    if (!run.end_time)
        return '';
    var elapsed = run.end_time - run.start_time;
    if (elapsed < 1000) {
        return "".concat(elapsed, "ms");
    }
    return "".concat((elapsed / 1000).toFixed(2), "s");
}
var ConsoleCallbackHandler = /** @class */ (function (_super) {
    __extends(ConsoleCallbackHandler, _super);
    function ConsoleCallbackHandler(logger) {
        var _a;
        var _this = _super.call(this) || this;
        _this.name = 'console_callback_handler';
        _this.logger = logger;
        if ((0, utils_1.getEnvironmentVariable)('DEBUG') === 'true') {
            logger.level = (_a = (0, utils_1.getEnvironmentVariable)('LOG_LEVEL')) !== null && _a !== void 0 ? _a : 'info';
        }
        return _this;
    }
    ConsoleCallbackHandler.prototype.persistRun = function (_run) {
        return Promise.resolve();
    };
    ConsoleCallbackHandler.prototype.getParents = function (run) {
        var parents = [];
        var currentRun = run;
        while (currentRun.parent_run_id) {
            var parent_1 = this.runMap.get(currentRun.parent_run_id);
            if (parent_1) {
                parents.push(parent_1);
                currentRun = parent_1;
            }
            else {
                break;
            }
        }
        return parents;
    };
    ConsoleCallbackHandler.prototype.getBreadcrumbs = function (run) {
        var parents = this.getParents(run).reverse();
        var string = __spreadArray(__spreadArray([], parents, true), [run], false).map(function (parent) {
            var name = "".concat(parent.execution_order, ":").concat(parent.run_type, ":").concat(parent.name);
            return name;
        })
            .join(' > ');
        return string;
    };
    ConsoleCallbackHandler.prototype.onChainStart = function (run) {
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[chain/start] [".concat(crumbs, "] Entering Chain run with input: ").concat(tryJsonStringify(run.inputs, '[inputs]')));
    };
    ConsoleCallbackHandler.prototype.onChainEnd = function (run) {
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[chain/end] [".concat(crumbs, "] [").concat(elapsed(run), "] Exiting Chain run with output: ").concat(tryJsonStringify(run.outputs, '[outputs]')));
    };
    ConsoleCallbackHandler.prototype.onChainError = function (run) {
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[chain/error] [".concat(crumbs, "] [").concat(elapsed(run), "] Chain run errored with error: ").concat(tryJsonStringify(run.error, '[error]')));
    };
    ConsoleCallbackHandler.prototype.onLLMStart = function (run) {
        var crumbs = this.getBreadcrumbs(run);
        var inputs = 'prompts' in run.inputs ? { prompts: run.inputs.prompts.map(function (p) { return p.trim(); }) } : run.inputs;
        this.logger.verbose("[llm/start] [".concat(crumbs, "] Entering LLM run with input: ").concat(tryJsonStringify(inputs, '[inputs]')));
    };
    ConsoleCallbackHandler.prototype.onLLMEnd = function (run) {
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[llm/end] [".concat(crumbs, "] [").concat(elapsed(run), "] Exiting LLM run with output: ").concat(tryJsonStringify(run.outputs, '[response]')));
    };
    ConsoleCallbackHandler.prototype.onLLMError = function (run) {
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[llm/error] [".concat(crumbs, "] [").concat(elapsed(run), "] LLM run errored with error: ").concat(tryJsonStringify(run.error, '[error]')));
    };
    ConsoleCallbackHandler.prototype.onToolStart = function (run) {
        var _a;
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[tool/start] [".concat(crumbs, "] Entering Tool run with input: \"").concat((_a = run.inputs.input) === null || _a === void 0 ? void 0 : _a.trim(), "\""));
    };
    ConsoleCallbackHandler.prototype.onToolEnd = function (run) {
        var _a, _b;
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[tool/end] [".concat(crumbs, "] [").concat(elapsed(run), "] Exiting Tool run with output: \"").concat((_b = (_a = run.outputs) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.trim(), "\""));
    };
    ConsoleCallbackHandler.prototype.onToolError = function (run) {
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[tool/error] [".concat(crumbs, "] [").concat(elapsed(run), "] Tool run errored with error: ").concat(tryJsonStringify(run.error, '[error]')));
    };
    ConsoleCallbackHandler.prototype.onAgentAction = function (run) {
        var agentRun = run;
        var crumbs = this.getBreadcrumbs(run);
        this.logger.verbose("[agent/action] [".concat(crumbs, "] Agent selected action: ").concat(tryJsonStringify(agentRun.actions[agentRun.actions.length - 1], '[action]')));
    };
    return ConsoleCallbackHandler;
}(base_2.BaseTracer));
exports.ConsoleCallbackHandler = ConsoleCallbackHandler;
/**
 * Custom chain handler class
 */
var CustomChainHandler = /** @class */ (function (_super) {
    __extends(CustomChainHandler, _super);
    function CustomChainHandler(sseStreamer, chatId, skipK, returnSourceDocuments) {
        var _this = _super.call(this) || this;
        _this.name = 'custom_chain_handler';
        _this.isLLMStarted = false;
        _this.skipK = 0; // Skip streaming for first K numbers of handleLLMStart
        _this.returnSourceDocuments = false;
        _this.cachedResponse = true;
        _this.chatId = '';
        _this.sseStreamer = sseStreamer;
        _this.chatId = chatId;
        _this.skipK = skipK !== null && skipK !== void 0 ? skipK : _this.skipK;
        _this.returnSourceDocuments = returnSourceDocuments !== null && returnSourceDocuments !== void 0 ? returnSourceDocuments : _this.returnSourceDocuments;
        return _this;
    }
    CustomChainHandler.prototype.handleLLMStart = function () {
        this.cachedResponse = false;
        if (this.skipK > 0)
            this.skipK -= 1;
    };
    CustomChainHandler.prototype.handleLLMNewToken = function (token) {
        if (this.skipK === 0) {
            if (!this.isLLMStarted) {
                this.isLLMStarted = true;
                if (this.sseStreamer) {
                    this.sseStreamer.streamStartEvent(this.chatId, token);
                }
            }
            if (this.sseStreamer) {
                this.sseStreamer.streamTokenEvent(this.chatId, token);
            }
        }
    };
    CustomChainHandler.prototype.handleLLMEnd = function () {
        if (this.sseStreamer) {
            this.sseStreamer.streamEndEvent(this.chatId);
        }
    };
    CustomChainHandler.prototype.handleChainEnd = function (outputs, _, parentRunId) {
        var _this = this;
        /*
            Langchain does not call handleLLMStart, handleLLMEnd, handleLLMNewToken when the chain is cached.
            Callback Order is "Chain Start -> LLM Start --> LLM Token --> LLM End -> Chain End" for normal responses.
            Callback Order is "Chain Start -> Chain End" for cached responses.
         */
        if (this.cachedResponse && parentRunId === undefined) {
            var cachedValue = outputs.text || outputs.response || outputs.output || outputs.output_text;
            //split at whitespace, and keep the whitespace. This is to preserve the original formatting.
            var result = cachedValue.split(/(\s+)/);
            result.forEach(function (token, index) {
                if (index === 0) {
                    if (_this.sseStreamer) {
                        _this.sseStreamer.streamStartEvent(_this.chatId, token);
                    }
                }
                if (_this.sseStreamer) {
                    _this.sseStreamer.streamTokenEvent(_this.chatId, token);
                }
            });
            if (this.returnSourceDocuments && this.sseStreamer) {
                this.sseStreamer.streamSourceDocumentsEvent(this.chatId, outputs === null || outputs === void 0 ? void 0 : outputs.sourceDocuments);
            }
            if (this.sseStreamer) {
                this.sseStreamer.streamEndEvent(this.chatId);
            }
        }
        else {
            if (this.returnSourceDocuments && this.sseStreamer) {
                this.sseStreamer.streamSourceDocumentsEvent(this.chatId, outputs === null || outputs === void 0 ? void 0 : outputs.sourceDocuments);
            }
        }
    };
    return CustomChainHandler;
}(base_1.BaseCallbackHandler));
exports.CustomChainHandler = CustomChainHandler;
var ExtendedLunaryHandler = /** @class */ (function (_super) {
    __extends(ExtendedLunaryHandler, _super);
    function ExtendedLunaryHandler(_a) {
        var _this = this;
        var flowiseOptions = _a.flowiseOptions, options = __rest(_a, ["flowiseOptions"]);
        _this = _super.call(this, options) || this;
        _this.appDataSource = flowiseOptions.appDataSource;
        _this.databaseEntities = flowiseOptions.databaseEntities;
        _this.chatId = flowiseOptions.chatId;
        _this.apiMessageId = flowiseOptions.apiMessageId;
        return _this;
    }
    ExtendedLunaryHandler.prototype.initThread = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entity, userId;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.appDataSource.getRepository(this.databaseEntities['Lead']).findOne({
                            where: {
                                chatId: this.chatId
                            }
                        })];
                    case 1:
                        entity = _e.sent();
                        userId = (_a = entity === null || entity === void 0 ? void 0 : entity.email) !== null && _a !== void 0 ? _a : entity === null || entity === void 0 ? void 0 : entity.id;
                        this.thread = lunary_1.default.openThread({
                            id: this.chatId,
                            userId: userId,
                            userProps: userId
                                ? {
                                    name: (_b = entity === null || entity === void 0 ? void 0 : entity.name) !== null && _b !== void 0 ? _b : undefined,
                                    email: (_c = entity === null || entity === void 0 ? void 0 : entity.email) !== null && _c !== void 0 ? _c : undefined,
                                    phone: (_d = entity === null || entity === void 0 ? void 0 : entity.phone) !== null && _d !== void 0 ? _d : undefined
                                }
                                : undefined
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ExtendedLunaryHandler.prototype.handleChainStart = function (chain, inputs, runId, parentRunId, tags, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var messageText, messageId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.chatId && !parentRunId)) return [3 /*break*/, 3];
                        if (!!this.thread) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initThread()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        messageText = inputs.input;
                        messageId = this.thread.trackMessage({
                            content: messageText,
                            role: 'user'
                        });
                        // Track top level chain id for knowing when we got the final reply
                        this.currentRunId = runId;
                        // Use the messageId as the parent of the chain for reconciliation
                        _super.prototype.handleChainStart.call(this, chain, inputs, runId, messageId, tags, metadata);
                        return [3 /*break*/, 4];
                    case 3:
                        _super.prototype.handleChainStart.call(this, chain, inputs, runId, parentRunId, tags, metadata);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ExtendedLunaryHandler.prototype.handleChainEnd = function (outputs, runId) {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                if (this.chatId && runId === this.currentRunId) {
                    answer = outputs.output;
                    this.thread.trackMessage({
                        id: this.apiMessageId,
                        content: answer,
                        role: 'assistant'
                    });
                    this.currentRunId = null;
                }
                _super.prototype.handleChainEnd.call(this, outputs, runId);
                return [2 /*return*/];
            });
        });
    };
    return ExtendedLunaryHandler;
}(lunary_2.LunaryHandler));
var additionalCallbacks = function (nodeData, options) { return __awaiter(void 0, void 0, void 0, function () {
    var analytic, callbacks, _a, _b, _c, _i, provider, providerStatus, credentialId, credentialData, langSmithProject, langSmithApiKey, langSmithEndpoint, client, langSmithField, tracer, release, langFuseSecretKey, langFusePublicKey, langFuseEndpoint, langFuseOptions, handler, lunaryPublicKey, lunaryEndpoint, lunaryFields, handler, langWatchApiKey, langWatchEndpoint, langwatch, trace, e_1;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    return __generator(this, function (_r) {
        switch (_r.label) {
            case 0:
                _r.trys.push([0, 5, , 6]);
                if (!options.analytic)
                    return [2 /*return*/, []];
                analytic = JSON.parse(options.analytic);
                callbacks = [];
                _a = analytic;
                _b = [];
                for (_c in _a)
                    _b.push(_c);
                _i = 0;
                _r.label = 1;
            case 1:
                if (!(_i < _b.length)) return [3 /*break*/, 4];
                _c = _b[_i];
                if (!(_c in _a)) return [3 /*break*/, 3];
                provider = _c;
                providerStatus = analytic[provider].status;
                if (!providerStatus) return [3 /*break*/, 3];
                credentialId = analytic[provider].credentialId;
                return [4 /*yield*/, (0, utils_1.getCredentialData)(credentialId !== null && credentialId !== void 0 ? credentialId : '', options)];
            case 2:
                credentialData = _r.sent();
                if (provider === 'langSmith') {
                    langSmithProject = analytic[provider].projectName;
                    langSmithApiKey = (0, utils_1.getCredentialParam)('langSmithApiKey', credentialData, nodeData);
                    langSmithEndpoint = (0, utils_1.getCredentialParam)('langSmithEndpoint', credentialData, nodeData);
                    client = new langsmith_1.Client({
                        apiUrl: langSmithEndpoint !== null && langSmithEndpoint !== void 0 ? langSmithEndpoint : 'https://api.smith.langchain.com',
                        apiKey: langSmithApiKey
                    });
                    langSmithField = {
                        projectName: langSmithProject !== null && langSmithProject !== void 0 ? langSmithProject : 'default',
                        //@ts-ignore
                        client: client
                    };
                    if ((_e = (_d = nodeData === null || nodeData === void 0 ? void 0 : nodeData.inputs) === null || _d === void 0 ? void 0 : _d.analytics) === null || _e === void 0 ? void 0 : _e.langSmith) {
                        langSmithField = __assign(__assign({}, langSmithField), (_g = (_f = nodeData === null || nodeData === void 0 ? void 0 : nodeData.inputs) === null || _f === void 0 ? void 0 : _f.analytics) === null || _g === void 0 ? void 0 : _g.langSmith);
                    }
                    tracer = new tracer_langchain_1.LangChainTracer(langSmithField);
                    callbacks.push(tracer);
                }
                else if (provider === 'langFuse') {
                    release = analytic[provider].release;
                    langFuseSecretKey = (0, utils_1.getCredentialParam)('langFuseSecretKey', credentialData, nodeData);
                    langFusePublicKey = (0, utils_1.getCredentialParam)('langFusePublicKey', credentialData, nodeData);
                    langFuseEndpoint = (0, utils_1.getCredentialParam)('langFuseEndpoint', credentialData, nodeData);
                    langFuseOptions = {
                        secretKey: langFuseSecretKey,
                        publicKey: langFusePublicKey,
                        baseUrl: langFuseEndpoint !== null && langFuseEndpoint !== void 0 ? langFuseEndpoint : 'https://cloud.langfuse.com',
                        sdkIntegration: 'Flowise'
                    };
                    if (release)
                        langFuseOptions.release = release;
                    if (options.chatId)
                        langFuseOptions.sessionId = options.chatId;
                    if ((_j = (_h = nodeData === null || nodeData === void 0 ? void 0 : nodeData.inputs) === null || _h === void 0 ? void 0 : _h.analytics) === null || _j === void 0 ? void 0 : _j.langFuse) {
                        langFuseOptions = __assign(__assign({}, langFuseOptions), (_l = (_k = nodeData === null || nodeData === void 0 ? void 0 : nodeData.inputs) === null || _k === void 0 ? void 0 : _k.analytics) === null || _l === void 0 ? void 0 : _l.langFuse);
                    }
                    handler = new langfuse_langchain_1.default(langFuseOptions);
                    callbacks.push(handler);
                }
                else if (provider === 'lunary') {
                    lunaryPublicKey = (0, utils_1.getCredentialParam)('lunaryAppId', credentialData, nodeData);
                    lunaryEndpoint = (0, utils_1.getCredentialParam)('lunaryEndpoint', credentialData, nodeData);
                    lunaryFields = {
                        publicKey: lunaryPublicKey,
                        apiUrl: lunaryEndpoint !== null && lunaryEndpoint !== void 0 ? lunaryEndpoint : 'https://api.lunary.ai',
                        runtime: 'flowise',
                        flowiseOptions: options
                    };
                    if ((_o = (_m = nodeData === null || nodeData === void 0 ? void 0 : nodeData.inputs) === null || _m === void 0 ? void 0 : _m.analytics) === null || _o === void 0 ? void 0 : _o.lunary) {
                        lunaryFields = __assign(__assign({}, lunaryFields), (_q = (_p = nodeData === null || nodeData === void 0 ? void 0 : nodeData.inputs) === null || _p === void 0 ? void 0 : _p.analytics) === null || _q === void 0 ? void 0 : _q.lunary);
                    }
                    handler = new ExtendedLunaryHandler(lunaryFields);
                    callbacks.push(handler);
                }
                else if (provider === 'langWatch') {
                    langWatchApiKey = (0, utils_1.getCredentialParam)('langWatchApiKey', credentialData, nodeData);
                    langWatchEndpoint = (0, utils_1.getCredentialParam)('langWatchEndpoint', credentialData, nodeData);
                    langwatch = new langwatch_1.LangWatch({
                        apiKey: langWatchApiKey,
                        endpoint: langWatchEndpoint
                    });
                    trace = langwatch.getTrace();
                    callbacks.push(trace.getLangChainCallback());
                }
                _r.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, callbacks];
            case 5:
                e_1 = _r.sent();
                throw new Error(e_1);
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.additionalCallbacks = additionalCallbacks;
var AnalyticHandler = /** @class */ (function () {
    function AnalyticHandler(nodeData, options) {
        this.options = {};
        this.handlers = {};
        this.options = options;
        this.nodeData = nodeData;
        this.init();
    }
    AnalyticHandler.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var analytic, _a, _b, _c, _i, provider, providerStatus, credentialId, credentialData, langSmithProject, langSmithApiKey, langSmithEndpoint, client, release, langFuseSecretKey, langFusePublicKey, langFuseEndpoint, langfuse, lunaryPublicKey, lunaryEndpoint, langWatchApiKey, langWatchEndpoint, langwatch, e_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        if (!this.options.analytic)
                            return [2 /*return*/];
                        analytic = JSON.parse(this.options.analytic);
                        _a = analytic;
                        _b = [];
                        for (_c in _a)
                            _b.push(_c);
                        _i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 4];
                        _c = _b[_i];
                        if (!(_c in _a)) return [3 /*break*/, 3];
                        provider = _c;
                        providerStatus = analytic[provider].status;
                        if (!providerStatus) return [3 /*break*/, 3];
                        credentialId = analytic[provider].credentialId;
                        return [4 /*yield*/, (0, utils_1.getCredentialData)(credentialId !== null && credentialId !== void 0 ? credentialId : '', this.options)];
                    case 2:
                        credentialData = _d.sent();
                        if (provider === 'langSmith') {
                            langSmithProject = analytic[provider].projectName;
                            langSmithApiKey = (0, utils_1.getCredentialParam)('langSmithApiKey', credentialData, this.nodeData);
                            langSmithEndpoint = (0, utils_1.getCredentialParam)('langSmithEndpoint', credentialData, this.nodeData);
                            client = new langsmith_2.Client({
                                apiUrl: langSmithEndpoint !== null && langSmithEndpoint !== void 0 ? langSmithEndpoint : 'https://api.smith.langchain.com',
                                apiKey: langSmithApiKey
                            });
                            this.handlers['langSmith'] = { client: client, langSmithProject: langSmithProject };
                        }
                        else if (provider === 'langFuse') {
                            release = analytic[provider].release;
                            langFuseSecretKey = (0, utils_1.getCredentialParam)('langFuseSecretKey', credentialData, this.nodeData);
                            langFusePublicKey = (0, utils_1.getCredentialParam)('langFusePublicKey', credentialData, this.nodeData);
                            langFuseEndpoint = (0, utils_1.getCredentialParam)('langFuseEndpoint', credentialData, this.nodeData);
                            langfuse = new langfuse_1.Langfuse({
                                secretKey: langFuseSecretKey,
                                publicKey: langFusePublicKey,
                                baseUrl: langFuseEndpoint !== null && langFuseEndpoint !== void 0 ? langFuseEndpoint : 'https://cloud.langfuse.com',
                                sdkIntegration: 'Flowise',
                                release: release
                            });
                            this.handlers['langFuse'] = { client: langfuse };
                        }
                        else if (provider === 'lunary') {
                            lunaryPublicKey = (0, utils_1.getCredentialParam)('lunaryAppId', credentialData, this.nodeData);
                            lunaryEndpoint = (0, utils_1.getCredentialParam)('lunaryEndpoint', credentialData, this.nodeData);
                            lunary_1.default.init({
                                publicKey: lunaryPublicKey,
                                apiUrl: lunaryEndpoint,
                                runtime: 'flowise'
                            });
                            this.handlers['lunary'] = { client: lunary_1.default };
                        }
                        else if (provider === 'langWatch') {
                            langWatchApiKey = (0, utils_1.getCredentialParam)('langWatchApiKey', credentialData, this.nodeData);
                            langWatchEndpoint = (0, utils_1.getCredentialParam)('langWatchEndpoint', credentialData, this.nodeData);
                            langwatch = new langwatch_1.LangWatch({
                                apiKey: langWatchApiKey,
                                endpoint: langWatchEndpoint
                            });
                            this.handlers['langWatch'] = { client: langwatch };
                        }
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_2 = _d.sent();
                        throw new Error(e_2);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AnalyticHandler.prototype.onChainStart = function (name, input, parentIds) {
        return __awaiter(this, void 0, void 0, function () {
            var returnIds, parentRunConfig, parentRun, parentRun, childChainRun, langfuseTraceClient, langfuse, span, monitor, runId, langwatchTrace, langwatch, span;
            var _a, _b, _c, _d, _e, _f, _g;
            var _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            return __generator(this, function (_v) {
                switch (_v.label) {
                    case 0:
                        returnIds = {
                            langSmith: {},
                            langFuse: {},
                            lunary: {},
                            langWatch: {}
                        };
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 5];
                        if (!(!parentIds || !Object.keys(parentIds).length)) return [3 /*break*/, 2];
                        parentRunConfig = __assign({ name: name, run_type: 'chain', inputs: {
                                text: input
                            }, serialized: {}, project_name: this.handlers['langSmith'].langSmithProject, client: this.handlers['langSmith'].client }, (_k = (_j = (_h = this.nodeData) === null || _h === void 0 ? void 0 : _h.inputs) === null || _j === void 0 ? void 0 : _j.analytics) === null || _k === void 0 ? void 0 : _k.langSmith);
                        parentRun = new langsmith_2.RunTree(parentRunConfig);
                        return [4 /*yield*/, parentRun.postRun()];
                    case 1:
                        _v.sent();
                        this.handlers['langSmith'].chainRun = (_a = {}, _a[parentRun.id] = parentRun, _a);
                        returnIds['langSmith'].chainRun = parentRun.id;
                        return [3 /*break*/, 5];
                    case 2:
                        parentRun = this.handlers['langSmith'].chainRun[parentIds['langSmith'].chainRun];
                        if (!parentRun) return [3 /*break*/, 5];
                        return [4 /*yield*/, parentRun.createChild({
                                name: name,
                                run_type: 'chain',
                                inputs: {
                                    text: input
                                }
                            })];
                    case 3:
                        childChainRun = _v.sent();
                        return [4 /*yield*/, childChainRun.postRun()];
                    case 4:
                        _v.sent();
                        this.handlers['langSmith'].chainRun = (_b = {}, _b[childChainRun.id] = childChainRun, _b);
                        returnIds['langSmith'].chainRun = childChainRun.id;
                        _v.label = 5;
                    case 5:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) {
                            langfuseTraceClient = void 0;
                            if (!parentIds || !Object.keys(parentIds).length) {
                                langfuse = this.handlers['langFuse'].client;
                                langfuseTraceClient = langfuse.trace(__assign({ name: name, sessionId: this.options.chatId, metadata: { tags: ['openai-assistant'] } }, (_o = (_m = (_l = this.nodeData) === null || _l === void 0 ? void 0 : _l.inputs) === null || _m === void 0 ? void 0 : _m.analytics) === null || _o === void 0 ? void 0 : _o.langFuse));
                            }
                            else {
                                langfuseTraceClient = this.handlers['langFuse'].trace[parentIds['langFuse']];
                            }
                            if (langfuseTraceClient) {
                                langfuseTraceClient.update({
                                    input: {
                                        text: input
                                    }
                                });
                                span = langfuseTraceClient.span({
                                    name: name,
                                    input: {
                                        text: input
                                    }
                                });
                                this.handlers['langFuse'].trace = (_c = {}, _c[langfuseTraceClient.id] = langfuseTraceClient, _c);
                                this.handlers['langFuse'].span = (_d = {}, _d[span.id] = span, _d);
                                returnIds['langFuse'].trace = langfuseTraceClient.id;
                                returnIds['langFuse'].span = span.id;
                            }
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 7];
                        monitor = this.handlers['lunary'].client;
                        if (!monitor) return [3 /*break*/, 7];
                        runId = (0, uuid_1.v4)();
                        return [4 /*yield*/, monitor.trackEvent('chain', 'start', __assign({ runId: runId, name: name, input: input }, (_r = (_q = (_p = this.nodeData) === null || _p === void 0 ? void 0 : _p.inputs) === null || _q === void 0 ? void 0 : _q.analytics) === null || _r === void 0 ? void 0 : _r.lunary))];
                    case 6:
                        _v.sent();
                        this.handlers['lunary'].chainEvent = (_e = {}, _e[runId] = runId, _e);
                        returnIds['lunary'].chainEvent = runId;
                        _v.label = 7;
                    case 7:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            langwatchTrace = void 0;
                            if (!parentIds || !Object.keys(parentIds).length) {
                                langwatch = this.handlers['langWatch'].client;
                                langwatchTrace = langwatch.getTrace(__assign({ name: name, metadata: { tags: ['openai-assistant'], threadId: this.options.chatId } }, (_u = (_t = (_s = this.nodeData) === null || _s === void 0 ? void 0 : _s.inputs) === null || _t === void 0 ? void 0 : _t.analytics) === null || _u === void 0 ? void 0 : _u.langWatch));
                            }
                            else {
                                langwatchTrace = this.handlers['langWatch'].trace[parentIds['langWatch']];
                            }
                            if (langwatchTrace) {
                                span = langwatchTrace.startSpan({
                                    name: name,
                                    type: 'chain',
                                    input: (0, langwatch_1.autoconvertTypedValues)(input)
                                });
                                this.handlers['langWatch'].trace = (_f = {}, _f[langwatchTrace.traceId] = langwatchTrace, _f);
                                this.handlers['langWatch'].span = (_g = {}, _g[span.spanId] = span, _g);
                                returnIds['langWatch'].trace = langwatchTrace.traceId;
                                returnIds['langWatch'].span = span.spanId;
                            }
                        }
                        return [2 /*return*/, returnIds];
                }
            });
        });
    };
    AnalyticHandler.prototype.onChainEnd = function (returnIds_1, output_1) {
        return __awaiter(this, arguments, void 0, function (returnIds, output, shutdown) {
            var chainRun, span, langfuseTraceClient, langfuse, chainEventId, monitor, span;
            if (shutdown === void 0) { shutdown = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        chainRun = this.handlers['langSmith'].chainRun[returnIds['langSmith'].chainRun];
                        if (!chainRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, chainRun.end({
                                outputs: {
                                    output: output
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, chainRun.patchRun()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) return [3 /*break*/, 5];
                        span = this.handlers['langFuse'].span[returnIds['langFuse'].span];
                        if (!span) return [3 /*break*/, 5];
                        span.end({
                            output: output
                        });
                        langfuseTraceClient = this.handlers['langFuse'].trace[returnIds['langFuse'].trace];
                        if (langfuseTraceClient) {
                            langfuseTraceClient.update({
                                output: {
                                    output: output
                                }
                            });
                        }
                        if (!shutdown) return [3 /*break*/, 5];
                        langfuse = this.handlers['langFuse'].client;
                        return [4 /*yield*/, langfuse.shutdownAsync()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 7];
                        chainEventId = returnIds['lunary'].chainEvent;
                        monitor = this.handlers['lunary'].client;
                        if (!(monitor && chainEventId)) return [3 /*break*/, 7];
                        return [4 /*yield*/, monitor.trackEvent('chain', 'end', {
                                runId: chainEventId,
                                output: output
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            span = this.handlers['langWatch'].span[returnIds['langWatch'].span];
                            if (span) {
                                span.end({
                                    output: (0, langwatch_1.autoconvertTypedValues)(output)
                                });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AnalyticHandler.prototype.onChainError = function (returnIds_1, error_1) {
        return __awaiter(this, arguments, void 0, function (returnIds, error, shutdown) {
            var chainRun, span, langfuseTraceClient, langfuse, chainEventId, monitor, span;
            if (shutdown === void 0) { shutdown = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        chainRun = this.handlers['langSmith'].chainRun[returnIds['langSmith'].chainRun];
                        if (!chainRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, chainRun.end({
                                error: {
                                    error: error
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, chainRun.patchRun()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) return [3 /*break*/, 5];
                        span = this.handlers['langFuse'].span[returnIds['langFuse'].span];
                        if (!span) return [3 /*break*/, 5];
                        span.end({
                            output: {
                                error: error
                            }
                        });
                        langfuseTraceClient = this.handlers['langFuse'].trace[returnIds['langFuse'].trace];
                        if (langfuseTraceClient) {
                            langfuseTraceClient.update({
                                output: {
                                    error: error
                                }
                            });
                        }
                        if (!shutdown) return [3 /*break*/, 5];
                        langfuse = this.handlers['langFuse'].client;
                        return [4 /*yield*/, langfuse.shutdownAsync()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 7];
                        chainEventId = returnIds['lunary'].chainEvent;
                        monitor = this.handlers['lunary'].client;
                        if (!(monitor && chainEventId)) return [3 /*break*/, 7];
                        return [4 /*yield*/, monitor.trackEvent('chain', 'end', {
                                runId: chainEventId,
                                output: error
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            span = this.handlers['langWatch'].span[returnIds['langWatch'].span];
                            if (span) {
                                span.end({
                                    error: error
                                });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AnalyticHandler.prototype.onLLMStart = function (name, input, parentIds) {
        return __awaiter(this, void 0, void 0, function () {
            var returnIds, parentRun, childLLMRun, trace, generation, monitor, chainEventId, runId, trace, span;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        returnIds = {
                            langSmith: {},
                            langFuse: {},
                            lunary: {},
                            langWatch: {}
                        };
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        parentRun = this.handlers['langSmith'].chainRun[parentIds['langSmith'].chainRun];
                        if (!parentRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, parentRun.createChild({
                                name: name,
                                run_type: 'llm',
                                inputs: {
                                    prompts: [input]
                                }
                            })];
                    case 1:
                        childLLMRun = _e.sent();
                        return [4 /*yield*/, childLLMRun.postRun()];
                    case 2:
                        _e.sent();
                        this.handlers['langSmith'].llmRun = (_a = {}, _a[childLLMRun.id] = childLLMRun, _a);
                        returnIds['langSmith'].llmRun = childLLMRun.id;
                        _e.label = 3;
                    case 3:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) {
                            trace = this.handlers['langFuse'].trace[parentIds['langFuse'].trace];
                            if (trace) {
                                generation = trace.generation({
                                    name: name,
                                    input: input
                                });
                                this.handlers['langFuse'].generation = (_b = {}, _b[generation.id] = generation, _b);
                                returnIds['langFuse'].generation = generation.id;
                            }
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 5];
                        monitor = this.handlers['lunary'].client;
                        chainEventId = this.handlers['lunary'].chainEvent[parentIds['lunary'].chainEvent];
                        if (!(monitor && chainEventId)) return [3 /*break*/, 5];
                        runId = (0, uuid_1.v4)();
                        return [4 /*yield*/, monitor.trackEvent('llm', 'start', {
                                runId: runId,
                                parentRunId: chainEventId,
                                name: name,
                                input: input
                            })];
                    case 4:
                        _e.sent();
                        this.handlers['lunary'].llmEvent = (_c = {}, _c[runId] = runId, _c);
                        returnIds['lunary'].llmEvent = runId;
                        _e.label = 5;
                    case 5:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            trace = this.handlers['langWatch'].trace[parentIds['langWatch'].trace];
                            if (trace) {
                                span = trace.startLLMSpan({
                                    name: name,
                                    input: (0, langwatch_1.autoconvertTypedValues)(input)
                                });
                                this.handlers['langWatch'].span = (_d = {}, _d[span.spanId] = span, _d);
                                returnIds['langWatch'].span = span.spanId;
                            }
                        }
                        return [2 /*return*/, returnIds];
                }
            });
        });
    };
    AnalyticHandler.prototype.onLLMEnd = function (returnIds, output) {
        return __awaiter(this, void 0, void 0, function () {
            var llmRun, generation, llmEventId, monitor, span;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        llmRun = this.handlers['langSmith'].llmRun[returnIds['langSmith'].llmRun];
                        if (!llmRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, llmRun.end({
                                outputs: {
                                    generations: [output]
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, llmRun.patchRun()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) {
                            generation = this.handlers['langFuse'].generation[returnIds['langFuse'].generation];
                            if (generation) {
                                generation.end({
                                    output: output
                                });
                            }
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 5];
                        llmEventId = this.handlers['lunary'].llmEvent[returnIds['lunary'].llmEvent];
                        monitor = this.handlers['lunary'].client;
                        if (!(monitor && llmEventId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, monitor.trackEvent('llm', 'end', {
                                runId: llmEventId,
                                output: output
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            span = this.handlers['langWatch'].span[returnIds['langWatch'].span];
                            if (span) {
                                span.end({
                                    output: (0, langwatch_1.autoconvertTypedValues)(output)
                                });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AnalyticHandler.prototype.onLLMError = function (returnIds, error) {
        return __awaiter(this, void 0, void 0, function () {
            var llmRun, generation, llmEventId, monitor, span;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        llmRun = this.handlers['langSmith'].llmRun[returnIds['langSmith'].llmRun];
                        if (!llmRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, llmRun.end({
                                error: {
                                    error: error
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, llmRun.patchRun()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) {
                            generation = this.handlers['langFuse'].generation[returnIds['langFuse'].generation];
                            if (generation) {
                                generation.end({
                                    output: error
                                });
                            }
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 5];
                        llmEventId = this.handlers['lunary'].llmEvent[returnIds['lunary'].llmEvent];
                        monitor = this.handlers['lunary'].client;
                        if (!(monitor && llmEventId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, monitor.trackEvent('llm', 'end', {
                                runId: llmEventId,
                                output: error
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            span = this.handlers['langWatch'].span[returnIds['langWatch'].span];
                            if (span) {
                                span.end({
                                    error: error
                                });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AnalyticHandler.prototype.onToolStart = function (name, input, parentIds) {
        return __awaiter(this, void 0, void 0, function () {
            var returnIds, parentRun, childToolRun, trace, toolSpan, monitor, chainEventId, runId, trace, span;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        returnIds = {
                            langSmith: {},
                            langFuse: {},
                            lunary: {},
                            langWatch: {}
                        };
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        parentRun = this.handlers['langSmith'].chainRun[parentIds['langSmith'].chainRun];
                        if (!parentRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, parentRun.createChild({
                                name: name,
                                run_type: 'tool',
                                inputs: {
                                    input: input
                                }
                            })];
                    case 1:
                        childToolRun = _e.sent();
                        return [4 /*yield*/, childToolRun.postRun()];
                    case 2:
                        _e.sent();
                        this.handlers['langSmith'].toolRun = (_a = {}, _a[childToolRun.id] = childToolRun, _a);
                        returnIds['langSmith'].toolRun = childToolRun.id;
                        _e.label = 3;
                    case 3:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) {
                            trace = this.handlers['langFuse'].trace[parentIds['langFuse'].trace];
                            if (trace) {
                                toolSpan = trace.span({
                                    name: name,
                                    input: input
                                });
                                this.handlers['langFuse'].toolSpan = (_b = {}, _b[toolSpan.id] = toolSpan, _b);
                                returnIds['langFuse'].toolSpan = toolSpan.id;
                            }
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 5];
                        monitor = this.handlers['lunary'].client;
                        chainEventId = this.handlers['lunary'].chainEvent[parentIds['lunary'].chainEvent];
                        if (!(monitor && chainEventId)) return [3 /*break*/, 5];
                        runId = (0, uuid_1.v4)();
                        return [4 /*yield*/, monitor.trackEvent('tool', 'start', {
                                runId: runId,
                                parentRunId: chainEventId,
                                name: name,
                                input: input
                            })];
                    case 4:
                        _e.sent();
                        this.handlers['lunary'].toolEvent = (_c = {}, _c[runId] = runId, _c);
                        returnIds['lunary'].toolEvent = runId;
                        _e.label = 5;
                    case 5:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            trace = this.handlers['langWatch'].trace[parentIds['langWatch'].trace];
                            if (trace) {
                                span = trace.startSpan({
                                    name: name,
                                    type: 'tool',
                                    input: (0, langwatch_1.autoconvertTypedValues)(input)
                                });
                                this.handlers['langWatch'].span = (_d = {}, _d[span.spanId] = span, _d);
                                returnIds['langWatch'].span = span.spanId;
                            }
                        }
                        return [2 /*return*/, returnIds];
                }
            });
        });
    };
    AnalyticHandler.prototype.onToolEnd = function (returnIds, output) {
        return __awaiter(this, void 0, void 0, function () {
            var toolRun, toolSpan, toolEventId, monitor, span;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        toolRun = this.handlers['langSmith'].toolRun[returnIds['langSmith'].toolRun];
                        if (!toolRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, toolRun.end({
                                outputs: {
                                    output: output
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, toolRun.patchRun()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) {
                            toolSpan = this.handlers['langFuse'].toolSpan[returnIds['langFuse'].toolSpan];
                            if (toolSpan) {
                                toolSpan.end({
                                    output: output
                                });
                            }
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 5];
                        toolEventId = this.handlers['lunary'].toolEvent[returnIds['lunary'].toolEvent];
                        monitor = this.handlers['lunary'].client;
                        if (!(monitor && toolEventId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, monitor.trackEvent('tool', 'end', {
                                runId: toolEventId,
                                output: output
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            span = this.handlers['langWatch'].span[returnIds['langWatch'].span];
                            if (span) {
                                span.end({
                                    output: (0, langwatch_1.autoconvertTypedValues)(output)
                                });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AnalyticHandler.prototype.onToolError = function (returnIds, error) {
        return __awaiter(this, void 0, void 0, function () {
            var toolRun, toolSpan, toolEventId, monitor, span;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'langSmith')) return [3 /*break*/, 3];
                        toolRun = this.handlers['langSmith'].toolRun[returnIds['langSmith'].toolRun];
                        if (!toolRun) return [3 /*break*/, 3];
                        return [4 /*yield*/, toolRun.end({
                                error: {
                                    error: error
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, toolRun.patchRun()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langFuse')) {
                            toolSpan = this.handlers['langFuse'].toolSpan[returnIds['langFuse'].toolSpan];
                            if (toolSpan) {
                                toolSpan.end({
                                    output: error
                                });
                            }
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.handlers, 'lunary')) return [3 /*break*/, 5];
                        toolEventId = this.handlers['lunary'].llmEvent[returnIds['lunary'].toolEvent];
                        monitor = this.handlers['lunary'].client;
                        if (!(monitor && toolEventId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, monitor.trackEvent('tool', 'end', {
                                runId: toolEventId,
                                output: error
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (Object.prototype.hasOwnProperty.call(this.handlers, 'langWatch')) {
                            span = this.handlers['langWatch'].span[returnIds['langWatch'].span];
                            if (span) {
                                span.end({
                                    error: error
                                });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return AnalyticHandler;
}());
exports.AnalyticHandler = AnalyticHandler;
