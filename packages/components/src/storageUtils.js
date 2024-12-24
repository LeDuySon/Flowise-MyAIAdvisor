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
exports.getS3Config = exports.streamStorageFile = exports.removeFolderFromStorage = exports.removeSpecificFileFromStorage = exports.removeFilesFromStorage = exports.getStorageType = exports.getStoragePath = exports.getFileFromStorage = exports.addSingleFileToStorage = exports.addArrayFilesToStorage = exports.addBase64FilesToStorage = void 0;
var path_1 = require("path");
var fs_1 = require("fs");
var client_s3_1 = require("@aws-sdk/client-s3");
var node_stream_1 = require("node:stream");
var utils_1 = require("./utils");
var sanitize_filename_1 = require("sanitize-filename");
var addBase64FilesToStorage = function (fileBase64, chatflowid, fileNames) { return __awaiter(void 0, void 0, void 0, function () {
    var storageType, _a, s3Client, Bucket, splitDataURI, filename, bf, mime_1, sanitizedFilename, Key, putObjCmd, dir, splitDataURI, filename, bf, sanitizedFilename, filePath;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                storageType = (0, exports.getStorageType)();
                if (!(storageType === 's3')) return [3 /*break*/, 2];
                _a = (0, exports.getS3Config)(), s3Client = _a.s3Client, Bucket = _a.Bucket;
                splitDataURI = fileBase64.split(',');
                filename = (_c = (_b = splitDataURI.pop()) === null || _b === void 0 ? void 0 : _b.split(':')[1]) !== null && _c !== void 0 ? _c : '';
                bf = Buffer.from(splitDataURI.pop() || '', 'base64');
                mime_1 = splitDataURI[0].split(':')[1].split(';')[0];
                sanitizedFilename = _sanitizeFilename(filename);
                Key = chatflowid + '/' + sanitizedFilename;
                putObjCmd = new client_s3_1.PutObjectCommand({
                    Bucket: Bucket,
                    Key: Key,
                    ContentEncoding: 'base64', // required for binary data
                    ContentType: mime_1,
                    Body: bf
                });
                return [4 /*yield*/, s3Client.send(putObjCmd)];
            case 1:
                _f.sent();
                fileNames.push(sanitizedFilename);
                return [2 /*return*/, 'FILE-STORAGE::' + JSON.stringify(fileNames)];
            case 2:
                dir = path_1.default.join((0, exports.getStoragePath)(), chatflowid);
                if (!fs_1.default.existsSync(dir)) {
                    fs_1.default.mkdirSync(dir, { recursive: true });
                }
                splitDataURI = fileBase64.split(',');
                filename = (_e = (_d = splitDataURI.pop()) === null || _d === void 0 ? void 0 : _d.split(':')[1]) !== null && _e !== void 0 ? _e : '';
                bf = Buffer.from(splitDataURI.pop() || '', 'base64');
                sanitizedFilename = _sanitizeFilename(filename);
                filePath = path_1.default.join(dir, sanitizedFilename);
                fs_1.default.writeFileSync(filePath, bf);
                fileNames.push(sanitizedFilename);
                return [2 /*return*/, 'FILE-STORAGE::' + JSON.stringify(fileNames)];
        }
    });
}); };
exports.addBase64FilesToStorage = addBase64FilesToStorage;
var addArrayFilesToStorage = function (mime, bf, fileName, fileNames) {
    var paths = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        paths[_i - 4] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var storageType, sanitizedFilename, _a, s3Client, Bucket, Key, putObjCmd, dir, filePath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    storageType = (0, exports.getStorageType)();
                    sanitizedFilename = _sanitizeFilename(fileName);
                    if (!(storageType === 's3')) return [3 /*break*/, 2];
                    _a = (0, exports.getS3Config)(), s3Client = _a.s3Client, Bucket = _a.Bucket;
                    Key = paths.reduce(function (acc, cur) { return acc + '/' + cur; }, '') + '/' + sanitizedFilename;
                    if (Key.startsWith('/')) {
                        Key = Key.substring(1);
                    }
                    putObjCmd = new client_s3_1.PutObjectCommand({
                        Bucket: Bucket,
                        Key: Key,
                        ContentEncoding: 'base64', // required for binary data
                        ContentType: mime,
                        Body: bf
                    });
                    return [4 /*yield*/, s3Client.send(putObjCmd)];
                case 1:
                    _b.sent();
                    fileNames.push(sanitizedFilename);
                    return [2 /*return*/, 'FILE-STORAGE::' + JSON.stringify(fileNames)];
                case 2:
                    dir = path_1.default.join.apply(path_1.default, __spreadArray([(0, exports.getStoragePath)()], paths, false));
                    if (!fs_1.default.existsSync(dir)) {
                        fs_1.default.mkdirSync(dir, { recursive: true });
                    }
                    filePath = path_1.default.join(dir, sanitizedFilename);
                    fs_1.default.writeFileSync(filePath, bf);
                    fileNames.push(sanitizedFilename);
                    return [2 /*return*/, 'FILE-STORAGE::' + JSON.stringify(fileNames)];
            }
        });
    });
};
exports.addArrayFilesToStorage = addArrayFilesToStorage;
var addSingleFileToStorage = function (mime, bf, fileName) {
    var paths = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        paths[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var storageType, sanitizedFilename, _a, s3Client, Bucket, Key, putObjCmd, dir, filePath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    storageType = (0, exports.getStorageType)();
                    sanitizedFilename = _sanitizeFilename(fileName);
                    if (!(storageType === 's3')) return [3 /*break*/, 2];
                    _a = (0, exports.getS3Config)(), s3Client = _a.s3Client, Bucket = _a.Bucket;
                    Key = paths.reduce(function (acc, cur) { return acc + '/' + cur; }, '') + '/' + sanitizedFilename;
                    if (Key.startsWith('/')) {
                        Key = Key.substring(1);
                    }
                    putObjCmd = new client_s3_1.PutObjectCommand({
                        Bucket: Bucket,
                        Key: Key,
                        ContentEncoding: 'base64', // required for binary data
                        ContentType: mime,
                        Body: bf
                    });
                    return [4 /*yield*/, s3Client.send(putObjCmd)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, 'FILE-STORAGE::' + sanitizedFilename];
                case 2:
                    dir = path_1.default.join.apply(path_1.default, __spreadArray([(0, exports.getStoragePath)()], paths, false));
                    if (!fs_1.default.existsSync(dir)) {
                        fs_1.default.mkdirSync(dir, { recursive: true });
                    }
                    filePath = path_1.default.join(dir, sanitizedFilename);
                    fs_1.default.writeFileSync(filePath, bf);
                    return [2 /*return*/, 'FILE-STORAGE::' + sanitizedFilename];
            }
        });
    });
};
exports.addSingleFileToStorage = addSingleFileToStorage;
var getFileFromStorage = function (file) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var storageType, _a, s3Client, Bucket, Key, getParams, response, body, streamToString, buffer, fileInStorage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    storageType = (0, exports.getStorageType)();
                    if (!(storageType === 's3')) return [3 /*break*/, 4];
                    _a = (0, exports.getS3Config)(), s3Client = _a.s3Client, Bucket = _a.Bucket;
                    Key = paths.reduce(function (acc, cur) { return acc + '/' + cur; }, '') + '/' + file;
                    if (Key.startsWith('/')) {
                        Key = Key.substring(1);
                    }
                    getParams = {
                        Bucket: Bucket,
                        Key: Key
                    };
                    return [4 /*yield*/, s3Client.send(new client_s3_1.GetObjectCommand(getParams))];
                case 1:
                    response = _b.sent();
                    body = response.Body;
                    if (!(body instanceof node_stream_1.Readable)) return [3 /*break*/, 3];
                    return [4 /*yield*/, body.transformToString('base64')];
                case 2:
                    streamToString = _b.sent();
                    if (streamToString) {
                        return [2 /*return*/, Buffer.from(streamToString, 'base64')];
                    }
                    _b.label = 3;
                case 3:
                    buffer = Buffer.concat(response.Body.toArray());
                    return [2 /*return*/, buffer];
                case 4:
                    fileInStorage = path_1.default.join.apply(path_1.default, __spreadArray(__spreadArray([(0, exports.getStoragePath)()], paths, false), [file], false));
                    return [2 /*return*/, fs_1.default.readFileSync(fileInStorage)];
            }
        });
    });
};
exports.getFileFromStorage = getFileFromStorage;
/**
 * Prepare storage path
 */
