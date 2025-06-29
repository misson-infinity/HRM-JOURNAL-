// Infinity X - UI Renderer
// Version: 1.2.0 (Stable Render & DOM Checks)
// Handles all DOM manipulations, rendering tasks, and user interactions.

"use strict";

function renderSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return; // Robustness check
    const currentPage = state.ui.currentPage;
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <img src="logo.svg" alt="Logo" class="logo">
            <h2>Infinity X</h2>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li><a href="index.html" class="${currentPage === 'dashboard' ? 'active' : ''}"><i class='bx bxs-dashboard'></i> Dashboard</a></li>
                <li><a href="transactions.html" class="${currentPage === 'transactions' ? 'active' : ''}"><i class='bx bx-transfer-alt'></i> Transactions</a></li>
                <li><a href="reports.html" class="${currentPage === 'reports' ? 'active' : ''}"><i class='bx bxs-report'></i> Reports</a></li>
                <li><a href="budgets.html" class="${currentPage === 'budgets' ? 'active' : ''}"><i class='bx bx-target-lock'></i> Budgets</a></li>
                <li><a href="settings.html" class="${currentPage === 'settings' ? 'active' : ''}"><i class='bx bxs-cog'></i> Settings</a></li>
            </ul>
        </nav>
        <div class="sidebar-footer">
             <a href="developer.html" class="${currentPage === 'developer' ? 'active' : ''}"><i class='bx bxs-user-circle'></i> Developer</a>
        </div>`;
}

function renderFooter() {
    const footer = document.querySelector('.main-footer');
    if (!footer) return;
    const { userName, userTitle, userImage } = state.settings;
    footer.innerHTML = `
        <img src="${userImage}" alt="${userName}" class="footer-profile-pic">
        <p class="footer-name">${userName}</p>
        <p class="footer-title">${userTitle}</p>`;
}

function renderDashboardPage() {
    const headerUserName = document.getElementById('headerUserName');
    if(headerUserName) headerUserName.textContent = state.settings.userName.split(' ')[0];
    
    const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    document.getElementById('currentBalance').textContent = formatCurrency(income - expense);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expense);
    document.getElementById('transactionCount').textContent = state.transactions.length;
    
    updateFinancialHealthRing(income, expense);
    renderCashFlowChart(document.getElementById('cashFlowChart'));
    
    const recentList = document.getElementById('recentTransactionsList');
    if (recentList) {
        recentList.innerHTML = state.transactions.slice(0, 5).map(t => {
            const category = getCategoryById(t.category);
            return `<li class="activity-item">
                        <div class="activity-icon"><i class='bx ${category?.icon || 'bx-question-mark'}'></i></div>
                        <div class="activity-details"><span>${t.description}</span><small>${t.date.toLocaleDateString()}</small></div>
                        <strong class="activity-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</strong>
                    </li>`
        }).join('') || `<li>No recent transactions.</li>`;
    }
}

function updateFinancialHealthRing(income, expense) {
    const ring = document.getElementById('health-ring-circle');
    const scoreText = document.getElementById('health-score');
    if (!ring || !scoreText) return;
    
    let score = income > 0 ? Math.max(0, Math.round((1 - (expense / income)) * 100)) : 0;
    ring.style.strokeDashoffset = 100 - score;
    scoreText.textContent = `${score}%`;
    if (score < 30) ring.style.stroke = 'var(--danger-color)';
    else if (score < 60) ring.style.stroke = 'var(--accent-color)';
    else ring.style.stroke = 'var(--success-color)';
}

function renderCashFlowChart(canvas) { /* ... আগের উত্তর থেকে সম্পূর্ণ কোড ... */ }

function renderTransactionsPage() {
    const tableBody = document.getElementById('transactionTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = state.transactions.map(t => {
        const category = getCategoryById(t.category);
        return `
            <tr>
                <td><input type="checkbox" data-id="${t.id}"></td>
                <td>${t.date.toLocaleDateString()}</td>
                <td>${t.description}</td>
                <td><i class='bx ${category?.icon}'></i> ${category?.name || 'N/A'}</td>
                <td class="amount ${t.type}">${formatCurrency(t.amount)}</td>
                <td class="action-buttons">
                    <button onclick="openModal('${t.id}')" title="Edit"><i class='bx bxs-edit'></i></button>
                    <button onclick="deleteTransaction('${t.id}')" title="Delete"><i class='bx bxs-trash'></i></button>
                </td>
            </tr>`;
    }).join('') || `<tr><td colspan="6" style="text-align:center;">No transactions found.</td></tr>`;
}

function openModal(transactionId = null) {
    state.ui.editingTransactionId = transactionId;
    const transaction = transactionId ? state.transactions.find(t => t.id === transactionId) : {};
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;
    
    const incomeCategories = state.categories.filter(c => c.type === 'income');
    const expenseCategories = state.categories.filter(c => c.type === 'expense');

    modalContainer.innerHTML = `
        <div class="modal-overlay visible">
            <div class="modal">
                <div class="modal-header"><h2>${transactionId ? 'Edit' : 'Add'} Transaction</h2><button class="icon-btn" onclick="closeModal()"><i class='bx bx-x'></i></button></div>
                <form id="transaction-form">
                    <div class="form-group"><label>Type</label><select name="type" id="type-selector" required>${['expense', 'income'].map(v => `<option value="${v}" ${transaction.type === v ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Description</label><input type="text" name="description" value="${transaction.description || ''}" required></div>
                    <div class="form-group"><label>Amount</label><input type="number" step="0.01" name="amount" value="${transaction.amount || ''}" required></div>
                    <div class="form-group"><label>Category</label><select name="category" id="category-selector" required></select></div>
                    <div class="form-group"><label>Date</label><input type="date" name="date" value="${transaction.date ? transaction.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required></div>
                    <button type="submit" class="fab">${transactionId ? 'Update Transaction' : 'Add Transaction'}</button>
                </form>
            </div>
        </div>`;
    
    const typeSelector = document.getElementById('type-selector');
    const categorySelector = document.getElementById('category-selector');
    const updateCategories = () => {
        const categories = typeSelector.value === 'income' ? incomeCategories : expenseCategories;
        categorySelector.innerHTML = categories.map(c => `<option value="${c.id}" ${transaction.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
    };
    updateCategories();
    typeSelector.addEventListener('change', updateCategories);
    document.getElementById('transaction-form').addEventListener('submit', e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.target).entries()); data.amount = parseFloat(data.amount); addOrUpdateTransaction(data); });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 400);
    }
}
function showToast(message, type = 'success') { /* ... আগের উত্তর থেকে সম্পূর্ণ কোড ... */ }