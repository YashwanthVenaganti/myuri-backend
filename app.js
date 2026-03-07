import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Myura Wellness Backend Running'));

app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;