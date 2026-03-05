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
exports.getAllProjects = exports.getProjectById = exports.createProject = void 0;
var prisma_ts_1 = require("../lib/prisma.ts");
var asyncHandler_ts_1 = require("../utils/asyncHandler.ts");
exports.createProject = (0, asyncHandler_ts_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, description, github, userId, project;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, name = _a.name, description = _a.description, github = _a.github;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                // console.log(`UserID::::::::::::: ${userId}`);
                if (!name || !description || !github) {
                    return [2 /*return*/, res.status(400).json({ message: 'Please provide all required fields', success: false })];
                }
                return [4 /*yield*/, prisma_ts_1.prisma.project.create({
                        data: {
                            name: name,
                            description: description,
                            repoUrl: github,
                            user: {
                                connect: {
                                    id: userId
                                }
                            }
                        },
                    })];
            case 1:
                project = _c.sent();
                res.status(201).json({ project: project, success: true });
                return [2 /*return*/];
        }
    });
}); });
exports.getProjectById = (0, asyncHandler_ts_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, project;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                projectId = req.params.id;
                return [4 /*yield*/, prisma_ts_1.prisma.project.findUnique({
                        where: { id: String(projectId) },
                        include: {
                            scans: true,
                        },
                    })];
            case 1:
                project = _a.sent();
                if (!project) {
                    return [2 /*return*/, res.status(404).json({ message: 'Project not found', success: false })];
                }
                res.status(200).json({ project: project, success: true });
                return [2 /*return*/];
        }
    });
}); });
exports.getAllProjects = (0, asyncHandler_ts_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, projects;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, prisma_ts_1.prisma.project.findMany({
                        where: { userId: userId },
                        include: {
                            scans: true,
                        }
                    })];
            case 1:
                projects = _b.sent();
                res.status(200).json({ projects: projects, success: true });
                return [2 /*return*/];
        }
    });
}); });
