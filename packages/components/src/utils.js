"use strict";
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
exports.removeInvalidImageMarkdown = exports.mapMimeTypeToExt = exports.mapMimeTypeToInputField = exports.mapExtToInputField = exports.getVersion = exports.prepareSandboxVars = exports.getVars = exports.convertMultiOptionsToStringArray = exports.convertBaseMessagetoIMessage = exports.flattenObject = exports.convertSchemaToZod = exports.serializeChatHistory = exports.convertChatHistoryToText = exports.mapChatMessageToBaseMessage = exports.getUserHome = exports.getCredentialParam = exports.defaultChain = exports.getCredentialData = exports.getEncryptionKeyPath = exports.getEnvironmentVariable = exports.getAvailableURLs = exports.getInputVariables = exports.getNodeModulesPackagePath = exports.getBaseClasses = exports.defaultAllowBuiltInDep = exports.availableDependencies = exports.FLOWISE_CHATID = exports.notEmptyRegex = exports.numberOrExpressionRegex = void 0;
exports.serializeQueryParams = serializeQueryParams;
exports.handleErrorMessage = handleErrorMessage;
exports.webCrawl = webCrawl;
exports.getURLsFromXML = getURLsFromXML;
exports.xmlScrape = xmlScrape;
exports.handleEscapeCharacters = handleEscapeCharacters;
var axios_1 = require("axios");
var cheerio_1 = require("cheerio");
var fs = require("fs");
var path = require("path");
var jsdom_1 = require("jsdom");
var zod_1 = require("zod");
var crypto_js_1 = require("crypto-js");
var messages_1 = require("@langchain/core/messages");
var storageUtils_1 = require("./storageUtils");
exports.numberOrExpressionRegex = '^(\\d+\\.?\\d*|{{.*}})$'; //return true if string consists only numbers OR expression {{}}
exports.notEmptyRegex = '(.|\\s)*\\S(.|\\s)*'; //return true if string is not empty or blank
exports.FLOWISE_CHATID = 'flowise_chatId';
/*
 * List of dependencies allowed to be import in @flowiseai/nodevm
 */
exports.availableDependencies = [
    '@aws-sdk/client-bedrock-runtime',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-s3',
    '@elastic/elasticsearch',
    '@dqbd/tiktoken',
    '@getzep/zep-js',
    '@gomomento/sdk',
    '@gomomento/sdk-core',
    '@google-ai/generativelanguage',
    '@google/generative-ai',
    '@huggingface/inference',
    '@langchain/anthropic',
    '@langchain/aws',
    '@langchain/cohere',
    '@langchain/community',
    '@langchain/core',
    '@langchain/google-genai',
    '@langchain/google-vertexai',
    '@langchain/groq',
    '@langchain/langgraph',
    '@langchain/mistralai',
    '@langchain/mongodb',
    '@langchain/ollama',
    '@langchain/openai',
    '@langchain/pinecone',
    '@langchain/qdrant',
    '@langchain/weaviate',
    '@notionhq/client',
    '@opensearch-project/opensearch',
    '@pinecone-database/pinecone',
    '@qdrant/js-client-rest',
    '@supabase/supabase-js',
    '@upstash/redis',
    '@zilliz/milvus2-sdk-node',
    'apify-client',
    'axios',
    'cheerio',
    'chromadb',
    'cohere-ai',
    'd3-dsv',
    'faiss-node',
    'form-data',
    'google-auth-library',
    'graphql',
    'html-to-text',
    'ioredis',
    'langchain',
    'langfuse',
    'langsmith',
    'langwatch',
    'linkifyjs',
    'lunary',
    'mammoth',
    'moment',
    'mongodb',
    'mysql2',
    'node-fetch',
    'node-html-markdown',
    'notion-to-md',
    'openai',
    'pdf-parse',
    'pdfjs-dist',
    'pg',
    'playwright',
    'puppeteer',
    'redis',
    'replicate',
    'srt-parser-2',
    'typeorm',
    'weaviate-ts-client'
];
exports.defaultAllowBuiltInDep = [
    'assert',
    'buffer',
    'crypto',
    'events',
    'http',
    'https',
    'net',
    'path',
    'querystring',
    'timers',
    'tls',
    'url',
    'zlib'
];
/**
 * Get base classes of components
 *
 * @export
 * @param {any} targetClass
 * @returns {string[]}
 */
var getBaseClasses = function (targetClass) {
    var baseClasses = [];
    var skipClassNames = ['BaseLangChain', 'Serializable'];
    if (targetClass instanceof Function) {
        var baseClass = targetClass;
        while (baseClass) {
            var newBaseClass = Object.getPrototypeOf(baseClass);
            if (newBaseClass && newBaseClass !== Object && newBaseClass.name) {
                baseClass = newBaseClass;
                if (!skipClassNames.includes(baseClass.name))
                    baseClasses.push(baseClass.name);
            }
            else {
                break;
            }
        }
    }
    return baseClasses;
};
exports.getBaseClasses = getBaseClasses;
/**
 * Serialize axios query params
 *
 * @export
 * @param {any} params
 * @param {boolean} skipIndex // Set to true if you want same params to be: param=1&param=2 instead of: param[0]=1&param[1]=2
 * @returns {string}
 */
