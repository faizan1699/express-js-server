import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db/db.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});

