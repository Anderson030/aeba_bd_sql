/* ===== Config ===== */
const API_BASE = 'http://localhost:4000';

/* ===== Navegación simple ===== */
document.addEventListener('click', (e) => {
  const a = e.target.closest('#app-nav .nav-link');
  if (!a) return;
  e.preventDefault();
  const target = a.getAttribute('data-target');
  document.querySelectorAll('.app-section').forEach(s => (s.style.display = 'none'));
  document.getElementById(target).style.display = 'block';
  document.querySelectorAll('#app-nav .nav-link').forEach(n => n.classList.remove('active'));
  a.classList.add('active');
});

/* ===== Helpers fetch ===== */
async function apiGet(path) {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiSend(path, method, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* -----------------------------------------------------------
   CLIENTS
----------------------------------------------------------- */
const $tblClients = document.querySelector('#tbl-clients tbody');

async function loadClients() {
  const data = await apiGet('/api/clients');
  $tblClients.innerHTML = data
    .map(
      (c) => `
    <tr>
      <td>${c.id}</td>
      <td>${c.first_name} ${c.last_name}</td>
      <td>${c.document ?? ''}</td>
      <td>${c.phone ?? ''}</td>
      <td>${c.email ?? ''}</td>
      <td>${c.birth_date ?? ''}</td>
      <td>
        <button data-edit-client="${c.id}">Editar</button>
        <button data-del-client="${c.id}">Borrar</button>
      </td>
    </tr>`
    )
    .join('');

  $tblClients
    .querySelectorAll('[data-del-client]')
    .forEach((b) => (b.onclick = () => delClient(b.dataset.delClient)));
  $tblClients
    .querySelectorAll('[data-edit-client]')
    .forEach((b) => (b.onclick = () => editClient(b.dataset.editClient)));
}

async function delClient(id) {
  if (!confirm('¿Eliminar cliente?')) return;
  await fetch(`${API_BASE}/api/clients/${id}`, { method: 'DELETE' });
  loadClients();
}

async function editClient(id) {
  const first_name = prompt('Nombre (deja vacío para no cambiar):');
  const last_name = prompt('Apellido (deja vacío para no cambiar):');
  const document = prompt('Documento (deja vacío para no cambiar):');
  const phone = prompt('Teléfono (opcional):');
  const email = prompt('Email (opcional):');
  const birth_date = prompt('Fecha nac. YYYY-MM-DD (opcional):');

  const payload = {};
  if (first_name) payload.first_name = first_name;
  if (last_name) payload.last_name = last_name;
  if (document) payload.document = document;
  if (phone) payload.phone = phone;
  if (email) payload.email = email;
  if (birth_date) payload.birth_date = birth_date;

  if (Object.keys(payload).length === 0) return;
  await apiSend(`/api/clients/${id}`, 'PUT', payload);
  loadClients();
}

document.getElementById('btn-add-client').onclick = async () => {
  const first_name = prompt('Nombre:');
  if (!first_name) return;
  const last_name = prompt('Apellido:');
  if (!last_name) return;
  const document = prompt('Documento:');
  if (!document) return;
  const phone = prompt('Teléfono (opcional):');
  const email = prompt('Email (opcional):');
  const birth_date = prompt('Fecha nac. YYYY-MM-DD (opcional):');

  await apiSend('/api/clients', 'POST', {
    first_name,
    last_name,
    document,
    phone,
    email,
    birth_date
  });
  loadClients();
};

/* -----------------------------------------------------------
   INVOICES  (listar desde invoices_summary)
----------------------------------------------------------- */
const $tblInvoices = document.querySelector('#tbl-invoices tbody');

async function loadInvoices() {
  const data = await apiGet('/api/invoices');
  $tblInvoices.innerHTML = data
    .map(
      (i) => `
    <tr>
      <td>${i.id}</td>
      <td>${i.invoice_number}</td>
      <td>${i.client_id}</td>
      <td>${i.issue_date}</td>
      <td>${i.due_date}</td>
      <td>${i.total_amount}</td>
      <td>${i.paid_amount}</td>
      <td>${i.balance}</td>
      <td>${i.status}</td>
      <td>
        <button data-edit-inv="${i.id}">Editar</button>
        <button data-del-inv="${i.id}">Borrar</button>
      </td>
    </tr>`
    )
    .join('');

  $tblInvoices
    .querySelectorAll('[data-del-inv]')
    .forEach((b) => (b.onclick = () => delInvoice(b.dataset.delInv)));
  $tblInvoices
    .querySelectorAll('[data-edit-inv]')
    .forEach((b) => (b.onclick = () => editInvoice(b.dataset.editInv)));
}

async function delInvoice(id) {
  if (!confirm('¿Eliminar factura?')) return;
  await fetch(`${API_BASE}/api/invoices/${id}`, { method: 'DELETE' });
  loadInvoices();
}

async function editInvoice(id) {
  const invoice_number = prompt('# Factura (opcional):');
  const client_id = prompt('Client ID (opcional):');
  const issue_date = prompt('Emisión YYYY-MM-DD (opcional):');
  const due_date = prompt('Vencimiento YYYY-MM-DD (opcional):');
  const total_amount = prompt('Total (opcional):');

  const payload = {};
  if (invoice_number) payload.invoice_number = invoice_number;
  if (client_id) payload.client_id = Number(client_id);
  if (issue_date) payload.issue_date = issue_date;
  if (due_date) payload.due_date = due_date;
  if (total_amount) payload.total_amount = Number(total_amount);

  if (Object.keys(payload).length === 0) return;
  await apiSend(`/api/invoices/${id}`, 'PUT', payload);
  loadInvoices();
}

document.getElementById('btn-add-invoice').onclick = async () => {
  const client_id = Number(prompt('Client ID:'));
  if (!client_id) return;
  const invoice_number = prompt('# Factura:');
  if (!invoice_number) return;
  const issue_date = prompt('Emisión YYYY-MM-DD:');
  if (!issue_date) return;
  const due_date = prompt('Vencimiento YYYY-MM-DD:');
  if (!due_date) return;
  const total_amount = Number(prompt('Total:'));
  if (!total_amount && total_amount !== 0) return;

  await apiSend('/api/invoices', 'POST', {
    client_id,
    invoice_number,
    issue_date,
    due_date,
    total_amount
  });
  loadInvoices();
};

/* -----------------------------------------------------------
   PAYMENTS
----------------------------------------------------------- */
const $tblPayments = document.querySelector('#tbl-payments tbody');

async function loadPayments() {
  const data = await apiGet('/api/payments');
  $tblPayments.innerHTML = data
    .map(
      (p) => `
    <tr>
      <td>${p.id}</td>
      <td>${p.invoice_id}</td>
      <td>${p.transaction_id ?? ''}</td>
      <td>${p.amount}</td>
      <td>${p.payment_date ?? ''}</td>
      <td>${p.method ?? ''}</td>
      <td>
        <button data-edit-pay="${p.id}">Editar</button>
        <button data-del-pay="${p.id}">Borrar</button>
      </td>
    </tr>`
    )
    .join('');

  $tblPayments
    .querySelectorAll('[data-del-pay]')
    .forEach((b) => (b.onclick = () => delPayment(b.dataset.delPay)));
  $tblPayments
    .querySelectorAll('[data-edit-pay]')
    .forEach((b) => (b.onclick = () => editPayment(b.dataset.editPay)));
}

async function delPayment(id) {
  if (!confirm('¿Eliminar pago?')) return;
  await fetch(`${API_BASE}/api/payments/${id}`, { method: 'DELETE' });
  loadPayments();
}

async function editPayment(id) {
  const invoice_id = prompt('Invoice ID (opcional):');
  const transaction_id = prompt('Transaction ID (opcional):');
  const amount = prompt('Monto (opcional):');
  const payment_date = prompt('Fecha pago YYYY-MM-DD (opcional):');
  const method = prompt('Método (opcional):');

  const payload = {};
  if (invoice_id) payload.invoice_id = Number(invoice_id);
  if (transaction_id !== null && transaction_id !== '') {
    payload.transaction_id = Number(transaction_id);
  }
  if (amount) payload.amount = Number(amount);
  if (payment_date) payload.payment_date = payment_date;
  if (method) payload.method = method;

  if (Object.keys(payload).length === 0) return;
  await apiSend(`/api/payments/${id}`, 'PUT', payload);
  loadPayments();
}

document.getElementById('btn-add-payment').onclick = async () => {
  const invoice_id = Number(prompt('Invoice ID:'));
  if (!invoice_id) return;
  const amount = Number(prompt('Monto:'));
  if (!amount) return;
  const payment_date = prompt('Fecha pago YYYY-MM-DD (opcional):');
  const method = prompt('Método (opcional):');
  const transaction_id = prompt('Transaction ID (opcional):');

  await apiSend('/api/payments', 'POST', {
    invoice_id,
    amount,
    payment_date: payment_date || null,
    method: method || null,
    transaction_id: transaction_id ? Number(transaction_id) : null
  });
  loadPayments();
};

/* -----------------------------------------------------------
   REPORTES
----------------------------------------------------------- */
const $reportOut = document.getElementById('report-output');

document.getElementById('btn-report-total-paid').onclick = async () => {
  const res = await apiGet('/api/reports/total-paid-by-client');
  $reportOut.textContent = JSON.stringify(res, null, 2);
};

document.getElementById('btn-report-pending').onclick = async () => {
  const res = await apiGet('/api/reports/pending-invoices');
  $reportOut.textContent = JSON.stringify(res, null, 2);
};

document.getElementById('btn-report-platform').onclick = async () => {
  const platform = document.getElementById('report-platform').value || 'Nequi';
  const res = await apiGet(`/api/reports/transactions-by-platform?platform=${encodeURIComponent(platform)}`);
  $reportOut.textContent = JSON.stringify(res, null, 2);
};

/* -----------------------------------------------------------
   IMPORT (CSV a /api/import/:entity con FormData)
----------------------------------------------------------- */
document.getElementById('form-import')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const entity = document.getElementById('import-entity').value;
  const fileEl = document.getElementById('import-file');
  const file = fileEl.files[0];

  if (!file) {
    document.getElementById('import-result').textContent = 'Selecciona un archivo CSV.';
    return;
  }

  const fd = new FormData();
  fd.append('file', file);

  try {
    const r = await fetch(`${API_BASE}/api/import/${encodeURIComponent(entity)}`, {
      method: 'POST',
      body: fd
    });
    const j = await r.json();
    document.getElementById('import-result').textContent = JSON.stringify(j, null, 2);

    // refrescar tablas si corresponde
    if (entity === 'clients') await loadClients();
    if (entity === 'invoices') await loadInvoices();
    if (entity === 'payments') await loadPayments();
  } catch (err) {
    document.getElementById('import-result').textContent = `Error: ${err.message}`;
  } finally {
    fileEl.value = '';
  }
});

/* ===== Carga inicial ===== */
function safe(fn) { try { fn(); } catch (_) {} }
safe(loadClients);
safe(loadInvoices);
safe(loadPayments);
