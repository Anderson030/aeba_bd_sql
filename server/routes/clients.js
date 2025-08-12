import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('clients').select('*').order('id', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { first_name, last_name, document, birth_date, phone, email } = req.body;
  if (!first_name || !last_name || !document) return res.status(400).json({ error: 'first_name, last_name and document are required' });
  const { data, error } = await supabase.from('clients').insert([{ first_name, last_name, document, birth_date, phone, email }]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { first_name, last_name, document, birth_date, phone, email } = req.body;
  const { data, error } = await supabase.from('clients').update({ first_name, last_name, document, birth_date, phone, email }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

export default router;
