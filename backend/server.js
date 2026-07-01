import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./src/config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());


const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
   
    console.log(`Server is running on port ${PORT}`);
});

testConnection();
