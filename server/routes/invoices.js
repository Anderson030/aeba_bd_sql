import express from 'express';
import supabase from '../db.js';

const router = express.Router();

/* LISTAR desde la vista con totales/estado */
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('invoices_summary')
    .select('*')
    .order('issue_date', { ascending: false })
    .order('id', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/* OBTENER por ID (vista) */
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

  const { data, error } = await supabase
    .from('invoices_summary')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
});

/* CREAR */
router.post('/', async (req, res) => {
  const { client_id, invoice_number, issue_date, due_date, total_amount } = req.body;

  if (
    !client_id ||
    !invoice_number ||
    !issue_date ||
    !due_date ||
    total_amount === undefined
  ) {
    return res.status(400).json({
      error: 'client_id, invoice_number, issue_date, due_date, total_amount are required'
    });
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert([{ client_id, invoice_number, issue_date, due_date, total_amount }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

/* ACTUALIZAR */
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

  const { client_id, invoice_number, issue_date, due_date, total_amount } = req.body;

  const payload = {
    ...(client_id !== undefined && { client_id }),
    ...(invoice_number !== undefined && { invoice_number }),
    ...(issue_date !== undefined && { issue_date }),
    ...(due_date !== undefined && { due_date }),
    ...(total_amount !== undefined && { total_amount })
  };

  const { data, error } = await supabase
    .from('invoices')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
});

/* ELIMINAR */
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

export default router;