function serializeQueryParams(params, skipIndex) {
    var parts = [];
    var encode = function (val) {
        return encodeURIComponent(val)
            .replace(/%3A/gi, ':')
            .replace(/%24/g, '$')
            .replace(/%2C/gi, ',')
            .replace(/%20/g, '+')
            .replace(/%5B/gi, '[')
            .replace(/%5D/gi, ']');
    };
    var convertPart = function (key, val) {
        if (val instanceof Date)
            val = val.toISOString();
        else if (val instanceof Object)
            val = JSON.stringify(val);
        parts.push(encode(key) + '=' + encode(val));
    };
    Object.entries(params).forEach(function (_a) {
        var key = _a[0], val = _a[1];
        if (val === null || typeof val === 'undefined')
            return;
        if (Array.isArray(val))
            val.forEach(function (v, i) { return convertPart("".concat(key).concat(skipIndex ? '' : "[".concat(i, "]")), v); });
        else
            convertPart(key, val);
    });
    return parts.join('&');
}
/**
 * Handle error from try catch
 *
 * @export
 * @param {any} error
 * @returns {string}
 */
function handleErrorMessage(error) {
    var errorMessage = '';
    if (error.message) {
        errorMessage += error.message + '. ';
    }
    if (error.response && error.response.data) {
        if (error.response.data.error) {
            if (typeof error.response.data.error === 'object')
                errorMessage += JSON.stringify(error.response.data.error) + '. ';
            else if (typeof error.response.data.error === 'string')
                errorMessage += error.response.data.error + '. ';
        }
        else if (error.response.data.msg)
            errorMessage += error.response.data.msg + '. ';
        else if (error.response.data.Message)
            errorMessage += error.response.data.Message + '. ';
        else if (typeof error.response.data === 'string')
            errorMessage += error.response.data + '. ';
    }
    if (!errorMessage)
        errorMessage = 'Unexpected Error.';
    return errorMessage;
}
/**
 * Returns the path of node modules package
 * @param {string} packageName
 * @returns {string}
 */
var getNodeModulesPackagePath = function (packageName) {
    var checkPaths = [
        path.join(__dirname, '..', 'node_modules', packageName),
        path.join(__dirname, '..', '..', 'node_modules', packageName),
        path.join(__dirname, '..', '..', '..', 'node_modules', packageName),
        path.join(__dirname, '..', '..', '..', '..', 'node_modules', packageName),
        path.join(__dirname, '..', '..', '..', '..', '..', 'node_modules', packageName)
    ];
    for (var _i = 0, checkPaths_1 = checkPaths; _i < checkPaths_1.length; _i++) {
        var checkPath = checkPaths_1[_i];
        if (fs.existsSync(checkPath)) {
            return checkPath;
        }
    }
    return '';
};
exports.getNodeModulesPackagePath = getNodeModulesPackagePath;
/**
 * Get input variables
 * @param {string} paramValue
 * @returns {boolean}
 */
var getInputVariables = function (paramValue) {
    if (typeof paramValue !== 'string')
        return [];
    var returnVal = paramValue;
    var variableStack = [];
    var inputVariables = [];
    var startIdx = 0;
    var endIdx = returnVal.length;
    while (startIdx < endIdx) {
        var substr = returnVal.substring(startIdx, startIdx + 1);
        // Check for escaped curly brackets
        if (substr === '\\' && (returnVal[startIdx + 1] === '{' || returnVal[startIdx + 1] === '}')) {
            startIdx += 2; // Skip the escaped bracket
            continue;
        }
        // Store the opening double curly bracket
        if (substr === '{') {
            variableStack.push({ substr: substr, startIdx: startIdx + 1 });
        }
        // Found the complete variable
        if (substr === '}' && variableStack.length > 0 && variableStack[variableStack.length - 1].substr === '{') {
            var variableStartIdx = variableStack[variableStack.length - 1].startIdx;
            var variableEndIdx = startIdx;
            var variableFullPath = returnVal.substring(variableStartIdx, variableEndIdx);
            inputVariables.push(variableFullPath);
            variableStack.pop();
        }
        startIdx += 1;
    }
    return inputVariables;
};
exports.getInputVariables = getInputVariables;
/**
 * Crawl all available urls given a domain url and limit
 * @param {string} url
 * @param {number} limit
 * @returns {string[]}
 */
