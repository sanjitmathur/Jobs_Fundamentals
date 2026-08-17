"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatusSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const TaskStatusEnum = zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']);
exports.createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateTaskStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: TaskStatusEnum,
    }),
});
