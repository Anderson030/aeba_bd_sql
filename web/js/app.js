const API_BASE = 'http://localhost:4000';

// Navegación simple
document.addEventListener('click', (e) => {
  const a = e.target.closest('#app-nav .nav-link');
  if (!a) return;
  e.preventDefault();
  const target = a.getAttribute('data-target');
  document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');
  document.getElementById(target).style.display = 'block';
  document.querySelectorAll('#app-nav .nav-link').forEach(n => n.classList.remove('active'));
  a.classList.add('active');
});

// Helpers fetch
async function apiGet(path){ const r=await fetch(`${API_BASE}${path}`); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiSend(path,method,body){ const r=await fetch(`${API_BASE}${path}`,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})}); if(!r.ok) throw new Error(await r.text()); return r.json(); }

/* ===== PACIENTES ===== */
const $tblPac = document.querySelector('#tbl-pacientes tbody');
async function loadPacientes(){
  const data = await apiGet('/pacientes');
  $tblPac.innerHTML = data.map(p=>`
    <tr>
      <td>${p.id}</td><td>${p.nombre}</td><td>${p.apellido}</td>
      <td>${p.fecha_nacimiento||''}</td><td>${p.telefono||''}</td><td>${p.email||''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-edit-p="${p.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger"  data-del-p="${p.id}">Borrar</button>
      </td>
    </tr>`).join('');
  $tblPac.querySelectorAll('[data-del-p]').forEach(b=>b.onclick=()=>delPaciente(b.dataset.delP));
  $tblPac.querySelectorAll('[data-edit-p]').forEach(b=>b.onclick=()=>editPaciente(b.dataset.editP));
}
async function delPaciente(id){ if(!confirm('¿Eliminar?'))return; await fetch(`${API_BASE}/pacientes/${id}`,{method:'DELETE'}); loadPacientes(); }
async function editPaciente(id){
  const telefono = prompt('Teléfono (opcional):');
  const email = prompt('Email (opcional):');
  const body = {};
  if(telefono) body.telefono = telefono;
  if(email) body.email = email;
  if(Object.keys(body).length===0) return;
  await apiSend(`/pacientes/${id}`,'PUT',body); loadPacientes();
}
document.getElementById('btn-add-paciente').onclick = async ()=>{
  const nombre=prompt('Nombre:'); if(!nombre) return;
  const apellido=prompt('Apellido:'); if(!apellido) return;
  const fecha_nacimiento=prompt('Fecha nacimiento (YYYY-MM-DD):'); if(!fecha_nacimiento) return;
  const telefono=prompt('Teléfono (opcional):'); const email=prompt('Email (opcional):');
  await apiSend('/pacientes','POST',{nombre,apellido,fecha_nacimiento,telefono,email}); loadPacientes();
};

/* ===== ESPECIALIDADES ===== */
const $tblEsp = document.querySelector('#tbl-especialidades tbody');
async function loadEspecialidades(){
  const data = await apiGet('/especialidades');
  $tblEsp.innerHTML = data.map(e=>`
    <tr>
      <td>${e.id}</td><td>${e.nombre}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-edit-e="${e.id}">Renombrar</button>
        <button class="btn btn-sm btn-outline-danger"  data-del-e="${e.id}">Borrar</button>
      </td>
    </tr>`).join('');
  $tblEsp.querySelectorAll('[data-del-e]').forEach(b=>b.onclick=()=>delEspecialidad(b.dataset.delE));
  $tblEsp.querySelectorAll('[data-edit-e]').forEach(b=>b.onclick=()=>editEspecialidad(b.dataset.editE));
}
async function delEspecialidad(id){ if(!confirm('¿Eliminar?'))return; await fetch(`${API_BASE}/especialidades/${id}`,{method:'DELETE'}); loadEspecialidades(); }
async function editEspecialidad(id){
  const nombre = prompt('Nuevo nombre:'); if(!nombre) return;
  await apiSend(`/especialidades/${id}`,'PUT',{nombre}); loadEspecialidades();
}
document.getElementById('btn-add-especialidad').onclick = async ()=>{
  const nombre=prompt('Nombre:'); if(!nombre) return;
  await apiSend('/especialidades','POST',{nombre}); loadEspecialidades();
};

