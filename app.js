const adminData = [
  { ref: 'CL001', allocationId: '2 lots', clientCode: 'SPGD1429', clientName: 'Ramit Thaliyil' },
  { ref: 'CL002', allocationId: '3 lots', clientCode: 'SPGD1203', clientName: 'Rachit Narang' },
];

const overviewData = [
  { ideaId: 'IDEA001', stock: 'TCS', tradeName: 'TCS 30 Apr 2680 CE Sell', expectedLot: 2000 },
  { ideaId: 'IDEA002', stock: 'NESTLE', tradeName: 'Nestle 1300 April end CE Sell', expectedLot: 2500 },
];

const plannerData = [
  { clientRef: 'CL001', monthlyTarget: 6000, slot: '1', ideaId: 'IDEA001', intendedPct: 0.6 },
];

const adminBody = document.querySelector('#adminTable tbody');
const overviewBody = document.querySelector('#overviewTable tbody');
const plannerBody = document.querySelector('#plannerTable tbody');
const snapshot = document.getElementById('snapshot');


const viewButtons = document.querySelectorAll('.nav-item');
const views = {
  dashboard: document.getElementById('view-dashboard'),
  planner: document.getElementById('view-planner'),
  admin: document.getElementById('view-admin'),
  overview: document.getElementById('view-overview'),
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
}

viewButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});


document.getElementById('addAdminRow').addEventListener('click', () => {
  adminData.push({ ref: '', allocationId: '', clientCode: '', clientName: '' });
  renderAdmin();
  renderPlanner();
});

document.getElementById('addOverviewRow').addEventListener('click', () => {
  overviewData.push({ ideaId: '', stock: '', tradeName: '', expectedLot: 0 });
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

function calc(row) {
  const client = getClient(row.clientRef);
  const idea = getIdea(row.ideaId);

  const allocationId = client?.allocationId || '';
  const clientCode = client?.clientCode || '';
  const clientName = client?.clientName || '';

  const expectedLot = Number(idea?.expectedLot || 0);
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
      input.addEventListener('input', (e) => {
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
}

function renderOverview() {
  overviewBody.innerHTML = '';
  overviewData.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input value="${row.ideaId}" data-k="ideaId"></td>
      <td><input value="${row.stock}" data-k="stock"></td>
      <td><input value="${row.tradeName}" data-k="tradeName"></td>
      <td><input type="number" value="${row.expectedLot}" data-k="expectedLot"></td>
      <td><button class="delete">✕</button></td>
    `;

    tr.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.k;
        overviewData[i][key] = key === 'expectedLot' ? Number(e.target.value || 0) : e.target.value;
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
      el.addEventListener('input', (e) => {
        const key = e.target.dataset.k;
        const numeric = ['monthlyTarget', 'intendedPct'];
        plannerData[i][key] = numeric.includes(key) ? Number(e.target.value || 0) : e.target.value;
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
renderPlanner();

switchView('dashboard');
