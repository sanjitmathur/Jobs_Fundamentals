"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const db_1 = require("../utils/db");
class TaskService {
    static async createTask(data) {
        return db_1.prisma.task.create({ data });
    }
    static async getTaskById(id) {
        return db_1.prisma.task.findUnique({ where: { id } });
    }
    static async updateTask(id, data) {
        return db_1.prisma.task.update({ where: { id }, data });
    }
    static async updateTaskStatus(id, status) {
        return db_1.prisma.task.update({ where: { id }, data: { status } });
    }
    static async listTasks(page, limit, status) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};
        const [tasks, total] = await Promise.all([
            db_1.prisma.task.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            db_1.prisma.task.count({ where })
        ]);
        return {
            data: tasks,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }
}
exports.TaskService = TaskService;
