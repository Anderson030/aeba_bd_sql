import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import pacientesRoutes from './routes/pacientes.js';
import especialidadesRoutes from './routes/especialidades.js';
import medicosRoutes from './routes/medicos.js';
import citasRoutes from './routes/citas.js';
import consultasRoutes from './routes/consultas.js';
import pagosRoutes from './routes/pagos.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/pacientes', pacientesRoutes);
app.use('/especialidades', especialidadesRoutes);
app.use('/medicos', medicosRoutes);
app.use('/citas', citasRoutes);
app.use('/pagos', pagosRoutes);
app.use('/consultas', consultasRoutes);
app.use('/upload', uploadRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


