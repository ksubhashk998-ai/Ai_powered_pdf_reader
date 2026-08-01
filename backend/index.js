import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const INITIAL_PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MindCraft AI Backend Server',
    timestamp: new Date().toISOString()
  });
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 MindCraft AI Backend Server running on port ${port}`);
    console.log(`➜ Health Check: http://localhost:${port}/health`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(INITIAL_PORT);
