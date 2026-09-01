const tableBody = document.getElementById('flagsTableBody');
const formError = document.getElementById('formError');

async function loadFlags() {
  const res = await fetch('/api/admin/flags');
  const flags = await res.json();
  renderTable(flags);
}

function renderTable(flags) {
  tableBody.innerHTML = '';
  flags.forEach(flag => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img class="flag-preview" src="https://flagcdn.com/w40/${flag.code}.png" alt="${flag.country}"></td>
      <td>${flag.country}</td>
      <td>${flag.code}</td>
      <td>
        <select class="level-select" onchange="updateLevel(${flag.id}, this.value)">
          <option value="easy" ${flag.level === 'easy' ? 'selected' : ''}>Easy</option>
          <option value="hard" ${flag.level === 'hard' ? 'selected' : ''}>Hard</option>
        </select>
      </td>
      <td>${flag.points}</td>
      <td><button class="btn-danger" onclick="deleteFlag(${flag.id})">Delete</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

async function addFlag() {
  formError.textContent = '';
  const country = document.getElementById('countryInput').value.trim();
  const code = document.getElementById('codeInput').value.trim();
  const level = document.getElementById('levelInput').value;

  if (!country || !code) {
    formError.textContent = 'Please fill in both country name and ISO code.';
    return;
  }

  const res = await fetch('/api/admin/flags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country, code, level })
  });

  const data = await res.json();
  if (!res.ok) {
    formError.textContent = data.error || 'Failed to add flag.';
    return;
  }

  document.getElementById('countryInput').value = '';
  document.getElementById('codeInput').value = '';
  loadFlags();
}

async function updateLevel(id, level) {
  await fetch(`/api/admin/flags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level })
  });
  loadFlags();
}

async function deleteFlag(id) {
  if (!confirm('Delete this flag?')) return;
  await fetch(`/api/admin/flags/${id}`, { method: 'DELETE' });
  loadFlags();
}

loadFlags();
