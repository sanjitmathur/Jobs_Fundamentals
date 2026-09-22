"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.getTaskById = getTaskById;
exports.updateTask = updateTask;
exports.updateTaskStatus = updateTaskStatus;
exports.deleteTask = deleteTask;
exports.getTasks = getTasks;
const client_1 = require("@prisma/client");
const db_1 = require("../utils/db");
const AppError_1 = require("../utils/AppError");
const storage_1 = require("../storage");
async function createTask(data, userId) {
    return db_1.prisma.task.create({
        data: {
            ...data,
            status: data.status ?? client_1.TaskStatus.PENDING,
            userId,
        },
    });
}
async function getTaskById(id) {
    return db_1.prisma.task.findUnique({ where: { id } });
}
async function updateTask(id, data, requesterId, requesterRole) {
    const task = await db_1.prisma.task.findUnique({ where: { id } });
    if (!task) {
        throw new AppError_1.AppError('Task not found', 404);
    }
    if (requesterRole !== client_1.Role.ADMIN && task.userId !== requesterId) {
        throw new AppError_1.AppError('You do not have permission to modify this task', 403);
    }
    return db_1.prisma.task.update({ where: { id }, data });
}
async function updateTaskStatus(id, status, requesterId, requesterRole) {
    const task = await db_1.prisma.task.findUnique({ where: { id } });
    if (!task) {
        throw new AppError_1.AppError('Task not found', 404);
    }
    if (requesterRole !== client_1.Role.ADMIN && task.userId !== requesterId) {
        throw new AppError_1.AppError('You do not have permission to modify this task', 403);
    }
    return db_1.prisma.task.update({ where: { id }, data: { status } });
}
async function deleteTask(id, requesterId, requesterRole) {
    const task = await db_1.prisma.task.findUnique({
        where: { id },
        include: { files: true },
    });
    if (!task) {
        throw new AppError_1.AppError('Task not found', 404);
    }
    if (requesterRole !== client_1.Role.ADMIN && task.userId !== requesterId) {
        throw new AppError_1.AppError('You do not have permission to delete this task', 403);
    }
    await db_1.prisma.task.delete({ where: { id } });
    if (task.files && Array.isArray(task.files) && task.files.length > 0) {
        const storage = (0, storage_1.getStorageProvider)();
        for (const file of task.files) {
            try {
                await storage.deleteFile(file.storageKey);
            }
            catch (err) {
                console.error(`Failed to delete physical file ${file.storageKey} from storage:`, err);
            }
        }
    }
}
async function getTasks(options) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;
    const where = {};
    if (options.userId) {
        where.userId = options.userId;
    }
    if (options.status && Object.values(client_1.TaskStatus).includes(options.status)) {
        where.status = options.status;
    }
    const tasks = await db_1.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
    });
    const total = await db_1.prisma.task.count({ where });
    return {
        data: tasks,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
