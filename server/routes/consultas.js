import express from 'express';
import supabase from '../db.js';

const router = express.Router();

/**
 * 1) Citas “full” con paciente, médico y especialidad
 *    Filtros opcionales: ?medico_id=1&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 */
router.get('/citas-full', async (req, res) => {
  try {
    const { medico_id, desde, hasta } = req.query;

    let query = supabase
      .from('citas')
      .select(`
        id, fecha, hora, motivo,
        paciente_id,
        medico_id,
        paciente:paciente_id ( id, nombre, apellido ),
        medico:medico_id (
          id, nombre, apellido, especialidad_id,
          especialidades:especialidad_id ( nombre )
        )
      `)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (medico_id) query = query.eq('medico_id', Number(medico_id));
    if (desde)     query = query.gte('fecha', desde);
    if (hasta)     query = query.lte('fecha', hasta);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const out = (data || []).map(c => ({
      id: c.id,
      fecha: c.fecha,
      hora: c.hora,
      motivo: c.motivo,
      paciente_id: c.paciente_id,
      medico_id: c.medico_id,
      paciente: c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : null,
      medico: c.medico ? `${c.medico.nombre} ${c.medico.apellido}` : null,
      especialidad: c.medico?.especialidades?.nombre || null
    }));

    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener citas-full' });
  }
});

/**
 * 2) Pacientes con más de 3 citas registradas
 *    (Agregamos en Node para evitar crear una función SQL)
 */
router.get('/pacientes-mas-3', async (_req, res) => {
  try {
    const [{ data: citas, error: e1 }, { data: pacientes, error: e2 }] = await Promise.all([
      supabase.from('citas').select('id, paciente_id'),
      supabase.from('pacientes').select('id, nombre, apellido, documento')
    ]);
    if (e1) return res.status(400).json({ error: e1.message });
    if (e2) return res.status(400).json({ error: e2.message });

    const cuenta = new Map();
    (citas || []).forEach(c => cuenta.set(c.paciente_id, (cuenta.get(c.paciente_id) || 0) + 1));

    const out = [];
    for (const [paciente_id, total] of cuenta) {
      if (total > 3) {
        const p = pacientes.find(x => x.id === paciente_id);
        out.push({
          paciente_id,
          paciente: p ? `${p.nombre} ${p.apellido}` : `#${paciente_id}`,
          documento: p?.documento || null,
          total_citas: total
        });
      }
    }
    out.sort((a,b)=> b.total_citas - a.total_citas);
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener pacientes con >3 citas' });
  }
});

/**
 * 3) Médicos con número de citas en los últimos 30 días
 *    (tu tabla `citas` no tiene status; contamos todas en el rango)
 */
router.get('/medicos-ultimo-mes', async (_req, res) => {
  try {
    const hoy = new Date();
    const desde = new Date(hoy.getTime() - 30*24*60*60*1000);
    const desdeStr = desde.toISOString().slice(0,10);

    const [{ data: citas, error: e1 }, { data: medicos, error: e2 }] = await Promise.all([
      supabase.from('citas').select('id, medico_id, fecha').gte('fecha', desdeStr),
      supabase.from('medicos').select('id, nombre, apellido')
    ]);
    if (e1) return res.status(400).json({ error: e1.message });
    if (e2) return res.status(400).json({ error: e2.message });

    const cuenta = new Map();
    (citas || []).forEach(c => cuenta.set(c.medico_id, (cuenta.get(c.medico_id) || 0) + 1));

    const out = [];
    for (const [medico_id, total] of cuenta) {
      const m = medicos.find(x => x.id === medico_id);
      out.push({
        medico_id,
        medico: m ? `${m.nombre} ${m.apellido}` : `#${medico_id}`,
        citas_30dias: total
      });
    }
    out.sort((a,b)=> b.citas_30dias - a.citas_30dias);
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener médicos último mes' });
  }
});

/**
 * 4) Ingresos por método de pago en un rango de fechas
 *    Requiere columna pagos.metodo (text). Si no la tienes aún:
 *    ALTER TABLE pagos ADD COLUMN IF NOT EXISTS metodo text;
 *    Parámetros: ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 */
router.get('/ingresos', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Enviar ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD' });
    }
    const { data, error } = await supabase
      .from('pagos')
      .select('monto, metodo, fecha_pago')
      .gte('fecha_pago', desde)
      .lte('fecha_pago', hasta);

    if (error) return res.status(400).json({ error: error.message });

    // Agrupar en Node por método
    const totales = {};
    (data || []).forEach(p => {
      const key = p.metodo || 'SIN_METODO';
      totales[key] = (totales[key] || 0) + Number(p.monto || 0);
    });

    const out = Object.entries(totales).map(([metodo, total]) => ({ metodo, total }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al calcular ingresos' });
  }
});

export default router;
