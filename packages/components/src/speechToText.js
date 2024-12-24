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
exports.convertSpeechToText = void 0;
var utils_1 = require("./utils");
var openai_1 = require("@langchain/openai");
var assemblyai_1 = require("assemblyai");
var storageUtils_1 = require("./storageUtils");
var SpeechToTextType = {
    OPENAI_WHISPER: 'openAIWhisper',
    ASSEMBLYAI_TRANSCRIBE: 'assemblyAiTranscribe',
    LOCALAI_STT: 'localAISTT'
};
var convertSpeechToText = function (upload, speechToTextConfig, options) { return __awaiter(void 0, void 0, void 0, function () {
    var credentialId, credentialData, audio_file, _a, openAIClientOptions, openAIClient, file, openAITranscription, assemblyAIClient, params, assemblyAITranscription, LocalAIClientOptions, localAIClient, file, localAITranscription;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!speechToTextConfig) return [3 /*break*/, 12];
                credentialId = speechToTextConfig.credentialId;
                return [4 /*yield*/, (0, utils_1.getCredentialData)(credentialId !== null && credentialId !== void 0 ? credentialId : '', options)];
            case 1:
                credentialData = _b.sent();
                return [4 /*yield*/, (0, storageUtils_1.getFileFromStorage)(upload.name, options.chatflowid, options.chatId)];
            case 2:
                audio_file = _b.sent();
                _a = speechToTextConfig.name;
                switch (_a) {
                    case SpeechToTextType.OPENAI_WHISPER: return [3 /*break*/, 3];
                    case SpeechToTextType.ASSEMBLYAI_TRANSCRIBE: return [3 /*break*/, 6];
                    case SpeechToTextType.LOCALAI_STT: return [3 /*break*/, 8];
                }
                return [3 /*break*/, 11];
            case 3:
                openAIClientOptions = {
                    apiKey: credentialData.openAIApiKey
                };
                openAIClient = new openai_1.OpenAIClient(openAIClientOptions);
                return [4 /*yield*/, (0, openai_1.toFile)(audio_file, upload.name)];
            case 4:
                file = _b.sent();
                return [4 /*yield*/, openAIClient.audio.transcriptions.create({
                        file: file,
                        model: 'whisper-1',
                        language: speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.language,
                        temperature: (speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.temperature) ? parseFloat(speechToTextConfig.temperature) : undefined,
                        prompt: speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.prompt
                    })];
            case 5:
                openAITranscription = _b.sent();
                if (openAITranscription === null || openAITranscription === void 0 ? void 0 : openAITranscription.text) {
                    return [2 /*return*/, openAITranscription.text];
                }
                return [3 /*break*/, 11];
            case 6:
                assemblyAIClient = new assemblyai_1.AssemblyAI({
                    apiKey: credentialData.assemblyAIApiKey
                });
                params = {
                    audio: audio_file,
                    speaker_labels: false
                };
                return [4 /*yield*/, assemblyAIClient.transcripts.transcribe(params)];
            case 7:
                assemblyAITranscription = _b.sent();
                if (assemblyAITranscription === null || assemblyAITranscription === void 0 ? void 0 : assemblyAITranscription.text) {
                    return [2 /*return*/, assemblyAITranscription.text];
                }
                return [3 /*break*/, 11];
            case 8:
                LocalAIClientOptions = {
                    apiKey: credentialData.localAIApiKey,
                    baseURL: speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.baseUrl
                };
                localAIClient = new openai_1.OpenAIClient(LocalAIClientOptions);
                return [4 /*yield*/, (0, openai_1.toFile)(audio_file, upload.name)];
            case 9:
                file = _b.sent();
                return [4 /*yield*/, localAIClient.audio.transcriptions.create({
                        file: file,
                        model: (speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.model) || 'whisper-1',
                        language: speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.language,
                        temperature: (speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.temperature) ? parseFloat(speechToTextConfig.temperature) : undefined,
                        prompt: speechToTextConfig === null || speechToTextConfig === void 0 ? void 0 : speechToTextConfig.prompt
                    })];
            case 10:
                localAITranscription = _b.sent();
                if (localAITranscription === null || localAITranscription === void 0 ? void 0 : localAITranscription.text) {
                    return [2 /*return*/, localAITranscription.text];
                }
                return [3 /*break*/, 11];
            case 11: return [3 /*break*/, 13];
            case 12: throw new Error('Speech to text is not selected, but found a recorded audio file. Please fix the chain.');
            case 13: return [2 /*return*/, undefined];
        }
    });
}); };
exports.convertSpeechToText = convertSpeechToText;
