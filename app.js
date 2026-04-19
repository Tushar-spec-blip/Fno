const adminData = [
  { ref: 'CL001', allocationId: '2 lots', clientCode: 'SPGD1429', clientName: 'Ramit Thaliyil' },
  { ref: 'CL002', allocationId: '3 lots', clientCode: 'SPGD1203', clientName: 'Rachit Narang' },
];

const overviewData = [
  { ideaId: 'IDEA001', stock: 'TCS', tradeName: 'TCS 30 Apr 2680 CE Sell', expiry: '30/Apr/2026', strike: 2680, peCe: 'CE', buySell: 'SELL', lotSize: 175, expectedPremiumPoints: 20 },
  { ideaId: 'IDEA002', stock: 'NESTLE', tradeName: 'Nestle 1300 April end CE Sell', expiry: '30/Apr/2026', strike: 1300, peCe: 'CE', buySell: 'SELL', lotSize: 500, expectedPremiumPoints: 5 },
];

const plannerData = [
  { clientRef: 'CL001', monthlyTarget: 6000, slot: '1', ideaId: 'IDEA001', intendedPct: 0.6 },
];

const clientIdeaAssignment = {};

const adminBody = document.querySelector('#adminTable tbody');
const overviewBody = document.querySelector('#overviewTable tbody');
const plannerBody = document.querySelector('#plannerTable tbody');
const snapshot = document.getElementById('snapshot');
const searchInput = document.querySelector('.search');
const ideaAssignSelect = document.getElementById('ideaAssignSelect');
const selectAllClients = document.getElementById('selectAllClients');
const submitIdeaAssign = document.getElementById('submitIdeaAssign');
const clientChecklist = document.getElementById('clientChecklist');
const ideaAssignSummaryBody = document.querySelector('#ideaAssignSummaryTable tbody');
let searchQuery = '';


const viewButtons = document.querySelectorAll('.nav-item');
const views = {
  dashboard: document.getElementById('view-dashboard'),
  planner: document.getElementById('view-planner'),
  admin: document.getElementById('view-admin'),
  overview: document.getElementById('view-overview'),
  'idea-select': document.getElementById('view-idea-select'),
};

function switchView(viewName) {
  Object.entries(views).forEach(([name, el]) => {
    if (!el) return;
    el.classList.toggle('hidden-view', name !== viewName);
    el.classList.toggle('active-view', name === viewName);
  });

  viewButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  applyTableSearch();
  renderIdeaSelectPage();
}

viewButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

const shell = document.querySelector('.app-shell');
const menuToggle = document.getElementById('menuToggle');
if (menuToggle && shell) {
  menuToggle.addEventListener('click', () => {
    shell.classList.toggle('menu-closed');
  });
}


function applyTableSearch() {
  const tables = ['#adminTable', '#overviewTable', '#plannerTable'];

  tables.forEach((selector) => {
    const rows = document.querySelectorAll(`${selector} tbody tr`);
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = !searchQuery || text.includes(searchQuery) ? '' : 'none';
    });
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = String(e.target.value || '').trim().toLowerCase();
    applyTableSearch();
  });
}