/* ===== MÉDICOS ===== */
const $tblMed = document.querySelector('#tbl-medicos tbody');
async function loadMedicos(){
  const data = await apiGet('/medicos');
  $tblMed.innerHTML = data.map(m=>`
    <tr>
      <td>${m.id}</td><td>${m.nombre}</td><td>${m.apellido}</td>
      <td>${m.especialidad_id}</td><td>${m.email||''}</td><td>${m.telefono||''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-edit-m="${m.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger"  data-del-m="${m.id}">Borrar</button>
      </td>
    </tr>`).join('');
  $tblMed.querySelectorAll('[data-del-m]').forEach(b=>b.onclick=()=>delMedico(b.dataset.delM));
  $tblMed.querySelectorAll('[data-edit-m]').forEach(b=>b.onclick=()=>editMedico(b.dataset.editM));
}
async function delMedico(id){ if(!confirm('¿Eliminar?'))return; await fetch(`${API_BASE}/medicos/${id}`,{method:'DELETE'}); loadMedicos(); }
async function editMedico(id){
  const email=prompt('Email (opcional):'); const telefono=prompt('Teléfono (opcional):');
  const nombre=prompt('Nombre (opcional):'); const apellido=prompt('Apellido (opcional):');
  const especialidad_id=prompt('Especialidad ID (opcional):');
  const body={}; if(email)body.email=email; if(telefono)body.telefono=telefono; if(nombre)body.nombre=nombre; if(apellido)body.apellido=apellido;
  if(especialidad_id) body.especialidad_id=Number(especialidad_id);
  if(Object.keys(body).length===0) return;
  await apiSend(`/medicos/${id}`,'PUT',body); loadMedicos();
}
document.getElementById('btn-add-medico').onclick = async ()=>{
  const nombre=prompt('Nombre:'); if(!nombre) return;
  const apellido=prompt('Apellido:'); if(!apellido) return;
  const especialidad_id=Number(prompt('Especialidad ID:')); if(!especialidad_id) return;
  const email=prompt('Email (opcional):'); const telefono=prompt('Teléfono (opcional):');
  await apiSend('/medicos','POST',{nombre,apellido,especialidad_id,email,telefono}); loadMedicos();
};

/* ===== CITAS ===== */
const $tblCitas = document.querySelector('#tbl-citas tbody');
async function loadCitas(){
  const data = await apiGet('/citas');
  $tblCitas.innerHTML = data.map(c=>`
    <tr>
      <td>${c.id}</td><td>${c.fecha||''}</td><td>${c.hora||''}</td>
      <td>${c.paciente||('#'+c.paciente_id)}</td><td>${c.medico||('#'+c.medico_id)}</td>
      <td>${c.motivo||''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-edit-c="${c.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger"  data-del-c="${c.id}">Borrar</button>
      </td>
    </tr>`).join('');
  $tblCitas.querySelectorAll('[data-del-c]').forEach(b=>b.onclick=()=>delCita(b.dataset.delC));
  $tblCitas.querySelectorAll('[data-edit-c]').forEach(b=>b.onclick=()=>editCita(b.dataset.editC));
}
async function delCita(id){ if(!confirm('¿Eliminar?'))return; await fetch(`${API_BASE}/citas/${id}`,{method:'DELETE'}); loadCitas(); }
async function editCita(id){
  const motivo=prompt('Nuevo motivo (opcional):'); const body={}; if(motivo) body.motivo=motivo;
  if(Object.keys(body).length===0) return;
  await apiSend(`/citas/${id}`,'PUT',body); loadCitas();
}
document.getElementById('btn-add-cita').onclick = async ()=>{
  const paciente_id=Number(prompt('ID Paciente:')); if(!paciente_id) return;
  const medico_id=Number(prompt('ID Médico:')); if(!medico_id) return;
  const fecha=prompt('Fecha (YYYY-MM-DD):'); if(!fecha) return;
  const hora=prompt('Hora (HH:MM):'); if(!hora) return;
  const motivo=prompt('Motivo (opcional):');
  await apiSend('/citas','POST',{paciente_id,medico_id,fecha,hora,motivo}); loadCitas();
};

// Carga inicial
loadPacientes(); loadEspecialidades(); loadMedicos(); loadCitas();