var getStoragePath = function () {
    return process.env.BLOB_STORAGE_PATH ? path_1.default.join(process.env.BLOB_STORAGE_PATH) : path_1.default.join((0, utils_1.getUserHome)(), '.flowise', 'storage');
};
exports.getStoragePath = getStoragePath;
/**
 * Get the storage type - local or s3
 */
var getStorageType = function () {
    return process.env.STORAGE_TYPE ? process.env.STORAGE_TYPE : 'local';
};
exports.getStorageType = getStorageType;
var removeFilesFromStorage = function () {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var storageType, Key, directory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    storageType = (0, exports.getStorageType)();
                    if (!(storageType === 's3')) return [3 /*break*/, 2];
                    Key = paths.reduce(function (acc, cur) { return acc + '/' + cur; }, '');
                    // remove the first '/' if it exists
                    if (Key.startsWith('/')) {
                        Key = Key.substring(1);
                    }
                    return [4 /*yield*/, _deleteS3Folder(Key)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    directory = path_1.default.join.apply(path_1.default, __spreadArray([(0, exports.getStoragePath)()], paths, false));
                    _deleteLocalFolderRecursive(directory);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.removeFilesFromStorage = removeFilesFromStorage;
var removeSpecificFileFromStorage = function () {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var storageType, Key, fileName, sanitizedFilename, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    storageType = (0, exports.getStorageType)();
                    if (!(storageType === 's3')) return [3 /*break*/, 2];
                    Key = paths.reduce(function (acc, cur) { return acc + '/' + cur; }, '');
                    // remove the first '/' if it exists
                    if (Key.startsWith('/')) {
                        Key = Key.substring(1);
                    }
                    return [4 /*yield*/, _deleteS3Folder(Key)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    fileName = paths.pop();
                    if (fileName) {
                        sanitizedFilename = _sanitizeFilename(fileName);
                        paths.push(sanitizedFilename);
                    }
                    file = path_1.default.join.apply(path_1.default, __spreadArray([(0, exports.getStoragePath)()], paths, false));
                    fs_1.default.unlinkSync(file);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.removeSpecificFileFromStorage = removeSpecificFileFromStorage;
var removeFolderFromStorage = function () {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var storageType, Key, directory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    storageType = (0, exports.getStorageType)();
                    if (!(storageType === 's3')) return [3 /*break*/, 2];
                    Key = paths.reduce(function (acc, cur) { return acc + '/' + cur; }, '');
                    // remove the first '/' if it exists
                    if (Key.startsWith('/')) {
                        Key = Key.substring(1);
                    }
                    return [4 /*yield*/, _deleteS3Folder(Key)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    directory = path_1.default.join.apply(path_1.default, __spreadArray([(0, exports.getStoragePath)()], paths, false));
                    _deleteLocalFolderRecursive(directory, true);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.removeFolderFromStorage = removeFolderFromStorage;
var _deleteLocalFolderRecursive = function (directory, deleteParentChatflowFolder) {
    // Console error here as failing is not destructive operation
    if (fs_1.default.existsSync(directory)) {
        if (deleteParentChatflowFolder) {
            fs_1.default.rmSync(directory, { recursive: true, force: true });
        }
        else {
            fs_1.default.readdir(directory, function (error, files) {
                if (error)
                    console.error('Could not read directory');
                var _loop_1 = function (i) {
                    var file = files[i];
                    var file_path = path_1.default.join(directory, file);
                    fs_1.default.stat(file_path, function (error, stat) {
                        if (error)
                            console.error('File do not exist');
                        if (!stat.isDirectory()) {
                            fs_1.default.unlink(file_path, function (error) {
                                if (error)
                                    console.error('Could not delete file');
                            });
                            if (i === files.length - 1) {
                                fs_1.default.rmSync(directory, { recursive: true, force: true });
                            }
                        }
                        else {
                            _deleteLocalFolderRecursive(file_path);
                        }
                    });
                };
                for (var i = 0; i < files.length; i++) {
                    _loop_1(i);
                }
            });
        }
    }
};
var _deleteS3Folder = function (location) { return __awaiter(void 0, void 0, void 0, function () {
    function recursiveS3Delete(token) {
        return __awaiter(this, void 0, void 0, function () {
            var listCommand, list, deleteCommand, deleted;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        listCommand = new client_s3_1.ListObjectsV2Command({
                            Bucket: Bucket,
                            Prefix: location,
                            ContinuationToken: token
                        });
                        return [4 /*yield*/, s3Client.send(listCommand)];
                    case 1:
                        list = _b.sent();
                        if (!list.KeyCount) return [3 /*break*/, 3];
                        deleteCommand = new client_s3_1.DeleteObjectsCommand({
                            Bucket: Bucket,
                            Delete: {
                                Objects: (_a = list.Contents) === null || _a === void 0 ? void 0 : _a.map(function (item) { return ({ Key: item.Key }); }),
                                Quiet: false
                            }
                        });
                        return [4 /*yield*/, s3Client.send(deleteCommand)
                            // @ts-ignore
                        ];
                    case 2:
                        deleted = _b.sent();
                        // @ts-ignore
                        count += deleted.Deleted.length;
                        if (deleted.Errors) {
                            deleted.Errors.map(function (error) { return console.error("".concat(error.Key, " could not be deleted - ").concat(error.Code)); });
                        }
                        _b.label = 3;
                    case 3:
                        if (!list.NextContinuationToken) return [3 /*break*/, 5];
                        return [4 /*yield*/, recursiveS3Delete(list.NextContinuationToken)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: 
                    // return total deleted count when finished
                    return [2 /*return*/, "".concat(count, " files deleted from S3")];
                }
            });
        });
    }
    var count, _a, s3Client, Bucket;
    return __generator(this, function (_b) {
        count = 0 // number of files deleted
        ;
        _a = (0, exports.getS3Config)(), s3Client = _a.s3Client, Bucket = _a.Bucket;
        // start the recursive function
        return [2 /*return*/, recursiveS3Delete()];
    });
}); };
var streamStorageFile = function (chatflowId, chatId, fileName) { return __awaiter(void 0, void 0, void 0, function () {
    var storageType, sanitizedFilename, _a, s3Client, Bucket, Key, getParams, response, body, blob, filePath;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                storageType = (0, exports.getStorageType)();
                sanitizedFilename = (0, sanitize_filename_1.default)(fileName);
                if (!(storageType === 's3')) return [3 /*break*/, 4];
                _a = (0, exports.getS3Config)(), s3Client = _a.s3Client, Bucket = _a.Bucket;
                Key = chatflowId + '/' + chatId + '/' + sanitizedFilename;
                getParams = {
                    Bucket: Bucket,
                    Key: Key
                };
                return [4 /*yield*/, s3Client.send(new client_s3_1.GetObjectCommand(getParams))];
            case 1:
                response = _b.sent();
                body = response.Body;
                if (!(body instanceof node_stream_1.Readable)) return [3 /*break*/, 3];
                return [4 /*yield*/, body.transformToByteArray()];
            case 2:
                blob = _b.sent();
                return [2 /*return*/, Buffer.from(blob)];
            case 3: return [3 /*break*/, 5];
            case 4:
                filePath = path_1.default.join((0, exports.getStoragePath)(), chatflowId, chatId, sanitizedFilename);
                //raise error if file path is not absolute
                if (!path_1.default.isAbsolute(filePath))
                    throw new Error("Invalid file path");
                //raise error if file path contains '..'
                if (filePath.includes('..'))
                    throw new Error("Invalid file path");
                //only return from the storage folder
                if (!filePath.startsWith((0, exports.getStoragePath)()))
                    throw new Error("Invalid file path");
                if (fs_1.default.existsSync(filePath)) {
                    return [2 /*return*/, fs_1.default.createReadStream(filePath)];
                }
                else {
                    throw new Error("File ".concat(fileName, " not found"));
                }
                _b.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.streamStorageFile = streamStorageFile;
var getS3Config = function () {
    var accessKeyId = process.env.S3_STORAGE_ACCESS_KEY_ID;
    var secretAccessKey = process.env.S3_STORAGE_SECRET_ACCESS_KEY;
    var region = process.env.S3_STORAGE_REGION;
    var Bucket = process.env.S3_STORAGE_BUCKET_NAME;
    var customURL = process.env.S3_ENDPOINT_URL;
    var forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true' ? true : false;
    if (!region || !Bucket) {
        throw new Error('S3 storage configuration is missing');
    }
    var credentials;
    if (accessKeyId && secretAccessKey) {
        credentials = {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        };
    }
    var s3Client = new client_s3_1.S3Client({
        credentials: credentials,
        region: region,
        endpoint: customURL,
        forcePathStyle: forcePathStyle
    });
    return { s3Client: s3Client, Bucket: Bucket };
};
exports.getS3Config = getS3Config;
var _sanitizeFilename = function (filename) {
    if (filename) {
        var sanitizedFilename = (0, sanitize_filename_1.default)(filename);
        // remove all leading .
        return sanitizedFilename.replace(/^\.+/, '');
    }
    return '';
};
