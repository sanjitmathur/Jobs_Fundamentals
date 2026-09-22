"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = exports.remove = exports.updateStatus = exports.update = exports.getOne = exports.list = exports.create = void 0;
const TaskService = __importStar(require("../services/task.service"));
const create = async (req, res, next) => {
    try {
        const task = await TaskService.createTask(req.body, req.user.userId);
        res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const list = async (req, res, next) => {
    try {
        const { status, page, limit, all } = req.query;
        const isUserAdmin = req.user?.role === 'ADMIN';
        const shouldFetchAll = isUserAdmin && all === 'true';
        const tasks = await TaskService.getTasks({
            status: status,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            userId: shouldFetchAll ? undefined : req.user.userId,
        });
        res.status(200).json(tasks);
    }
    catch (error) {
        next(error);
    }
};
exports.list = list;
const getOne = async (req, res, next) => {
    try {
        const task = await TaskService.getTaskById(req.params.id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        if (req.user.role !== 'ADMIN' && task.userId !== req.user.userId) {
            res.status(403).json({ message: 'You do not have permission to view this task' });
            return;
        }
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        const task = await TaskService.updateTask(req.params.id, req.body, req.user.userId, req.user.role);
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const task = await TaskService.updateTaskStatus(req.params.id, status, req.user.userId, req.user.role);
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
const remove = async (req, res, next) => {
    try {
        await TaskService.deleteTask(req.params.id, req.user.userId, req.user.role);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
exports.TaskController = {
    create: exports.create,
    list: exports.list,
    getOne: exports.getOne,
    update: exports.update,
    updateStatus: exports.updateStatus,
    remove: exports.remove,
};
