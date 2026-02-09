import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

app.get('/', (req, res) => {
    res.send('Finance Tracker API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app;
