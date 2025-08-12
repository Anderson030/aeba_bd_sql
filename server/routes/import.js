import { Router } from 'express';
import multer from 'multer';
import { parse as parseCsv } from 'csv-parse/sync';
import supabase from '../db.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function readCsvToRecords(buf) {
  return parseCsv(buf.toString('utf8'), { columns: true, skip_empty_lines: true, trim: true });
}

async function chunkInsert(table, rows, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw new Error(`${table} insert error: ${error.message}`);
  }
}

router.post('/:entity', upload.single('file'), async (req, res) => {
  try {
    const { entity } = req.params;
    if (!req.file) return res.status(400).json({ error: 'CSV file (file) is required' });

    const rows = readCsvToRecords(req.file.buffer);
    if (!rows.length) return res.json({ imported: 0, message: 'CSV vacío' });

    if (entity === 'clients') {
      const mapped = rows.map(r => ({
        first_name: r.first_name ?? r.nombre ?? null,
        last_name:  r.last_name  ?? r.apellido ?? null,
        document:   r.document   ?? r.documento ?? null,
        birth_date: r.birth_date ?? r.fecha_nacimiento ?? null,
        phone:      r.phone ?? r.telefono ?? null,
        email:      r.email ?? null
      }));
      await chunkInsert('clients', mapped);
      return res.json({ imported: mapped.length });
    }

    if (entity === 'invoices') {
      const mapped = rows.map(r => ({
        client_id: Number(r.client_id ?? r.cliente_id),
        invoice_number: r.invoice_number ?? r.nro_factura ?? r.factura,
        issue_date: r.issue_date ?? r.fecha_emision ?? r.fecha,
        due_date:   r.due_date   ?? r.fecha_vencimiento ?? r.vencimiento ?? r.fecha,
        total_amount: Number(r.total_amount ?? r.total ?? r.monto ?? 0)
      }));
      await chunkInsert('invoices', mapped);
      return res.json({ imported: mapped.length });
    }

    if (entity === 'platforms') {
      const mapped = rows.map(r => ({ name: r.name ?? r.platform ?? r.plataforma })).filter(x => x.name);
      await chunkInsert('platforms', mapped);
      return res.json({ imported: mapped.length });
    }

    if (entity === 'transactions') {
      const mapped = rows.map(r => ({
        platform_id: Number(r.platform_id),
        reference: r.reference ?? r.referencia,
        transaction_date: r.transaction_date ?? r.fecha ?? r.fecha_transaccion,
        amount: Number(r.amount ?? r.monto ?? 0),
        raw_memo: r.raw_memo ?? r.memo ?? r.descripcion ?? null
      }));
      await chunkInsert('transactions', mapped);
      return res.json({ imported: mapped.length });
    }

    if (entity === 'payments') {
      const mapped = rows.map(r => ({
        invoice_id: Number(r.invoice_id),
        transaction_id: r.transaction_id ? Number(r.transaction_id) : null,
        amount: Number(r.amount ?? r.monto ?? 0),
        payment_date: r.payment_date ?? r.fecha_pago ?? null,
        method: r.method ?? r.metodo ?? null
      }));
      const bad = mapped.filter(x => !x.invoice_id || !(x.amount > 0));
      if (bad.length) return res.status(400).json({ error: 'invoice_id y amount>0 son requeridos' });
      await chunkInsert('payments', mapped);
      return res.json({ imported: mapped.length });
    }

    return res.status(400).json({ error: `Entidad no soportada: ${entity}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