function renderIdeaAssignSummary() {
  if (!ideaAssignSummaryBody) return;

  const counts = {};
  Object.values(clientIdeaAssignment).forEach((ideaId) => {
    counts[ideaId] = (counts[ideaId] || 0) + 1;
  });

  const ideaIds = overviewData.map((x) => x.ideaId).filter(Boolean);
  ideaAssignSummaryBody.innerHTML = '';

  ideaIds.forEach((ideaId) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ideaId}</td><td>${counts[ideaId] || 0}</td>`;
    ideaAssignSummaryBody.appendChild(tr);
  });
}

function renderIdeaSelectPage() {
  if (!ideaAssignSelect || !clientChecklist) return;

  const selectedIdea = ideaAssignSelect.value;
  const ideaIds = overviewData.map((x) => x.ideaId).filter(Boolean);

  ideaAssignSelect.innerHTML = ideaIds
    .map((ideaId) => `<option ${selectedIdea === ideaId ? 'selected' : ''} value="${ideaId}">${ideaId}</option>`)
    .join('');

  const activeIdea = ideaAssignSelect.value || ideaIds[0] || '';

  clientChecklist.innerHTML = adminData
    .map((client) => {
      const checked = clientIdeaAssignment[client.ref] === activeIdea ? 'checked' : '';
      return `<label class="check-item"><input type="checkbox" class="assign-client-check" data-client-ref="${client.ref}" ${checked}> ${client.ref} - ${client.clientName || 'Unnamed'}</label>`;
    })
    .join('');

  const checks = [...document.querySelectorAll('.assign-client-check')];
  if (selectAllClients) {
    const allChecked = checks.length > 0 && checks.every((c) => c.checked);
    selectAllClients.checked = allChecked;
  }

  renderIdeaAssignSummary();
}

if (ideaAssignSelect) {
  ideaAssignSelect.addEventListener('change', () => {
    renderIdeaSelectPage();
  });
}

if (selectAllClients) {
  selectAllClients.addEventListener('change', (e) => {
    document.querySelectorAll('.assign-client-check').forEach((check) => {
      check.checked = e.target.checked;
    });
  });
}

if (submitIdeaAssign) {
  submitIdeaAssign.addEventListener('click', () => {
    const ideaId = ideaAssignSelect?.value;
    if (!ideaId) {
      alert('Please select an Idea ID.');
      return;
    }

    const selectedClients = [...document.querySelectorAll('.assign-client-check:checked')]
      .map((node) => node.dataset.clientRef)
      .filter(Boolean);

    selectedClients.forEach((clientRef) => {
      clientIdeaAssignment[clientRef] = ideaId;
    });

    plannerData.forEach((row) => {
      if (row.clientRef && clientIdeaAssignment[row.clientRef]) {
        row.ideaId = clientIdeaAssignment[row.clientRef];
      }
    });

    renderIdeaSelectPage();
    renderPlanner();
  });
}


document.getElementById('addAdminRow').addEventListener('click', () => {
  adminData.push({ ref: '', allocationId: '', clientCode: '', clientName: '' });
  renderAdmin();
  renderPlanner();
});

document.getElementById('addOverviewRow').addEventListener('click', () => {
  overviewData.push({ ideaId: '', stock: '', tradeName: '', expiry: '', strike: 0, peCe: 'CE', buySell: 'BUY', lotSize: 0, expectedPremiumPoints: 0 });
  renderOverview();
  renderPlanner();
});

document.getElementById('addPlannerRow').addEventListener('click', () => {
  plannerData.push({ clientRef: '', monthlyTarget: 0, slot: '', ideaId: '', intendedPct: 0.5 });
  renderPlanner();
});

document.getElementById('exportCsv').addEventListener('click', exportPlannerCsv);

function toMoney(n) {
  return Number(n || 0).toLocaleString();
}

function toPercent(n) {
  return `${Math.round(Number(n || 0) * 100)}%`;
}

function getClient(ref) {
  return adminData.find((x) => x.ref === ref) || null;
}

function getIdea(ideaId) {
  return overviewData.find((x) => x.ideaId === ideaId) || null;
}


function isDuplicateAdminValue(key, value, currentIndex) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return false;

  return adminData.some((row, index) => (
    index !== currentIndex
    && String(row[key] || '').trim().toLowerCase() === normalized
  ));
}


function normalizeExpiry(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const match = raw.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4})$/);
  if (!match) return null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = match[1];
  const month = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
  const year = match[3];

  if (!months.includes(month)) return null;

  return `${day}/${month}/${year}`;
}

function sideClass(value) {
  return value === 'BUY' ? 'side-buy' : 'side-sell';
}



function expectedLotsRs(row) {
  return Number(row?.lotSize || 0) * Number(row?.expectedPremiumPoints || 0);
}

function inHandPrem(row) {
  return expectedLotsRs(row) * 0.75;
}

function calc(row) {
  const client = getClient(row.clientRef);
  const idea = getIdea(row.ideaId);

  const allocationId = client?.allocationId || '';
  const clientCode = client?.clientCode || '';
  const clientName = client?.clientName || '';

  const expectedLot = expectedLotsRs(idea);
  const stock = idea?.stock || '';
  const revenueNeeded = Number(row.monthlyTarget || 0) * Number(row.intendedPct || 0);
  const lotsNeeded = expectedLot > 0 ? Math.ceil(revenueNeeded / expectedLot) : 0;
  const plannedRevenue = lotsNeeded * expectedLot;
  const achievePct = Number(row.monthlyTarget || 0) > 0
    ? plannedRevenue / Number(row.monthlyTarget)
    : 0;

  let status = 'Not Started';
  if (achievePct >= 1) status = 'Complete';
  else if (achievePct >= 0.7) status = 'Near Complete';
  else if (achievePct > 0) status = 'Partial';

  return {
    allocationId,
    clientCode,
    clientName,
    stock,
    expectedLot,
    revenueNeeded,
    lotsNeeded,
    plannedRevenue,
    achievePct,
    status,
  };
}

function clientOptions(selected) {
  return adminData
    .map(({ ref, clientName }) => `<option ${selected === ref ? 'selected' : ''} value="${ref}">${ref} - ${clientName || 'Unnamed'}</option>`)
    .join('');
}

function ideaOptions(selected) {
  return overviewData
    .map(({ ideaId }) => `<option ${selected === ideaId ? 'selected' : ''} value="${ideaId}">${ideaId}</option>`)
    .join('');
}

function renderAdmin() {
  adminBody.innerHTML = '';
  adminData.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input value="${row.ref}" data-k="ref" placeholder="CL001"></td>
      <td><input value="${row.allocationId}" data-k="allocationId"></td>
      <td><input value="${row.clientCode}" data-k="clientCode"></td>
      <td><input value="${row.clientName}" data-k="clientName"></td>
      <td><button class="delete">✕</button></td>
    `;

    tr.querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.k;
        const newValue = e.target.value;
        const oldValue = adminData[i][key];

        if (
          ['ref', 'clientCode', 'clientName'].includes(key)
          && isDuplicateAdminValue(key, newValue, i)
        ) {
          alert('duplicate data is entered');
          e.target.value = oldValue;
          return;
        }

        adminData[i][key] = newValue;
        renderPlanner();
      });
    });

    tr.querySelector('.delete').addEventListener('click', () => {
      adminData.splice(i, 1);
      renderAdmin();
      renderPlanner();
    });

    adminBody.appendChild(tr);
  });

  applyTableSearch();
  renderIdeaSelectPage();
}

