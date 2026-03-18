let bookings = [
  { id:1, nome:"Carlos Mendes", tel:"923 456 789", servico:"Moto Táxi", data:"2025-03-04", hora:"08:30", partida:"Talatona", destino:"Largo da Maianga", status:"Pendente", obs:"" },
  { id:2, nome:"Ana Ferreira", tel:"912 345 678", servico:"Entrega de Encomenda", data:"2025-03-04", hora:"10:00", partida:"Miramar", destino:"Palanca", status:"Confirmado", obs:"Volume pequeno" },
  { id:3, nome:"João Simões", tel:"934 567 890", servico:"Transporte Urbano", data:"2025-03-04", hora:"14:30", partida:"Viana", destino:"Aeroporto 4 Fevereiro", status:"Pendente", obs:"2 malas" },
  { id:4, nome:"Maria Lopes", tel:"921 234 567", servico:"Moto Táxi", data:"2025-03-03", hora:"09:00", partida:"Ilha do Cabo", destino:"Ministério da Saúde", status:"Concluído", obs:"" },
  { id:5, nome:"Pedro Santos", tel:"945 678 901", servico:"Moto Táxi", data:"2025-03-03", hora:"11:45", partida:"Benfica", destino:"Cidade Alta", status:"Concluído", obs:"" },
  { id:6, nome:"Rosa Neto", tel:"919 876 543", servico:"Entrega de Encomenda", data:"2025-03-03", hora:"15:00", partida:"Cazenga", destino:"Sambizanga", status:"Concluído", obs:"Documentos" },
  { id:7, nome:"Luís Figueira", tel:"926 543 210", servico:"Transporte Especial", data:"2025-03-05", hora:"07:00", partida:"Ingombota", destino:"Cacuaco", status:"Pendente", obs:"Urgente" },
  { id:8, nome:"Sofia Barros", tel:"933 210 987", servico:"Moto Táxi", data:"2025-03-02", hora:"16:20", partida:"Mutamba", destino:"Boa Vista", status:"Cancelado", obs:"Cliente desistiu" },
];

let pilotes = [
  { id:1, nome:"António Tomas", tel:"923 111 222", doc:"LA-12345", zona:"Talatona / Miramar", status:"Activo", corridas:142 },
  { id:2, nome:"Domingos Neto", tel:"912 333 444", doc:"LA-67890", zona:"Viana / Benfica", status:"Activo", corridas:98 },
  { id:3, nome:"Eduardo Silva", tel:"934 555 666", doc:"LA-11111", zona:"Ilha / Ingombota", status:"Activo", corridas:76 },
  { id:4, nome:"Francisco Lima", tel:"921 777 888", doc:"LA-22222", zona:"Cazenga / Sambizanga", status:"De Folga", corridas:55 },
];

let currentFilter = "todos";
let editingId = null;

/* ═══════════════════════════════════════
   LOGIN
═══════════════════════════════════════ */
document.getElementById('loginPass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
document.getElementById('loginUser').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  if(u === 'admin' && p === 'twenda2025') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').classList.add('show');
    init();
  } else {
    document.getElementById('loginError').classList.add('show');
    document.getElementById('loginPass').value = '';
  }
}

function doLogout() {
  document.getElementById('adminPanel').classList.remove('show');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').classList.remove('show');
}

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
const pageTitles = {
  dashboard: ['DASHBOARD','Visão geral do sistema'],
  agendamentos: ['AGENDAMENTOS','Gestão de reservas'],
  pilotes: ['PILOTES','Equipa de condutores'],
  clientes: ['CLIENTES','Base de dados de clientes'],
  notificacoes: ['NOTIFICAÇÕES','Alertas do sistema'],
  configuracoes: ['CONFIGURAÇÕES','Parâmetros do sistema'],
};

function goPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(el) el.classList.add('active');
  const [title, sub] = pageTitles[id] || [id.toUpperCase(),''];
  document.getElementById('topbarTitle').textContent = title;
  document.getElementById('topbarSub').textContent = sub;
  if(id === 'agendamentos') renderTable();
  if(id === 'pilotes') renderPilotes();
  if(id === 'clientes') renderClientes();
  if(id === 'notificacoes') renderNotifs();
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
function init() {
  updateDate();
  setInterval(updateDate, 60000);
  buildChart();
  renderDashboard();
  renderTable();
  renderPilotes();
  renderClientes();
  renderNotifs();
  updateStats();
}

