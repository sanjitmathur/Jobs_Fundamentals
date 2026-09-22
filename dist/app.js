"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Task API' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