var getAvailableURLs = function (url, limit) { return __awaiter(void 0, void 0, void 0, function () {
    var availableUrls, response, $, relativeLinks, i, element, relativeUrl, absoluteUrl, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                availableUrls = [];
                console.info("Crawling: ".concat(url));
                availableUrls.push(url);
                return [4 /*yield*/, axios_1.default.get(url)];
            case 1:
                response = _a.sent();
                $ = (0, cheerio_1.load)(response.data);
                relativeLinks = $("a[href^='/']");
                console.info("Available Relative Links: ".concat(relativeLinks.length));
                if (relativeLinks.length === 0)
                    return [2 /*return*/, availableUrls];
                limit = Math.min(limit + 1, relativeLinks.length); // limit + 1 is because index start from 0 and index 0 is occupy by url
                console.info("True Limit: ".concat(limit));
                // availableUrls.length cannot exceed limit
                for (i = 0; availableUrls.length < limit; i++) {
                    if (i === limit)
                        break; // some links are repetitive so it won't added into the array which cause the length to be lesser
                    console.info("index: ".concat(i));
                    element = relativeLinks[i];
                    relativeUrl = $(element).attr('href');
                    if (!relativeUrl)
                        continue;
                    absoluteUrl = new URL(relativeUrl, url).toString();
                    if (!availableUrls.includes(absoluteUrl)) {
                        availableUrls.push(absoluteUrl);
                        console.info("Found unique relative link: ".concat(absoluteUrl));
                    }
                }
                return [2 /*return*/, availableUrls];
            case 2:
                err_1 = _a.sent();
                throw new Error("getAvailableURLs: ".concat(err_1 === null || err_1 === void 0 ? void 0 : err_1.message));
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAvailableURLs = getAvailableURLs;
/**
 * Search for href through htmlBody string
 * @param {string} htmlBody
 * @param {string} baseURL
 * @returns {string[]}
 */
function getURLsFromHTML(htmlBody, baseURL) {
    var dom = new jsdom_1.JSDOM(htmlBody);
    var linkElements = dom.window.document.querySelectorAll('a');
    var urls = [];
    for (var _i = 0, linkElements_1 = linkElements; _i < linkElements_1.length; _i++) {
        var linkElement = linkElements_1[_i];
        try {
            var urlObj = new URL(linkElement.href, baseURL);
            urls.push(urlObj.href);
        }
        catch (err) {
            if (process.env.DEBUG === 'true')
                console.error("error with scraped URL: ".concat(err.message));
            continue;
        }
    }
    return urls;
}
/**
 * Normalize URL to prevent crawling the same page
 * @param {string} urlString
 * @returns {string}
 */
function normalizeURL(urlString) {
    var urlObj = new URL(urlString);
    var hostPath = urlObj.hostname + urlObj.pathname + urlObj.search;
    if (hostPath.length > 0 && hostPath.slice(-1) == '/') {
        // handling trailing slash
        return hostPath.slice(0, -1);
    }
    return hostPath;
}
/**
 * Recursive crawl using normalizeURL and getURLsFromHTML
 * @param {string} baseURL
 * @param {string} currentURL
 * @param {string[]} pages
 * @param {number} limit
 * @returns {Promise<string[]>}
 */
function crawl(baseURL, currentURL, pages, limit) {
    return __awaiter(this, void 0, void 0, function () {
        var baseURLObj, currentURLObj, normalizeCurrentURL, resp, contentType, htmlBody, nextURLs, _i, nextURLs_1, nextURL, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseURLObj = new URL(baseURL);
                    currentURLObj = new URL(currentURL);
                    if (limit !== 0 && pages.length === limit)
                        return [2 /*return*/, pages];
                    if (baseURLObj.hostname !== currentURLObj.hostname)
                        return [2 /*return*/, pages];
                    normalizeCurrentURL = baseURLObj.protocol + '//' + normalizeURL(currentURL);
                    if (pages.includes(normalizeCurrentURL)) {
                        return [2 /*return*/, pages];
                    }
                    pages.push(normalizeCurrentURL);
                    if (process.env.DEBUG === 'true')
                        console.info("actively crawling ".concat(currentURL));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, fetch(currentURL)];
                case 2:
                    resp = _a.sent();
                    if (resp.status > 399) {
                        if (process.env.DEBUG === 'true')
                            console.error("error in fetch with status code: ".concat(resp.status, ", on page: ").concat(currentURL));
                        return [2 /*return*/, pages];
                    }
                    contentType = resp.headers.get('content-type');
                    if ((contentType && !contentType.includes('text/html')) || !contentType) {
                        if (process.env.DEBUG === 'true')
                            console.error("non html response, content type: ".concat(contentType, ", on page: ").concat(currentURL));
                        return [2 /*return*/, pages];
                    }
                    return [4 /*yield*/, resp.text()];
                case 3:
                    htmlBody = _a.sent();
                    nextURLs = getURLsFromHTML(htmlBody, currentURL);
                    _i = 0, nextURLs_1 = nextURLs;
                    _a.label = 4;
                case 4:
                    if (!(_i < nextURLs_1.length)) return [3 /*break*/, 7];
                    nextURL = nextURLs_1[_i];
                    return [4 /*yield*/, crawl(baseURL, nextURL, pages, limit)];
                case 5:
                    pages = _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 9];
                case 8:
                    err_2 = _a.sent();
                    if (process.env.DEBUG === 'true')
                        console.error("error in fetch url: ".concat(err_2.message, ", on page: ").concat(currentURL));
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, pages];
            }
        });
    });
}
/**
 * Prep URL before passing into recursive crawl function
 * @param {string} stringURL
 * @param {number} limit
 * @returns {Promise<string[]>}
 */
