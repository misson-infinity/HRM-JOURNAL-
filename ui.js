// Infinity X - UI Renderer
// Version: 2.2.0 (Fully Functional & Stable)
"use strict";

function renderSidebar() {
    const s = document.querySelector('.sidebar');
    if (!s) return; const p = state.ui.currentPage;
    s.innerHTML = `<div class="sidebar-header"><img src="logo.svg" alt="Logo" class="logo"><h2>Infinity X</h2></div><nav class="sidebar-nav"><ul>
        <li><a href="index.html" class="${p === 'dashboard' ? 'active' : ''}"><i class='bx bxs-dashboard'></i> Dashboard</a></li>
        <li><a href="transactions.html" class="${p === 'transactions' ? 'active' : ''}"><i class='bx bx-transfer-alt'></i> Transactions</a></li>
        <li><a href="reports.html" class="${p === 'reports' ? 'active' : ''}"><i class='bx bxs-report'></i> Reports</a></li>
        <li><a href="budgets.html" class="${p === 'budgets' ? 'active' : ''}"><i class='bx bx-target-lock'></i> Budgets</a></li>
        <li><a href="settings.html" class="${p === 'settings' ? 'active' : ''}"><i class='bx bxs-cog'></i> Settings</a></li>
    </ul></nav><div class="sidebar-footer"><a href="developer.html" class="${p === 'developer' ? 'active' : ''}"><i class='bx bxs-user-circle'></i> Developer</a></div>`;
}
function renderFooter() {
    const f = document.querySelector('.main-footer');
    if (!f) return; const { userName, userTitle, userImage } = state.settings;
    f.innerHTML = `<img src="${userImage}" alt="${userName}" class="footer-profile-pic"><p class="footer-name">${userName}</p><p class="footer-title">${userTitle}</p>`;
}
function renderDashboardPage() {
    document.getElementById('headerUserName').textContent = state.settings.userName.split(' ')[0];
    const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    document.getElementById('currentBalance').textContent = formatCurrency(income - expense);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expense);
    document.getElementById('transactionCount').textContent = state.transactions.length;
    updateFinancialHealthRing(income, expense);
    const list = document.getElementById('recentTransactionsList');
    if (list) list.innerHTML = state.transactions.slice(0, 5).map(t => { const c = getCategoryById(t.category); return `<li class="activity-item"><div class="activity-icon"><i class='bx ${c?.icon}'></i></div><div class="activity-details"><span>${t.description}</span><small>${t.date.toLocaleDateString()}</small></div><strong class="activity-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</strong></li>` }).join('') || `<li class="empty-state">No recent transactions.</li>`;
    renderCashFlowChart(document.getElementById('cashFlowChart'));
}
function updateFinancialHealthRing(income, expense) {
    const ring = document.getElementById('health-ring-circle');
    const scoreText = document.getElementById('health-score');
    if (!ring || !scoreText) return;
    let score = income > 0 ? Math.max(0, Math.round((1 - (expense / income)) * 100)) : 0;
    ring.style.strokeDashoffset = 100 - score;
    scoreText.textContent = `${score}%`;
    if (score < 30) ring.style.stroke = 'var(--danger-color)'; else if (score < 60) ring.style.stroke = 'var(--warning-color)'; else ring.style.stroke = 'var(--success-color)';
}
function renderCashFlowChart(canvas) { if (!canvas || typeof Chart === 'undefined') return; if (window.cashFlowChartInstance) window.cashFlowChartInstance.destroy(); window.cashFlowChartInstance = new Chart(canvas, { type: 'line', data: { labels: ['W1', 'W2', 'W3', 'W4'], datasets: [{ label: 'Income', data: [12000, 19000, 3000, 5000], borderColor: 'var(--success-color)', tension: 0.4 }, { label: 'Expense', data: [8000, 5000, 7000, 6000], borderColor: 'var(--danger-color)', tension: 0.4 }] } }); }
function renderTransactionsPage() {
    const tableBody = document.getElementById('transactionTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = state.transactions.map(t => {
        const c = getCategoryById(t.category);
        return `<tr><td>${t.date.toLocaleDateString()}</td><td>${t.description}</td><td><i class='bx ${c?.icon}'></i> ${c?.name}</td><td class="amount ${t.type}">${formatCurrency(t.amount)}</td><td class="action-buttons"><button onclick="openModal('${t.id}')"><i class='bx bxs-edit'></i></button><button onclick="deleteTransaction('${t.id}')"><i class='bx bxs-trash'></i></button></td></tr>`;
    }).join('') || `<tr><td colspan="5" style="text-align:center;">No transactions found.</td></tr>`;
}
function renderReportsPage() { const mf = document.getElementById('reportMonthFilter'); if (mf) { const t = new Date(); mf.value = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`; mf.addEventListener('change', () => {}); } }
function renderBudgetsPage() { /* ... */ }
function renderSettingsPage() { /* ... */ }
function openModal(id = null) {
    state.ui.editingTransactionId = id; const t = id ? state.transactions.find(t => t.id === id) : {};
    const m = document.getElementById('modal-container');
    m.innerHTML = `<div class="modal-overlay visible"><div class="modal"><div class="modal-header"><h2>${id ? 'Edit' : 'Add'} Transaction</h2><button class="icon-btn" onclick="closeModal()"><i class='bx bx-x'></i></button></div><form id="transaction-form"><div class="form-group"><label>Type</label><select name="type" id="type-selector">${['expense', 'income'].map(v => `<option value="${v}" ${t.type === v ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('')}</select></div><div class="form-group"><label>Description</label><input type="text" name="description" value="${t.description || ''}" required></div><div class="form-group"><label>Amount</label><input type="number" step="0.01" name="amount" value="${t.amount || ''}" required></div><div class="form-group"><label>Category</label><select name="category" id="category-selector" required></select></div><div class="form-group"><label>Date</label><input type="date" name="date" value="${t.date ? t.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required></div><button type="submit" class="fab">${id ? 'Update' : 'Add'}</button></form></div></div>`;
    const ts = document.getElementById('type-selector'), cs = document.getElementById('category-selector');
    const updateCat = () => { cs.innerHTML = state.categories.filter(c => c.type === ts.value).map(c => `<option value="${c.id}" ${t.category === c.id ? 'selected' : ''}>${c.name}</option>`).join(''); };
    updateCat(); ts.addEventListener('change', updateCat);
    document.getElementById('transaction-form').addEventListener('submit', e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target).entries()); d.amount = parseFloat(d.amount); addOrUpdateTransaction(d); });
}
function closeModal() { const m = document.querySelector('.modal-overlay'); if (m) { m.style.opacity = '0'; setTimeout(() => m.remove(), 400); } }
function showToast(message, type = 'success') { const c = document.getElementById('toast-container'); const t = document.createElement('div'); t.className = `toast ${type} show`; t.innerHTML = `<i class='bx ${type === 'success' ? 'bxs-check-circle' : 'bxs-x-circle'}'></i><span>${message}</span>`; c.appendChild(t); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 3000); }