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
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var text_1 = require("langchain/document_loaders/fs/text");
var json_1 = require("langchain/document_loaders/fs/json");
var csv_1 = require("@langchain/community/document_loaders/fs/csv");
var pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
var docx_1 = require("@langchain/community/document_loaders/fs/docx");
var base_1 = require("langchain/document_loaders/base");
var storageUtils_1 = require("../../../src/storageUtils");
var utils_1 = require("../../../src/utils");
var File_DocumentLoaders = /** @class */ (function () {
    function File_DocumentLoaders() {
        this.label = 'File Loader';
        this.name = 'fileLoader';
        this.version = 1.0;
        this.type = 'Document';
        this.icon = 'file.svg';
        this.category = 'Document Loaders';
        this.description = "A generic file loader that can load txt, json, csv, docx, pdf, and other files";
        this.baseClasses = [this.type];
        this.inputs = [
            {
                label: 'File',
                name: 'file',
                type: 'file',
                fileType: '*'
            },
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Pdf Usage',
                name: 'pdfUsage',
                type: 'options',
                description: 'Only when loading PDF files',
                options: [
                    {
                        label: 'One document per page',
                        name: 'perPage'
                    },
                    {
                        label: 'One document per file',
                        name: 'perFile'
                    }
                ],
                default: 'perPage',
                optional: true,
                additionalParams: true
            },
            {
                label: 'JSONL Pointer Extraction',
                name: 'pointerName',
                type: 'string',
                description: 'Only when loading JSONL files',
                placeholder: '<pointerName>',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Additional Metadata',
                name: 'metadata',
                type: 'json',
                description: 'Additional metadata to be added to the extracted documents',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Omit Metadata Keys',
                name: 'omitMetadataKeys',
                type: 'string',
                rows: 4,
                description: 'Each document loader comes with a default set of metadata keys that are extracted from the document. You can use this field to omit some of the default metadata keys. The value should be a list of keys, seperated by comma. Use * to omit all metadata keys execept the ones you specify in the Additional Metadata field',
                placeholder: 'key1, key2, key3.nestedKey1',
                optional: true,
                additionalParams: true
            }
        ];
    }
    File_DocumentLoaders.prototype.init = function (nodeData, _, options) {
        return __awaiter(this, void 0, void 0, function () {
            var textSplitter, fileBase64, metadata, pdfUsage, pointerName, _omitMetadataKeys, omitMetadataKeys, files, fileBlobs, totalFiles, fileName, chatflowid, retrieveAttachmentChatId, _i, files_1, file, fileData, blob, _a, files_2, file, fileData, blob, _b, files_3, file, splitDataURI, bf, blob, extension, match, mimeType, loader, docs, parsedMetadata_1;
            var _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        textSplitter = (_c = nodeData.inputs) === null || _c === void 0 ? void 0 : _c.textSplitter;
                        fileBase64 = (_d = nodeData.inputs) === null || _d === void 0 ? void 0 : _d.file;
                        metadata = (_e = nodeData.inputs) === null || _e === void 0 ? void 0 : _e.metadata;
                        pdfUsage = (_f = nodeData.inputs) === null || _f === void 0 ? void 0 : _f.pdfUsage;
                        pointerName = (_g = nodeData.inputs) === null || _g === void 0 ? void 0 : _g.pointerName;
                        _omitMetadataKeys = (_h = nodeData.inputs) === null || _h === void 0 ? void 0 : _h.omitMetadataKeys;
                        omitMetadataKeys = [];
                        if (_omitMetadataKeys) {
                            omitMetadataKeys = _omitMetadataKeys.split(',').map(function (key) { return key.trim(); });
                        }
                        files = [];
                        fileBlobs = [];
                        totalFiles = getOverrideFileInputs(nodeData) || fileBase64;
                        if (!totalFiles.startsWith('FILE-STORAGE::')) return [3 /*break*/, 10];
                        fileName = totalFiles.replace('FILE-STORAGE::', '');
                        if (fileName.startsWith('[') && fileName.endsWith(']')) {
                            files = JSON.parse(fileName);
                        }
                        else {
                            files = [fileName];
                        }
                        chatflowid = options.chatflowid;
                        retrieveAttachmentChatId = options.retrieveAttachmentChatId;
                        if (!retrieveAttachmentChatId) return [3 /*break*/, 5];
                        _i = 0, files_1 = files;
                        _j.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 4];
                        file = files_1[_i];
                        if (!file)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, storageUtils_1.getFileFromStorage)(file, chatflowid, options.chatId)];
                    case 2:
                        fileData = _j.sent();
                        blob = new Blob([fileData]);
                        fileBlobs.push({ blob: blob, ext: file.split('.').pop() || '' });
                        _j.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 9];
                    case 5:
                        _a = 0, files_2 = files;
                        _j.label = 6;
                    case 6:
                        if (!(_a < files_2.length)) return [3 /*break*/, 9];
                        file = files_2[_a];
                        if (!file)
                            return [3 /*break*/, 8];
                        return [4 /*yield*/, (0, storageUtils_1.getFileFromStorage)(file, chatflowid)];
                    case 7:
                        fileData = _j.sent();
                        blob = new Blob([fileData]);
                        fileBlobs.push({ blob: blob, ext: file.split('.').pop() || '' });
                        _j.label = 8;
                    case 8:
                        _a++;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        if (totalFiles.startsWith('[') && totalFiles.endsWith(']')) {
                            files = JSON.parse(totalFiles);
                        }
                        else {
                            files = [totalFiles];
                        }
                        for (_b = 0, files_3 = files; _b < files_3.length; _b++) {
                            file = files_3[_b];
                            if (!file)
                                continue;
                            splitDataURI = file.split(',');
                            splitDataURI.pop();
                            bf = Buffer.from(splitDataURI.pop() || '', 'base64');
                            blob = new Blob([bf]);
                            extension = '';
                            match = file.match(/^data:([A-Za-z-+\/]+);base64,/);
                            if (!match) {
                                fileBlobs.push({
                                    blob: blob,
                                    ext: extension
                                });
                            }
                            else {
                                mimeType = match[1];
                                fileBlobs.push({
                                    blob: blob,
                                    ext: (0, utils_1.mapMimeTypeToExt)(mimeType)
                                });
                            }
                        }
                        _j.label = 11;
                    case 11:
                        loader = new MultiFileLoader(fileBlobs, {
                            json: function (blob) { return new json_1.JSONLoader(blob); },
                            jsonl: function (blob) { return new json_1.JSONLinesLoader(blob, '/' + pointerName.trim()); },
                            txt: function (blob) { return new text_1.TextLoader(blob); },
                            csv: function (blob) { return new csv_1.CSVLoader(blob); },
                            xls: function (blob) { return new csv_1.CSVLoader(blob); },
                            xlsx: function (blob) { return new csv_1.CSVLoader(blob); },
                            docx: function (blob) { return new docx_1.DocxLoader(blob); },
                            doc: function (blob) { return new docx_1.DocxLoader(blob); },
                            pdf: function (blob) {
                                return pdfUsage === 'perFile'
                                    ? // @ts-ignore
                                        new pdf_1.PDFLoader(blob, { splitPages: false, pdfjs: function () { return Promise.resolve().then(function () { return require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js'); }); } })
                                    : // @ts-ignore
                                        new pdf_1.PDFLoader(blob, { pdfjs: function () { return Promise.resolve().then(function () { return require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js'); }); } });
                            },
                            '': function (blob) { return new text_1.TextLoader(blob); }
                        });
                        docs = [];
                        if (!textSplitter) return [3 /*break*/, 14];
                        return [4 /*yield*/, loader.load()];
                    case 12:
                        docs = _j.sent();
                        return [4 /*yield*/, textSplitter.splitDocuments(docs)];
                    case 13:
                        docs = _j.sent();
                        return [3 /*break*/, 16];
                    case 14: return [4 /*yield*/, loader.load()];
                    case 15:
                        docs = _j.sent();
                        _j.label = 16;
                    case 16:
                        if (metadata) {
                            parsedMetadata_1 = typeof metadata === 'object' ? metadata : JSON.parse(metadata);
                            docs = docs.map(function (doc) { return (__assign(__assign({}, doc), { metadata: _omitMetadataKeys === '*'
                                    ? __assign({}, parsedMetadata_1) : (0, lodash_1.omit)(__assign(__assign({}, doc.metadata), parsedMetadata_1), omitMetadataKeys) })); });
                        }
                        else {
                            docs = docs.map(function (doc) { return (__assign(__assign({}, doc), { metadata: _omitMetadataKeys === '*'
                                    ? {}
                                    : (0, lodash_1.omit)(__assign({}, doc.metadata), omitMetadataKeys) })); });
                        }
                        return [2 /*return*/, docs];
                }
            });
        });
    };
    return File_DocumentLoaders;
}());
var getOverrideFileInputs = function (nodeData) {
    var _a, _b, _c, _d, _e, _f, _g;
    var txtFileBase64 = (_a = nodeData.inputs) === null || _a === void 0 ? void 0 : _a.txtFile;
    var pdfFileBase64 = (_b = nodeData.inputs) === null || _b === void 0 ? void 0 : _b.pdfFile;
    var jsonFileBase64 = (_c = nodeData.inputs) === null || _c === void 0 ? void 0 : _c.jsonFile;
    var csvFileBase64 = (_d = nodeData.inputs) === null || _d === void 0 ? void 0 : _d.csvFile;
    var jsonlinesFileBase64 = (_e = nodeData.inputs) === null || _e === void 0 ? void 0 : _e.jsonlinesFile;
    var docxFileBase64 = (_f = nodeData.inputs) === null || _f === void 0 ? void 0 : _f.docxFile;
    var yamlFileBase64 = (_g = nodeData.inputs) === null || _g === void 0 ? void 0 : _g.yamlFile;
    var removePrefix = function (storageFile) {
        var fileName = storageFile.replace('FILE-STORAGE::', '');
        if (fileName.startsWith('[') && fileName.endsWith(']')) {
            return JSON.parse(fileName);
        }
        return [fileName];
    };
    // If exists, combine all file inputs into an array
    var files = [];
    if (txtFileBase64) {
        files.push.apply(files, removePrefix(txtFileBase64));
    }
    if (pdfFileBase64) {
        files.push.apply(files, removePrefix(pdfFileBase64));
    }
    if (jsonFileBase64) {
        files.push.apply(files, removePrefix(jsonFileBase64));
    }
    if (csvFileBase64) {
        files.push.apply(files, removePrefix(csvFileBase64));
    }
    if (jsonlinesFileBase64) {
        files.push.apply(files, removePrefix(jsonlinesFileBase64));
    }
    if (docxFileBase64) {
        files.push.apply(files, removePrefix(docxFileBase64));
    }
    if (yamlFileBase64) {
        files.push.apply(files, removePrefix(yamlFileBase64));
    }
    return files.length ? "FILE-STORAGE::".concat(JSON.stringify(files)) : '';
};
var MultiFileLoader = /** @class */ (function (_super) {
    __extends(MultiFileLoader, _super);
    function MultiFileLoader(fileBlobs, loaders) {
        var _this = _super.call(this) || this;
        _this.fileBlobs = fileBlobs;
        _this.loaders = loaders;
        if (Object.keys(loaders).length === 0) {
            throw new Error('Must provide at least one loader');
        }
        return _this;
    }
    MultiFileLoader.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var documents, _i, _a, fileBlob, loaderFactory, loader, _b, _c, _d, loader, _e, _f, _g, error_1;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        documents = [];
                        _i = 0, _a = this.fileBlobs;
                        _h.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        fileBlob = _a[_i];
                        loaderFactory = this.loaders[fileBlob.ext];
                        if (!loaderFactory) return [3 /*break*/, 3];
                        loader = loaderFactory(fileBlob.blob);
                        _c = (_b = documents.push).apply;
                        _d = [documents];
                        return [4 /*yield*/, loader.load()];
                    case 2:
                        _c.apply(_b, _d.concat([(_h.sent())]));
                        return [3 /*break*/, 7];
                    case 3:
                        loader = new text_1.TextLoader(fileBlob.blob);
                        _h.label = 4;
                    case 4:
                        _h.trys.push([4, 6, , 7]);
                        _f = (_e = documents.push).apply;
                        _g = [documents];
                        return [4 /*yield*/, loader.load()];
                    case 5:
                        _f.apply(_e, _g.concat([(_h.sent())]));
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _h.sent();
                        throw new Error("Error loading file");
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, documents];
                }
            });
        });
    };
    return MultiFileLoader;
}(base_1.BaseDocumentLoader));
module.exports = { nodeClass: File_DocumentLoaders };