function updateDate() {
  const now = new Date();
  const opts = { weekday:'long', day:'numeric', month:'long', year:'numeric' };
  document.getElementById('topbarDate').textContent = now.toLocaleDateString('pt-PT', opts);
}

function updateStats() {
  const total = bookings.length;
  const done = bookings.filter(b => b.status === 'Concluído').length;
  const pending = bookings.filter(b => b.status === 'Pendente').length;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statDone').textContent = done;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('pendingBadge').textContent = pending;
}

/* ═══════════════════════════════════════
   CHART
═══════════════════════════════════════ */
function buildChart() {
  const days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const vals = [3,5,2,8,6,4,7];
  const max = Math.max(...vals);
  const wrap = document.getElementById('chartBars');
  wrap.innerHTML = '';
  days.forEach((d,i) => {
    const h = Math.round((vals[i]/max)*120);
    const active = i === 6 ? 'active' : '';
    wrap.innerHTML += `<div class="chart-bar-wrap">
      <div class="chart-bar ${active}" style="height:${h}px" title="${vals[i]} agendamentos"></div>
      <span class="chart-bar-label">${d}</span>
    </div>`;
  });
}

/* ═══════════════════════════════════════
   DASHBOARD — RECENT
═══════════════════════════════════════ */
function renderDashboard() {
  const list = document.getElementById('recentList');
  const recent = [...bookings].sort((a,b) => b.id - a.id).slice(0,5);
  list.innerHTML = recent.map(b => {
    const initials = b.nome.split(' ').map(w=>w[0]).slice(0,2).join('');
    return `<div class="recent-item">
      <div class="recent-avatar">${initials}</div>
      <div>
        <div class="recent-name">${b.nome}</div>
        <div class="recent-info">${b.partida} → ${b.destino}</div>
      </div>
      <div class="recent-right">
        <div class="recent-time">${b.hora} · ${formatDate(b.data)}</div>
        <div class="recent-type">${b.servico}</div>
      </div>
      <div style="margin-left:12px">${statusBadge(b.status)}</div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════════════════
   BOOKINGS TABLE
═══════════════════════════════════════ */
function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderTable();
}

function renderTable() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let filtered = bookings.filter(b => {
    const matchFilter = currentFilter === 'todos' || b.status === currentFilter;
    const matchSearch = !search ||
      b.nome.toLowerCase().includes(search) ||
      b.tel.includes(search) ||
      b.servico.toLowerCase().includes(search) ||
      b.partida.toLowerCase().includes(search) ||
      b.destino.toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });

  const tbody = document.getElementById('bookingTableBody');
  const empty = document.getElementById('emptyState');

  if(!filtered.length) {
    tbody.innerHTML = '';
    if(empty) empty.style.display = 'block';
    return;
  }
  if(empty) empty.style.display = 'none';

  tbody.innerHTML = filtered.map(b => `
    <tr>
      <td>
        <div class="td-name">${b.nome}</div>
        <div class="td-phone">${b.tel}</div>
      </td>
      <td><span class="td-service">${b.servico}</span></td>
      <td><span class="td-addr" title="${b.partida}">${b.partida}</span></td>
      <td><span class="td-addr" title="${b.destino}">${b.destino}</span></td>
      <td class="td-date">${formatDate(b.data)}</td>
      <td class="td-time">${b.hora}</td>
      <td>${statusBadge(b.status)}</td>
      <td>
        <div class="action-row">
          <button class="act-btn wa" title="WhatsApp" onclick="contactWA(${b.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
          <button class="act-btn success" title="Confirmar" onclick="changeStatus(${b.id},'Confirmado')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="act-btn" title="Editar" onclick="openModal(${b.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="act-btn danger" title="Cancelar" onclick="changeStatus(${b.id},'Cancelado')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function statusBadge(s) {
  const map = {
    'Pendente': 'badge-pending',
    'Confirmado': 'badge-confirmed',
    'Concluído': 'badge-done',
    'Cancelado': 'badge-cancelled',
  };
  return `<span class="badge ${map[s]||'badge-pending'}">${s}</span>`;
}

function formatDate(d) {
  if(!d) return '—';
  const [y,m,day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function changeStatus(id, status) {
  const b = bookings.find(x => x.id === id);
  if(b) { b.status = status; renderTable(); renderDashboard(); updateStats(); }
}

function contactWA(id) {
  const b = bookings.find(x => x.id === id);
  if(!b) return;
  const msg = `Olá ${b.nome}! 🏍 A sua reserva Twenda foi recebida.\n\n📅 *${formatDate(b.data)}* às *${b.hora}*\n🛵 Serviço: ${b.servico}\n📍 Partida: ${b.partida}\n🏁 Destino: ${b.destino}\n\nO nosso pilote chegará em breve. Obrigado por escolher a Twenda!`;
  window.open(`https://wa.me/244${b.tel.replace(/\s/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ═══════════════════════════════════════
   MODAL BOOKING
═══════════════════════════════════════ */
function openModal(id) {
  editingId = id || null;
  document.getElementById('modalTitle').textContent = id ? 'EDITAR AGENDAMENTO' : 'NOVO AGENDAMENTO';
  if(id) {
    const b = bookings.find(x => x.id === id);
    if(b) {
      document.getElementById('m-nome').value = b.nome;
      document.getElementById('m-tel').value = b.tel;
      document.getElementById('m-servico').value = b.servico;
      document.getElementById('m-data').value = b.data;
      document.getElementById('m-hora').value = b.hora;
      document.getElementById('m-partida').value = b.partida;
      document.getElementById('m-destino').value = b.destino;
      document.getElementById('m-status').value = b.status;
      document.getElementById('m-obs').value = b.obs;
    }
  } else {
    ['m-nome','m-tel','m-data','m-hora','m-partida','m-destino','m-obs'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('m-servico').selectedIndex = 0;
    document.getElementById('m-status').value = 'Pendente';
    document.getElementById('m-data').value = new Date().toISOString().split('T')[0];
  }
  document.getElementById('bookingModal').classList.add('open');
}

function closeModal() { document.getElementById('bookingModal').classList.remove('open'); editingId = null; }

function saveBooking() {
  const nome = document.getElementById('m-nome').value.trim();
  const tel = document.getElementById('m-tel').value.trim();
  const servico = document.getElementById('m-servico').value;
  const data = document.getElementById('m-data').value;
  const hora = document.getElementById('m-hora').value;
  const partida = document.getElementById('m-partida').value.trim();
  const destino = document.getElementById('m-destino').value.trim();
  const status = document.getElementById('m-status').value;
  const obs = document.getElementById('m-obs').value.trim();
  if(!nome || !tel || !servico || !data || !hora || !partida || !destino) { alert('Preencha todos os campos obrigatórios.'); return; }
  if(editingId) {
    const b = bookings.find(x => x.id === editingId);
    if(b) Object.assign(b, {nome,tel,servico,data,hora,partida,destino,status,obs});
  } else {
    bookings.unshift({ id: Date.now(), nome,tel,servico,data,hora,partida,destino,status,obs });
  }
  closeModal();
  renderTable(); renderDashboard(); updateStats();
}

/* ═══════════════════════════════════════
   PILOTES
═══════════════════════════════════════ */
function renderPilotes() {
  const grid = document.getElementById('pilotesGrid');
  grid.innerHTML = pilotes.map(p => {
    const statusColor = p.status === 'Activo' ? 'var(--success)' : p.status === 'De Folga' ? 'var(--warning)' : 'var(--muted)';
    const badgeClass = p.status === 'Activo' ? 'badge-done' : p.status === 'De Folga' ? 'badge-pending' : 'badge-cancelled';
    return `<div class="pilote-card">
      <div class="pilote-header">
        <div class="pilote-avatar">${p.nome.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
        <div>
          <div class="pilote-name">${p.nome}</div>
          <div class="pilote-id">ID-${String(p.id).padStart(3,'0')} · ${p.zona}</div>
        </div>
      </div>
      <div class="pilote-stats">
        <div class="pilote-stat"><div class="pilote-stat-num">${p.corridas}</div><div class="pilote-stat-lbl">Corridas</div></div>
        <div class="pilote-stat"><div class="pilote-stat-num">${(p.corridas * 0.97).toFixed(0)}</div><div class="pilote-stat-lbl">Concluídas</div></div>
      </div>
      <div class="pilote-footer">
        <span class="badge ${badgeClass}">${p.status}</span>
        <div class="action-row">
          <button class="act-btn wa" title="WhatsApp" onclick="window.open('https://wa.me/244${p.tel.replace(/\s/g,'')}','_blank')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
          <button class="act-btn danger" title="Remover" onclick="removePilote(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openPiloteModal() { document.getElementById('piloteModal').classList.add('open'); }
function closePiloteModal() { document.getElementById('piloteModal').classList.remove('open'); }

function savePilote() {
  const nome = document.getElementById('p-nome').value.trim();
  const tel = document.getElementById('p-tel').value.trim();
  const doc = document.getElementById('p-doc').value.trim();
  const zona = document.getElementById('p-zona').value.trim();
  const status = document.getElementById('p-status').value;
  if(!nome || !tel) { alert('Nome e telefone são obrigatórios.'); return; }
  pilotes.push({ id: Date.now(), nome, tel, doc, zona, status, corridas: 0 });
  closePiloteModal();
  renderPilotes();
}

function removePilote(id) {
  if(confirm('Remover este pilote?')) { pilotes = pilotes.filter(p => p.id !== id); renderPilotes(); }
}

/* ═══════════════════════════════════════
   CLIENTES
═══════════════════════════════════════ */
function renderClientes() {
  const seen = {};
  bookings.forEach(b => {
    if(!seen[b.tel]) seen[b.tel] = { nome:b.nome, tel:b.tel, count:0, last:b.data, status:'Regular' };
    seen[b.tel].count++;
    if(b.data > seen[b.tel].last) seen[b.tel].last = b.data;
    if(seen[b.tel].count >= 5) seen[b.tel].status = 'VIP';
  });
  const clientes = Object.values(seen);
  document.getElementById('clientesTableBody').innerHTML = clientes.map(c => `
    <tr>
      <td><div class="td-name">${c.nome}</div></td>
      <td class="td-phone">${c.tel}</td>
      <td style="font-weight:600;color:var(--orange)">${c.count}</td>
      <td class="td-date">${formatDate(c.last)}</td>
      <td>${c.status === 'VIP' ? '<span class="badge badge-done">VIP</span>' : '<span class="badge badge-confirmed">Regular</span>'}</td>
      <td>
        <div class="action-row">
          <button class="act-btn wa" title="WhatsApp" onclick="window.open('https://wa.me/244${c.tel.replace(/\s/g,'')}','_blank')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ═══════════════════════════════════════
   NOTIFICAÇÕES
═══════════════════════════════════════ */
let notifs = [
  { id:1, icon:'orange', title:'Novo agendamento recebido', desc:'Luís Figueira agendou um serviço para 05/03 às 07:00 — Transporte Especial.', time:'Há 5 min' },
  { id:2, icon:'green', title:'Agendamento confirmado', desc:'O agendamento de Ana Ferreira foi confirmado pelo pilote António Tomas.', time:'Há 18 min' },
  { id:3, icon:'blue', title:'Pilote de folga', desc:'Francisco Lima marcou folga para amanhã. Redistribuição de zonas necessária.', time:'Há 1 hora' },
  { id:4, icon:'red', title:'Agendamento cancelado', desc:'Sofia Barros cancelou o agendamento das 16:20. Razão: Cliente desistiu.', time:'Ontem, 16:25' },
];

function renderNotifs() {
  const list = document.getElementById('notifList');
  if(!notifs.length) { list.innerHTML = '<div class="empty-state"><h3>Sem notificações</h3><p>Tudo em dia.</p></div>'; return; }
  const iconColors = { orange:'rgba(251,161,13,0.12)', green:'rgba(34,197,94,0.12)', blue:'rgba(59,130,246,0.12)', red:'rgba(239,68,68,0.12)' };
  const svgColors = { orange:'#FBA10D', green:'#22c55e', blue:'#60a5fa', red:'#f87171' };
  list.innerHTML = notifs.map(n => `
    <div class="notif-item">
      <div class="notif-icon" style="background:${iconColors[n.icon]}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${svgColors[n.icon]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <div style="flex:1">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <span class="notif-time">${n.time}</span>
        <button class="act-btn danger" onclick="removeNotif(${n.id})" title="Dispensar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function removeNotif(id) { notifs = notifs.filter(n => n.id !== id); renderNotifs(); }
function clearNotifs() { notifs = []; renderNotifs(); }

/* ═══════════════════════════════════════
   CLOSE MODAL ON BACKDROP CLICK
═══════════════════════════════════════ */
document.getElementById('bookingModal').addEventListener('click', e => { if(e.target.id === 'bookingModal') closeModal(); });
document.getElementById('piloteModal').addEventListener('click', e => { if(e.target.id === 'piloteModal') closePiloteModal(); });