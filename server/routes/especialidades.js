import express from 'express';
import supabase from '../db.js';
const router = express.Router();

// LISTAR
router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('especialidades').select('*').order('id', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// CREAR
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });
  const { data, error } = await supabase.from('especialidades').insert([{ nombre }]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ACTUALIZAR
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nombre } = req.body;
  const { data, error } = await supabase.from('especialidades').update({ nombre }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('especialidades').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
