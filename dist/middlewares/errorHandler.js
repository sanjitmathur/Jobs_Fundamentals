"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, _req, res, _next) => {
    if (res.headersSent) {
        return _next(err);
    }
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    if (err.name === 'MulterError') {
        res.status(400).json({
            success: false,
            message: err.message,
        });
        return;
    }
    console.error(err.stack);
    const errObj = err;
    const causeObj = errObj.cause;
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message,
        cause: causeObj?.message,
        code: errObj.code,
        meta: errObj.meta,
    });
};
exports.errorHandler = errorHandler;
