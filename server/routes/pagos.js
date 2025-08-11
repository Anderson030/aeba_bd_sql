import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// LISTAR
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .order('fecha_pago', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// CREAR
router.post('/', async (req, res) => {
  const { cita_id, monto, fecha_pago, metodo } = req.body;
  if (!cita_id || !monto || !fecha_pago) {
    return res.status(400).json({ error: 'cita_id, monto y fecha_pago son obligatorios' });
  }
  const { data, error } = await supabase
    .from('pagos')
    .insert([{ cita_id: Number(cita_id), monto: Number(monto), fecha_pago, metodo }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ACTUALIZAR
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { cita_id, monto, fecha_pago, metodo } = req.body;
  const { data, error } = await supabase
    .from('pagos')
    .update({
      cita_id: cita_id !== undefined ? Number(cita_id) : undefined,
      monto: monto !== undefined ? Number(monto) : undefined,
      fecha_pago,
      metodo
    })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('pagos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
