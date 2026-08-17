import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
	res.status(200).json({ status: 'ok', message: 'Task API' });
});

app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

export default app;
