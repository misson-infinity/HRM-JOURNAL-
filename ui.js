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
    if (grid) {
        grid.innerHTML = `
            <div class="card summary-card"><h3>Total Income</h3><p class="amount income">${formatCurrency(income)}</p></div>
            <div class="card summary-card"><h3>Total Expense</h3><p class="amount expense">${formatCurrency(expense)}</p></div>
            <div class="card summary-card"><h3>Balance</h3><p>${formatCurrency(income - expense)}</p></div>`;
    }
    const recentList = document.getElementById('recentTransactionsList');
    if(recentList) {
        recentList.innerHTML = state.transactions.slice(0, 5).map(t => `
            <li>
                <i class='bx ${getCategoryById(t.category)?.icon || 'bx-question-mark'}'></i>
                <div><span>${t.description}</span><small>${new Date(t.date || Date.now()).toLocaleDateString()}</small></div>
                <strong class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</strong>
            </li>`).join('') || `<li>No recent transactions.</li>`;
    }
    renderExpensePieChart(document.getElementById('expensePieChart'));
}

function renderExpensePieChart(canvas) {
    if (!canvas || !window.Chart) return;
    if (window.expenseChartInstance) window.expenseChartInstance.destroy();
    const expenseData = state.transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenseData.reduce((acc, t) => {
        const category = getCategoryById(t.category);
        if (category) acc[category.name] = (acc[category.name] || 0) + t.amount;
        return acc;
    }, {});
    
    window.expenseChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ['#F44336', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0'],
                borderColor: 'var(--card-bg)', borderWidth: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-secondary)' } } }
        }
    });
}