function webCrawl(stringURL, limit) {
    return __awaiter(this, void 0, void 0, function () {
        var URLObj, modifyURL;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    URLObj = new URL(stringURL);
                    modifyURL = stringURL.slice(-1) === '/' ? stringURL.slice(0, -1) : stringURL;
                    return [4 /*yield*/, crawl(URLObj.protocol + '//' + URLObj.hostname, modifyURL, [], limit)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getURLsFromXML(xmlBody, limit) {
    var dom = new jsdom_1.JSDOM(xmlBody, { contentType: 'text/xml' });
    var linkElements = dom.window.document.querySelectorAll('url');
    var urls = [];
    for (var _i = 0, linkElements_2 = linkElements; _i < linkElements_2.length; _i++) {
        var linkElement = linkElements_2[_i];
        var locElement = linkElement.querySelector('loc');
        if (limit !== 0 && urls.length === limit)
            break;
        if (locElement === null || locElement === void 0 ? void 0 : locElement.textContent) {
            urls.push(locElement.textContent);
        }
    }
    return urls;
}
function xmlScrape(currentURL, limit) {
    return __awaiter(this, void 0, void 0, function () {
        var urls, resp, contentType, xmlBody, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    urls = [];
                    if (process.env.DEBUG === 'true')
                        console.info("actively scarping ".concat(currentURL));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(currentURL)];
                case 2:
                    resp = _a.sent();
                    if (resp.status > 399) {
                        if (process.env.DEBUG === 'true')
                            console.error("error in fetch with status code: ".concat(resp.status, ", on page: ").concat(currentURL));
                        return [2 /*return*/, urls];
                    }
                    contentType = resp.headers.get('content-type');
                    if ((contentType && !contentType.includes('application/xml') && !contentType.includes('text/xml')) || !contentType) {
                        if (process.env.DEBUG === 'true')
                            console.error("non xml response, content type: ".concat(contentType, ", on page: ").concat(currentURL));
                        return [2 /*return*/, urls];
                    }
                    return [4 /*yield*/, resp.text()];
                case 3:
                    xmlBody = _a.sent();
                    urls = getURLsFromXML(xmlBody, limit);
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    if (process.env.DEBUG === 'true')
                        console.error("error in fetch url: ".concat(err_3.message, ", on page: ").concat(currentURL));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, urls];
            }
        });
    });
}
/**
 * Get env variables
 * @param {string} name
 * @returns {string | undefined}
 */
var getEnvironmentVariable = function (name) {
    var _a;
    try {
        return typeof process !== 'undefined' ? (_a = process.env) === null || _a === void 0 ? void 0 : _a[name] : undefined;
    }
    catch (e) {
        return undefined;
    }
};
exports.getEnvironmentVariable = getEnvironmentVariable;
/**
 * Returns the path of encryption key
 * @returns {string}
 */
var getEncryptionKeyFilePath = function () {
    var checkPaths = [
        path.join(__dirname, '..', '..', 'encryption.key'),
        path.join(__dirname, '..', '..', 'server', 'encryption.key'),
        path.join(__dirname, '..', '..', '..', 'encryption.key'),
        path.join(__dirname, '..', '..', '..', 'server', 'encryption.key'),
        path.join(__dirname, '..', '..', '..', '..', 'encryption.key'),
        path.join(__dirname, '..', '..', '..', '..', 'server', 'encryption.key'),
        path.join(__dirname, '..', '..', '..', '..', '..', 'encryption.key'),
        path.join(__dirname, '..', '..', '..', '..', '..', 'server', 'encryption.key'),
        path.join((0, exports.getUserHome)(), '.flowise', 'encryption.key')
    ];
    for (var _i = 0, checkPaths_2 = checkPaths; _i < checkPaths_2.length; _i++) {
        var checkPath = checkPaths_2[_i];
        if (fs.existsSync(checkPath)) {
            return checkPath;
        }
    }
    return '';
};
var getEncryptionKeyPath = function () {
    return process.env.SECRETKEY_PATH ? path.join(process.env.SECRETKEY_PATH, 'encryption.key') : getEncryptionKeyFilePath();
};
exports.getEncryptionKeyPath = getEncryptionKeyPath;
/**
 * Returns the encryption key
 * @returns {Promise<string>}
 */
