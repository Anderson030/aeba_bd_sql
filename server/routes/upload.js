import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';
import supabase from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Valida columnas mínimas por entidad
const REQUIRED = {
  pacientes: ['nombre','apellido','fecha_nacimiento','telefono','email'],
  especialidades: ['nombre'],
  medicos: ['nombre','apellido','especialidad_id','email','telefono'],
  citas: ['paciente_id','medico_id','fecha','hora','motivo'],
  pagos: ['cita_id','monto','fecha_pago','metodo'],
};

function readRowsFromBuffer(buffer, filename) {
  const isCsv = filename.toLowerCase().endsWith('.csv');
  if (isCsv) {
    return parse(buffer.toString('utf8'), { columns: true, skip_empty_lines: true, trim: true });
  }
  // XLSX
  const wb = xlsx.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return xlsx.utils.sheet_to_json(ws, { defval: null });
}

router.post('/:entity', upload.single('file'), async (req, res) => {
  try {
    const entity = req.params.entity;
    if (!REQUIRED[entity]) return res.status(400).json({ error: 'Entidad no soportada' });
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido (file)' });

    const rows = readRowsFromBuffer(req.file.buffer, req.file.originalname);
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'Archivo vacío' });

    // Valida encabezados
    const headers = Object.keys(rows[0]).map(h => h.trim());
    const faltantes = REQUIRED[entity].filter(col => !headers.includes(col));
    if (faltantes.length) {
      return res.status(400).json({ error: `Faltan columnas: ${faltantes.join(', ')}` });
    }

    // Limpia y castea tipos básicos
    const sanitized = rows.map(r => {
      const x = { ...r };
      // casteos típicos por entidad
      if (entity === 'medicos') x.especialidad_id = Number(x.especialidad_id);
      if (entity === 'citas') {
        x.paciente_id = Number(x.paciente_id);
        x.medico_id = Number(x.medico_id);
      }
      if (entity === 'pagos') {
        x.cita_id = Number(x.cita_id);
        x.monto = Number(x.monto);
      }
      return x;
    });

    // Inserción por entidad
    const { data, error } = await supabase.from(entity).insert(sanitized).select();
    if (error) return res.status(400).json({ error: error.message });

    res.json({ ok: true, inserted: data.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error procesando archivo' });
  }
});

export default router;
