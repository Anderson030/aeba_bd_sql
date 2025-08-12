import express from 'express';
import supabase from '../db.js';

const router = express.Router();

/* Helper paginación */
function applyRange(q, limit, offset) {
  const l = Number.isFinite(+limit) ? Math.max(1, +limit) : 100;
  const o = Number.isFinite(+offset) ? Math.max(0, +offset) : 0;
  return q.range(o, o + l - 1);
}

/* 1) Total pagado por cliente */
router.get('/total-paid-by-client', async (req, res) => {
  let q = supabase
    .from('v_total_paid_by_client')
    .select('*', { count: 'exact' })
    .order('total_paid', { ascending: false })
    .order('id', { ascending: true });

  q = applyRange(q, req.query.limit, req.query.offset);

  const { data, error, count } = await q;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ count, data });
});

/* 2) Facturas pendientes */
router.get('/pending-invoices', async (req, res) => {
  let q = supabase
    .from('v_pending_invoices')
    .select('*', { count: 'exact' })
    .order('due_date', { ascending: true })
    .order('invoice_id', { ascending: true });

  q = applyRange(q, req.query.limit, req.query.offset);

  const { data, error, count } = await q;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ count, data });
});

/* 3) Transacciones por plataforma (?platform=Nequi) */
router.get('/transactions-by-platform', async (req, res) => {
  const platform = req.query.platform || 'Nequi';
  const { data, error } = await supabase.rpc('fn_transactions_by_platform', {
    p_platform: platform
  });
  if (error) return res.status(400).json({ error: error.message });

  // paginación en memoria para RPC
  const limit = Number.isFinite(+req.query.limit) ? Math.max(1, +req.query.limit) : data.length;
  const offset = Number.isFinite(+req.query.offset) ? Math.max(0, +req.query.offset) : 0;
  const sliced = data.slice(offset, offset + limit);

  res.json({ count: data.length, data: sliced });
});

export default router;