var getEncryptionKey = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.FLOWISE_SECRETKEY_OVERWRITE !== undefined && process.env.FLOWISE_SECRETKEY_OVERWRITE !== '') {
                    return [2 /*return*/, process.env.FLOWISE_SECRETKEY_OVERWRITE];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, fs.promises.readFile((0, exports.getEncryptionKeyPath)(), 'utf8')];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                error_1 = _a.sent();
                throw new Error(error_1);
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Decrypt credential data
 * @param {string} encryptedData
 * @param {string} componentCredentialName
 * @param {IComponentCredentials} componentCredentials
 * @returns {Promise<ICommonObject>}
 */
var decryptCredentialData = function (encryptedData) { return __awaiter(void 0, void 0, void 0, function () {
    var encryptKey, decryptedData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getEncryptionKey()];
            case 1:
                encryptKey = _a.sent();
                decryptedData = crypto_js_1.AES.decrypt(encryptedData, encryptKey);
                try {
                    return [2 /*return*/, JSON.parse(decryptedData.toString(crypto_js_1.enc.Utf8))];
                }
                catch (e) {
                    console.error(e);
                    throw new Error('Credentials could not be decrypted.');
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Get credential data
 * @param {string} selectedCredentialId
 * @param {ICommonObject} options
 * @returns {Promise<ICommonObject>}
 */
var getCredentialData = function (selectedCredentialId, options) { return __awaiter(void 0, void 0, void 0, function () {
    var appDataSource, databaseEntities, credential, decryptedCredentialData, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                appDataSource = options.appDataSource;
                databaseEntities = options.databaseEntities;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                if (!selectedCredentialId) {
                    return [2 /*return*/, {}];
                }
                return [4 /*yield*/, appDataSource.getRepository(databaseEntities['Credential']).findOneBy({
                        id: selectedCredentialId
                    })];
            case 2:
                credential = _a.sent();
                if (!credential)
                    return [2 /*return*/, {}
                        // Decrypt credentialData
                    ];
                return [4 /*yield*/, decryptCredentialData(credential.encryptedData)];
            case 3:
                decryptedCredentialData = _a.sent();
                return [2 /*return*/, decryptedCredentialData];
            case 4:
                e_1 = _a.sent();
                throw new Error(e_1);
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getCredentialData = getCredentialData;
/**
 * Get first non falsy value
 *
 * @param {...any} values
 *
 * @returns {any|undefined}
 */
var defaultChain = function () {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return values.filter(Boolean)[0];
};
exports.defaultChain = defaultChain;
var getCredentialParam = function (paramName, credentialData, nodeData, defaultValue) {
    var _a, _b, _c;
    return (_c = (_b = (_a = nodeData.inputs[paramName]) !== null && _a !== void 0 ? _a : credentialData[paramName]) !== null && _b !== void 0 ? _b : defaultValue) !== null && _c !== void 0 ? _c : undefined;
};
exports.getCredentialParam = getCredentialParam;
// reference https://www.freeformatter.com/json-escape.html
var jsonEscapeCharacters = [
    { escape: '"', value: 'FLOWISE_DOUBLE_QUOTE' },
    { escape: '\n', value: 'FLOWISE_NEWLINE' },
    { escape: '\b', value: 'FLOWISE_BACKSPACE' },
    { escape: '\f', value: 'FLOWISE_FORM_FEED' },
    { escape: '\r', value: 'FLOWISE_CARRIAGE_RETURN' },
    { escape: '\t', value: 'FLOWISE_TAB' },
    { escape: '\\', value: 'FLOWISE_BACKSLASH' }
];
function handleEscapesJSONParse(input, reverse) {
    for (var _i = 0, jsonEscapeCharacters_1 = jsonEscapeCharacters; _i < jsonEscapeCharacters_1.length; _i++) {
        var element = jsonEscapeCharacters_1[_i];
        input = reverse ? input.replaceAll(element.value, element.escape) : input.replaceAll(element.escape, element.value);
    }
    return input;
}
function iterateEscapesJSONParse(input, reverse) {
    for (var element in input) {
        var type = typeof input[element];
        if (type === 'string')
            input[element] = handleEscapesJSONParse(input[element], reverse);
        else if (type === 'object')
            input[element] = iterateEscapesJSONParse(input[element], reverse);
    }
    return input;
}
function handleEscapeCharacters(input, reverse) {
    var type = typeof input;
    if (type === 'string')
        return handleEscapesJSONParse(input, reverse);
    else if (type === 'object')
        return iterateEscapesJSONParse(input, reverse);
    return input;
}
/**
 * Get user home dir
 * @returns {string}
 */
var getUserHome = function () {
    var variableName = 'HOME';
    if (process.platform === 'win32') {
        variableName = 'USERPROFILE';
    }
    if (process.env[variableName] === undefined) {
        // If for some reason the variable does not exist, fall back to current folder
        return process.cwd();
    }
    return process.env[variableName];
};
exports.getUserHome = getUserHome;
/**
 * Map ChatMessage to BaseMessage
 * @param {IChatMessage[]} chatmessages
 * @returns {BaseMessage[]}
 */
var mapChatMessageToBaseMessage = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (chatmessages) {
        var chatHistory, _a, chatmessages_1, message, messageWithFileUploads, uploads, imageContents, _b, uploads_1, upload, fileData, bf, fileLoaderNodeModule, fileLoaderNodeInstance, options, nodeData, documents, pageContents, messageContent, e_2;
        if (chatmessages === void 0) { chatmessages = []; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    chatHistory = [];
                    _a = 0, chatmessages_1 = chatmessages;
                    _c.label = 1;
                case 1:
                    if (!(_a < chatmessages_1.length)) return [3 /*break*/, 16];
                    message = chatmessages_1[_a];
                    if (!(message.role === 'apiMessage' || message.type === 'apiMessage')) return [3 /*break*/, 2];
                    chatHistory.push(new messages_1.AIMessage(message.content || ''));
                    return [3 /*break*/, 15];
                case 2:
                    if (!(message.role === 'userMessage' || message.role === 'userMessage')) return [3 /*break*/, 15];
                    if (!message.fileUploads) return [3 /*break*/, 14];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 12, , 13]);
                    messageWithFileUploads = '';
                    uploads = JSON.parse(message.fileUploads);
                    imageContents = [];
                    _b = 0, uploads_1 = uploads;
                    _c.label = 4;
                case 4:
                    if (!(_b < uploads_1.length)) return [3 /*break*/, 11];
                    upload = uploads_1[_b];
                    if (!(upload.type === 'stored-file' && upload.mime.startsWith('image'))) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, storageUtils_1.getFileFromStorage)(upload.name, message.chatflowid, message.chatId)
                        // as the image is stored in the server, read the file and convert it to base64
                    ];
                case 5:
                    fileData = _c.sent();
                    bf = 'data:' + upload.mime + ';base64,' + fileData.toString('base64');
                    imageContents.push({
                        type: 'image_url',
                        image_url: {
                            url: bf
                        }
                    });
                    return [3 /*break*/, 10];
                case 6:
                    if (!(upload.type === 'url' && upload.mime.startsWith('image'))) return [3 /*break*/, 7];
                    imageContents.push({
                        type: 'image_url',
                        image_url: {
                            url: upload.data
                        }
                    });
                    return [3 /*break*/, 10];
                case 7:
                    if (!(upload.type === 'stored-file:full')) return [3 /*break*/, 10];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../nodes/documentloaders/File/File'); })];
                case 8:
                    fileLoaderNodeModule = _c.sent();
                    fileLoaderNodeInstance = new fileLoaderNodeModule.nodeClass();
                    options = {
                        retrieveAttachmentChatId: true,
                        chatflowid: message.chatflowid,
                        chatId: message.chatId
                    };
                    nodeData = {
                        inputs: {
                            txtFile: "FILE-STORAGE::".concat(JSON.stringify([upload.name]))
                        }
                    };
                    return [4 /*yield*/, fileLoaderNodeInstance.init(nodeData, '', options)];
                case 9:
                    documents = _c.sent();
                    pageContents = documents.map(function (doc) { return doc.pageContent; }).join('\n');
                    messageWithFileUploads += "<doc name='".concat(upload.name, "'>").concat(pageContents, "</doc>\n\n");
                    _c.label = 10;
                case 10:
                    _b++;
                    return [3 /*break*/, 4];
                case 11:
                    messageContent = messageWithFileUploads ? "".concat(messageWithFileUploads, "\n\n").concat(message.content) : message.content;
                    chatHistory.push(new messages_1.HumanMessage({
                        content: __spreadArray([
                            {
                                type: 'text',
                                text: messageContent
                            }
                        ], imageContents, true)
                    }));
                    return [3 /*break*/, 13];
                case 12:
                    e_2 = _c.sent();
                    // failed to parse fileUploads, continue with text only
                    chatHistory.push(new messages_1.HumanMessage(message.content || ''));
                    return [3 /*break*/, 13];
                case 13: return [3 /*break*/, 15];
                case 14:
                    chatHistory.push(new messages_1.HumanMessage(message.content || ''));
                    _c.label = 15;
                case 15:
                    _a++;
                    return [3 /*break*/, 1];
                case 16: return [2 /*return*/, chatHistory];
            }
        });
    });
};
exports.mapChatMessageToBaseMessage = mapChatMessageToBaseMessage;
/**
 * Convert incoming chat history to string
 * @param {IMessage[]} chatHistory
 * @returns {string}
 */
