"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Record not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
};
exports.errorHandler = errorHandler;
