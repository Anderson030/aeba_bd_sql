import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// LISTAR
router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('pacientes').select('*').order('id', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// CREAR
router.post('/', async (req, res) => {
  const { nombre, apellido, fecha_nacimiento, telefono, email } = req.body;
  if (!nombre || !apellido || !fecha_nacimiento) {
    return res.status(400).json({ error: 'nombre, apellido y fecha_nacimiento son obligatorios' });
  }
  const { data, error } = await supabase
    .from('pacientes')
    .insert([{ nombre, apellido, fecha_nacimiento, telefono, email }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ACTUALIZAR
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  const { nombre, apellido, fecha_nacimiento, telefono, email } = req.body;
  const { data, error } = await supabase
    .from('pacientes')
    .update({ nombre, apellido, fecha_nacimiento, telefono, email })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  const { error } = await supabase.from('pacientes').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
