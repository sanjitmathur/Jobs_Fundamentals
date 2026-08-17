"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
class TaskController {
    static async create(req, res, next) {
        try {
            const task = await task_service_1.TaskService.createTask(req.body);
            res.status(201).json(task);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOne(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const task = await task_service_1.TaskService.getTaskById(id);
            if (!task)
                return res.status(404).json({ error: 'Task not found' });
            res.json(task);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const task = await task_service_1.TaskService.updateTask(id, req.body);
            res.json(task);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const task = await task_service_1.TaskService.updateTaskStatus(id, req.body.status);
            res.json(task);
        }
        catch (error) {
            next(error);
        }
    }
    static async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const result = await task_service_1.TaskService.listTasks(page, limit, status);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TaskController = TaskController;
