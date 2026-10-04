import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db/db.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.get('/', (req, res) => {
  res.send('Hello, World!');    
});

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

