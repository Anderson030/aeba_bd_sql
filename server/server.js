// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// === Rutas nuevas (dominio financiero) ===
import clientsRoutes from './routes/clients.js';
import invoicesRoutes from './routes/invoices.js';
import paymentsRoutes from './routes/payments.js';
import reportsRoutes from './routes/reports.js';
import importRoutes from './routes/import.js'; 



const app = express();

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());

// ---------- Frontend estático ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../web')));

// ---------- Healthcheck ----------
app.get('/health', (_req, res) => res.json({ ok: true }));

// ---------- API (nuevo prefijo) ----------
app.use('/api/clients', clientsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/import', importRoutes); // quita esta línea si no usarás el import



// ---------- Alias de compatibilidad (antiguas rutas) ----------
app.use('/pacientes', clientsRoutes);
app.use('/citas', invoicesRoutes);
app.use('/pagos', paymentsRoutes);

// ---------- Fallback: sirve index.html ----------
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// ---------- 404 ----------
app.use((req, res, _next) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------- Manejador de errores ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------- Arranque ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
