function renderSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const { currentPage } = state.ui;
    sidebar.innerHTML = `
        <div class="sidebar-header"><img src="logo.svg" alt="Logo" class="logo"><h2>Infinity</h2></div>
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
    const income = state.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = state.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const grid = document.querySelector('.dashboard-grid');
    if (grid) grid.innerHTML = `
        <div class="card summary-card"><h3>Total Income</h3><p class="amount income">${formatCurrency(income)}</p></div>
        <div class="card summary-card"><h3>Total Expense</h3><p class="amount expense">${formatCurrency(expense)}</p></div>
        <div class="card summary-card"><h3>Balance</h3><p>${formatCurrency(income - expense)}</p></div>`;

    const recentList = document.getElementById('recentTransactionsList');
    if(recentList) recentList.innerHTML = state.transactions.slice(0, 5).map(t => {
        const category = getCategoryById(t.category);
        return `<li><i class='bx ${category?.icon}'></i><div><span>${t.description}</span><small>${t.date.toLocaleDateString()}</small></div><strong class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</strong></li>`
    }).join('') || `<li>No recent transactions.</li>`;
    renderExpensePieChart(document.getElementById('expensePieChart'));
}

function renderTransactionsPage() {
    const tableBody = document.getElementById('transactionTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = state.transactions.map(t => {
        const category = getCategoryById(t.category);
        return `
            <tr>
                <td>${t.date.toLocaleDateString()}</td>
                <td>${t.description}</td>
                <td><i class='bx ${category?.icon}'></i> ${category?.name}</td>
                <td class="amount ${t.type}">${formatCurrency(t.amount)}</td>
                <td class="action-buttons">
                    <button onclick="openModal('${t.id}')"><i class='bx bxs-edit'></i></button>
                    <button onclick="deleteTransaction('${t.id}')"><i class='bx bxs-trash'></i></button>
                </td>
            </tr>`;
    }).join('');
}

function openModal(transactionId = null) {
    state.ui.editingTransactionId = transactionId;
    const transaction = transactionId ? state.transactions.find(t => t.id === transactionId) : {};
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
        <div class="modal-overlay visible">
            <div class="modal">
                <div class="modal-header">
                    <h2>${transactionId ? 'Edit' : 'Add'} Transaction</h2>
                    <button class="icon-btn" onclick="closeModal()"><i class='bx bx-x'></i></button>
                </div>
                <form id="transaction-form">
                    <div class="form-group">
                        <label>Type</label>
                        <select name="type" required>
                            <option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>Expense</option>
                            <option value="income" ${transaction.type === 'income' ? 'selected' : ''}>Income</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" name="description" value="${transaction.description || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" name="amount" value="${transaction.amount || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" required>${state.categories.map(c => `<option value="${c.id}" ${transaction.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" name="date" value="${transaction.date ? transaction.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <button type="submit" class="fab">${transactionId ? 'Update' : 'Add'}</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('transaction-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.amount = parseFloat(data.amount);
        addOrUpdateTransaction(data);
    });
}
function closeModal() { document.getElementById('modal-container').innerHTML = ''; }

function renderExpensePieChart(canvas) { /* আগের মতোই */ }