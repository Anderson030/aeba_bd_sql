import express from 'express';
import supabase from '../db.js';

const router = express.Router();

/* LISTAR (usa la vista) */
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('vw_citas_full')
    .select('*')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/* CREAR */
router.post('/', async (req, res) => {
  const { paciente_id, medico_id, fecha, hora, motivo } = req.body;
  if (!paciente_id || !medico_id || !fecha || !hora) {
    return res.status(400).json({ error: 'paciente_id, medico_id, fecha y hora son obligatorios' });
  }
  const { data, error } = await supabase
    .from('citas')
    .insert([{ paciente_id: Number(paciente_id), medico_id: Number(medico_id), fecha, hora, motivo }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/* ACTUALIZAR */
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  const { paciente_id, medico_id, fecha, hora, motivo } = req.body;
  const { data, error } = await supabase
    .from('citas')
    .update({
      paciente_id: paciente_id !== undefined ? Number(paciente_id) : undefined,
      medico_id:   medico_id   !== undefined ? Number(medico_id)   : undefined,
      fecha, hora, motivo
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/* ELIMINAR */
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  const { error } = await supabase.from('citas').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