var convertChatHistoryToText = function (chatHistory) {
    if (chatHistory === void 0) { chatHistory = []; }
    return chatHistory
        .map(function (chatMessage) {
        if (chatMessage.type === 'apiMessage') {
            return "Assistant: ".concat(chatMessage.message);
        }
        else if (chatMessage.type === 'userMessage') {
            return "Human: ".concat(chatMessage.message);
        }
        else {
            return "".concat(chatMessage.message);
        }
    })
        .join('\n');
};
exports.convertChatHistoryToText = convertChatHistoryToText;
/**
 * Serialize array chat history to string
 * @param {string | Array<string>} chatHistory
 * @returns {string}
 */
var serializeChatHistory = function (chatHistory) {
    if (Array.isArray(chatHistory)) {
        return chatHistory.join('\n');
    }
    return chatHistory;
};
exports.serializeChatHistory = serializeChatHistory;
/**
 * Convert schema to zod schema
 * @param {string | object} schema
 * @returns {ICommonObject}
 */
var convertSchemaToZod = function (schema) {
    try {
        var parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
        var zodObj = {};
        for (var _i = 0, parsedSchema_1 = parsedSchema; _i < parsedSchema_1.length; _i++) {
            var sch = parsedSchema_1[_i];
            if (sch.type === 'string') {
                if (sch.required) {
                    zodObj[sch.property] = zod_1.z.string({ required_error: "".concat(sch.property, " required") }).describe(sch.description);
                }
                else {
                    zodObj[sch.property] = zod_1.z.string().describe(sch.description).optional();
                }
            }
            else if (sch.type === 'number') {
                if (sch.required) {
                    zodObj[sch.property] = zod_1.z.number({ required_error: "".concat(sch.property, " required") }).describe(sch.description);
                }
                else {
                    zodObj[sch.property] = zod_1.z.number().describe(sch.description).optional();
                }
            }
            else if (sch.type === 'boolean') {
                if (sch.required) {
                    zodObj[sch.property] = zod_1.z.boolean({ required_error: "".concat(sch.property, " required") }).describe(sch.description);
                }
                else {
                    zodObj[sch.property] = zod_1.z.boolean().describe(sch.description).optional();
                }
            }
        }
        return zodObj;
    }
    catch (e) {
        throw new Error(e);
    }
};
exports.convertSchemaToZod = convertSchemaToZod;
/**
 * Flatten nested object
 * @param {ICommonObject} obj
 * @param {string} parentKey
 * @returns {ICommonObject}
 */