function renderOverview() {
  overviewBody.innerHTML = '';
  overviewData.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input value="${row.ideaId}" data-k="ideaId"></td>
      <td><input value="${row.stock}" data-k="stock"></td>
      <td><input value="${row.tradeName}" data-k="tradeName"></td>
      <td><input value="${row.expiry || ""}" placeholder="DD/MMM/YYYY" data-k="expiry"></td>
      <td><input type="number" value="${row.strike || 0}" data-k="strike"></td>
      <td>
        <select data-k="peCe">
          <option ${row.peCe === 'PE' ? 'selected' : ''} value="PE">PE</option>
          <option ${row.peCe === 'CE' ? 'selected' : ''} value="CE">CE</option>
        </select>
      </td>
      <td class="${sideClass(row.buySell)}">
        <select data-k="buySell">
          <option ${row.buySell === 'BUY' ? 'selected' : ''} value="BUY">BUY</option>
          <option ${row.buySell === 'SELL' ? 'selected' : ''} value="SELL">SELL</option>
        </select>
      </td>
      <td><input type="number" value="${row.lotSize || 0}" data-k="lotSize"></td>
      <td><input type="number" value="${row.expectedPremiumPoints || 0}" data-k="expectedPremiumPoints"></td>
      <td class="cell-auto">${toMoney(expectedLotsRs(row))}</td>
      <td class="cell-auto">${toMoney(inHandPrem(row))}</td>
      <td><button class="delete">✕</button></td>
    `;

    tr.querySelectorAll('input, select').forEach((field) => {
      field.addEventListener('change', (e) => {
        const key = e.target.dataset.k;

        if (key === 'expiry') {
          const formatted = normalizeExpiry(e.target.value);
          if (formatted === null) {
            alert('Expiry must be in DD/MMM/YYYY format');
            e.target.value = row.expiry || '';
            return;
          }
          row.expiry = formatted;
        } else if (['strike', 'lotSize', 'expectedPremiumPoints'].includes(key)) {
          row[key] = Number(e.target.value || 0);
        } else {
          row[key] = e.target.value;
        }

        renderOverview();
        renderPlanner();
      });
    });

    tr.querySelector('.delete').addEventListener('click', () => {
      overviewData.splice(i, 1);
      renderOverview();
      renderPlanner();
    });

    overviewBody.appendChild(tr);
  });

  applyTableSearch();
  renderIdeaSelectPage();
}

function renderPlanner() {
  plannerBody.innerHTML = '';
  plannerData.forEach((row, i) => {
    const out = calc(row);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><select data-k="clientRef"><option value="">Select Client</option>${clientOptions(row.clientRef)}</select></td>
      <td class="cell-auto">${out.allocationId}</td>
      <td class="cell-auto">${out.clientCode}</td>
      <td class="cell-auto">${out.clientName}</td>
      <td><input type="number" value="${row.monthlyTarget}" data-k="monthlyTarget"></td>
      <td><input value="${row.slot}" data-k="slot"></td>
      <td><select data-k="ideaId"><option value="">Select Idea</option>${ideaOptions(row.ideaId)}</select></td>
      <td class="cell-auto">${out.stock}</td>
      <td>
        <select data-k="intendedPct">
          ${[0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
            .map((v) => `<option ${Number(row.intendedPct) === v ? 'selected' : ''} value="${v}">${Math.round(v * 100)}%</option>`)
            .join('')}
        </select>
      </td>
      <td class="cell-auto">${toMoney(out.revenueNeeded)}</td>
      <td class="cell-auto">${toMoney(out.expectedLot)}</td>
      <td class="cell-auto">${toMoney(out.lotsNeeded)}</td>
      <td class="cell-auto">${toMoney(out.plannedRevenue)}</td>
      <td class="cell-auto">${toPercent(out.achievePct)}</td>
      <td class="cell-auto">${out.status}</td>
      <td><button class="delete">✕</button></td>
    `;

    tr.querySelectorAll('input, select').forEach((el) => {
      el.addEventListener('change', (e) => {
        const key = e.target.dataset.k;
        const numeric = ['monthlyTarget', 'intendedPct'];
        plannerData[i][key] = numeric.includes(key) ? Number(e.target.value || 0) : e.target.value;

        if (key === 'clientRef' && clientIdeaAssignment[plannerData[i].clientRef]) {
          plannerData[i].ideaId = clientIdeaAssignment[plannerData[i].clientRef];
        }

        renderPlanner();
      });
    });

    tr.querySelector('.delete').addEventListener('click', () => {
      plannerData.splice(i, 1);
      renderPlanner();
    });

    plannerBody.appendChild(tr);
  });

  renderSnapshot();
  applyTableSearch();
  renderIdeaSelectPage();
}

