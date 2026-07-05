import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { sequelize } from './src/models/index.js'
import authRoutes from './src/routes/auth.routes.js'
import jobRoutes from './src/routes/job.routes.js'
import authMiddleware from './src/middleware/auth.middleware.js'
import userRoutes from './src/routes/user.routes.js'



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/jobs', authMiddleware, jobRoutes)
app.use('/api/users', userRoutes)
 

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})


sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database tables synced')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => console.error('❌ Sync failed:', err.message))