var flattenObject = function (obj, parentKey) {
    var result = {};
    if (!obj)
        return result;
    Object.keys(obj).forEach(function (key) {
        var value = obj[key];
        var _key = parentKey ? parentKey + '.' + key : key;
        if (typeof value === 'object') {
            result = __assign(__assign({}, result), (0, exports.flattenObject)(value, _key));
        }
        else {
            result[_key] = value;
        }
    });
    return result;
};
exports.flattenObject = flattenObject;
/**
 * Convert BaseMessage to IMessage
 * @param {BaseMessage[]} messages
 * @returns {IMessage[]}
 */
var convertBaseMessagetoIMessage = function (messages) {
    var formatmessages = [];
    for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
        var m = messages_2[_i];
        if (m._getType() === 'human') {
            formatmessages.push({
                message: m.content,
                type: 'userMessage'
            });
        }
        else if (m._getType() === 'ai') {
            formatmessages.push({
                message: m.content,
                type: 'apiMessage'
            });
        }
        else if (m._getType() === 'system') {
            formatmessages.push({
                message: m.content,
                type: 'apiMessage'
            });
        }
    }
    return formatmessages;
};
exports.convertBaseMessagetoIMessage = convertBaseMessagetoIMessage;
/**
 * Convert MultiOptions String to String Array
 * @param {string} inputString
 * @returns {string[]}
 */
var convertMultiOptionsToStringArray = function (inputString) {
    var ArrayString = [];
    try {
        ArrayString = JSON.parse(inputString);
    }
    catch (e) {
        ArrayString = [];
    }
    return ArrayString;
};
exports.convertMultiOptionsToStringArray = convertMultiOptionsToStringArray;
/**
 * Get variables
 * @param {DataSource} appDataSource
 * @param {IDatabaseEntity} databaseEntities
 * @param {INodeData} nodeData
 */
var getVars = function (appDataSource, databaseEntities, nodeData) { return __awaiter(void 0, void 0, void 0, function () {
    var variables, _loop_1, _i, _a, propertyName;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, appDataSource.getRepository(databaseEntities['Variable']).find()];
            case 1:
                variables = (_b = (_d.sent())) !== null && _b !== void 0 ? _b : [];
                // override variables defined in overrideConfig
                // nodeData.inputs.vars is an Object, check each property and override the variable
                if ((_c = nodeData === null || nodeData === void 0 ? void 0 : nodeData.inputs) === null || _c === void 0 ? void 0 : _c.vars) {
                    _loop_1 = function (propertyName) {
                        var foundVar = variables.find(function (v) { return v.name === propertyName; });
                        if (foundVar) {
                            // even if the variable was defined as runtime, we override it with static value
                            foundVar.type = 'static';
                            foundVar.value = nodeData.inputs.vars[propertyName];
                        }
                        else {
                            // add it the variables, if not found locally in the db
                            variables.push({ name: propertyName, type: 'static', value: nodeData.inputs.vars[propertyName] });
                        }
                    };
                    for (_i = 0, _a = Object.getOwnPropertyNames(nodeData.inputs.vars); _i < _a.length; _i++) {
                        propertyName = _a[_i];
                        _loop_1(propertyName);
                    }
                }
                return [2 /*return*/, variables];
        }
    });
}); };
exports.getVars = getVars;
/**
 * Prepare sandbox variables
 * @param {IVariable[]} variables
 */