function renderSnapshot() {
  const totals = plannerData.map(calc);
  const clients = plannerData.length;
  const lots = totals.reduce((acc, x) => acc + x.lotsNeeded, 0);
  const revenue = totals.reduce((acc, x) => acc + x.plannedRevenue, 0);
  const hp = totals.filter((x) => x.lotsNeeded >= 2).length;
  const maxLot = Math.max(0, ...totals.map((x) => x.lotsNeeded));
  const avgRev = clients ? Math.round(revenue / clients) : 0;

  const cards = [
    ['Client Count', clients],
    ['Total Planned Lots', lots],
    ['Total Expected Revenue', toMoney(revenue)],
    ['High Priority Clients (2+ lots)', hp],
    ['Largest Allocation', maxLot],
    ['Average Revenue / Client', toMoney(avgRev)],
  ];

  snapshot.innerHTML = cards
    .map(([k, v]) => `<div class="metric"><span>${k}</span><strong>${v}</strong></div>`)
    .join('');
}

function exportPlannerCsv() {
  const headers = [
    'Client Ref',
    'Allocation ID',
    'Client Code',
    'Client Name',
    'Monthly Target',
    'Slot',
    'Idea ID',
    'Stock',
    'Intended %',
    'Revenue Needed',
    'Expected / Lot',
    'Lots Needed',
    'Planned Revenue',
    'Achieve %',
    'Coverage Status',
  ];

  const rows = plannerData.map((row) => {
    const out = calc(row);
    return [
      row.clientRef,
      out.allocationId,
      out.clientCode,
      out.clientName,
      row.monthlyTarget,
      row.slot,
      row.ideaId,
      out.stock,
      toPercent(row.intendedPct),
      out.revenueNeeded,
      out.expectedLot,
      out.lotsNeeded,
      out.plannedRevenue,
      toPercent(out.achievePct),
      out.status,
    ];
  });

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'fno_planner.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

renderAdmin();
renderOverview();
renderIdeaSelectPage();
renderPlanner();

switchView('dashboard');
