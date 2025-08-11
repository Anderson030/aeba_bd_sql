import express from 'express';
import supabase from '../db.js';
const router = express.Router();

// LISTAR (con nombre de especialidad)
router.get('/', async (_req, res) => {
  // traemos todo y luego resolvemos el nombre de especialidad con un RPC simple
  const { data, error } = await supabase.from('medicos')
    .select('id,nombre,apellido,email,telefono,especialidad_id')
    .order('id', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// CREAR
router.post('/', async (req, res) => {
  const { nombre, apellido, especialidad_id, email, telefono } = req.body;
  if (!nombre || !apellido || !especialidad_id) {
    return res.status(400).json({ error: 'nombre, apellido y especialidad_id son obligatorios' });
  }
  const { data, error } = await supabase.from('medicos')
    .insert([{ nombre, apellido, especialidad_id: Number(especialidad_id), email, telefono }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ACTUALIZAR
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, apellido, especialidad_id, email, telefono } = req.body;
  const { data, error } = await supabase.from('medicos')
    .update({ nombre, apellido, especialidad_id, email, telefono })
    .eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('medicos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