var prepareSandboxVars = function (variables) {
    var _a;
    var vars = {};
    if (variables) {
        for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
            var item = variables_1[_i];
            var value = item.value;
            // read from .env file
            if (item.type === 'runtime') {
                value = (_a = process.env[item.name]) !== null && _a !== void 0 ? _a : '';
            }
            Object.defineProperty(vars, item.name, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            });
        }
    }
    return vars;
};
exports.prepareSandboxVars = prepareSandboxVars;
var version;
var getVersion = function () { return __awaiter(void 0, void 0, void 0, function () {
    var checkPaths, _i, checkPaths_3, checkPath, content, parsedContent, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (version != null)
                    return [2 /*return*/, { version: version }];
                checkPaths = [
                    path.join(__dirname, '..', 'package.json'),
                    path.join(__dirname, '..', '..', 'package.json'),
                    path.join(__dirname, '..', '..', '..', 'package.json'),
                    path.join(__dirname, '..', '..', '..', '..', 'package.json'),
                    path.join(__dirname, '..', '..', '..', '..', '..', 'package.json')
                ];
                _i = 0, checkPaths_3 = checkPaths;
                _b.label = 1;
            case 1:
                if (!(_i < checkPaths_3.length)) return [3 /*break*/, 6];
                checkPath = checkPaths_3[_i];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, fs.promises.readFile(checkPath, 'utf8')];
            case 3:
                content = _b.sent();
                parsedContent = JSON.parse(content);
                version = parsedContent.version;
                return [2 /*return*/, { version: version }];
            case 4:
                _a = _b.sent();
                return [3 /*break*/, 5];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: throw new Error('None of the package.json paths could be parsed');
        }
    });
}); };
exports.getVersion = getVersion;
/**
 * Map Ext to InputField
 * @param {string} ext
 * @returns {string}
 */
var mapExtToInputField = function (ext) {
    switch (ext) {
        case '.txt':
            return 'txtFile';
        case '.pdf':
            return 'pdfFile';
        case '.json':
            return 'jsonFile';
        case '.csv':
        case '.xls':
        case '.xlsx':
            return 'csvFile';
        case '.jsonl':
            return 'jsonlinesFile';
        case '.docx':
        case '.doc':
            return 'docxFile';
        case '.yaml':
            return 'yamlFile';
        default:
            return 'txtFile';
    }
};
exports.mapExtToInputField = mapExtToInputField;
/**
 * Map MimeType to InputField
 * @param {string} mimeType
 * @returns {string}
 */
var mapMimeTypeToInputField = function (mimeType) {
    switch (mimeType) {
        case 'text/plain':
            return 'txtFile';
        case 'application/pdf':
            return 'pdfFile';
        case 'application/json':
            return 'jsonFile';
        case 'text/csv':
            return 'csvFile';
        case 'application/json-lines':
        case 'application/jsonl':
        case 'text/jsonl':
            return 'jsonlinesFile';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'docxFile';
        case 'application/vnd.yaml':
        case 'application/x-yaml':
        case 'text/vnd.yaml':
        case 'text/x-yaml':
        case 'text/yaml':
            return 'yamlFile';
        default:
            return 'txtFile';
    }
};
exports.mapMimeTypeToInputField = mapMimeTypeToInputField;
/**
 * Map MimeType to Extension
 * @param {string} mimeType
 * @returns {string}
 */
var mapMimeTypeToExt = function (mimeType) {
    switch (mimeType) {
        case 'text/plain':
            return 'txt';
        case 'application/pdf':
            return 'pdf';
        case 'application/json':
            return 'json';
        case 'text/csv':
            return 'csv';
        case 'application/json-lines':
        case 'application/jsonl':
        case 'text/jsonl':
            return 'jsonl';
        case 'application/msword':
            return 'doc';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'docx';
        case 'application/vnd.ms-excel':
            return 'xls';
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'xlsx';
        default:
            return '';
    }
};
exports.mapMimeTypeToExt = mapMimeTypeToExt;
// remove invalid markdown image pattern: ![<some-string>](<some-string>)
var removeInvalidImageMarkdown = function (output) {
    return typeof output === 'string' ? output.replace(/!\[.*?\]\((?!https?:\/\/).*?\)/g, '') : output;
};
exports.removeInvalidImageMarkdown = removeInvalidImageMarkdown;
