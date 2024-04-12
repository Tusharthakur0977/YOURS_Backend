import express from 'express';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import connectToPrisma from './config/db';
import UserRoutes from './routes/UserRoutes';
import * as dotenv from 'dotenv'

dotenv.config();

const prisma = new PrismaClient();
const port = process.env.PORT;

connectToPrisma();

const app = express();
app.use(express.json());

app.use('/api', UserRoutes);

const server = app.listen(port, () => {
  console.log(`server running at "http://localhost:${port}" `);
});

app.use("/static", express.static(path.join(__dirname, 'static')));

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
  });
});
