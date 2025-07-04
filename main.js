document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // SECTION 1: CONFIGURATION & STATE MANAGEMENT
    // =================================================================
    const CONFIG = {
        APP_NAME: "I Expanse Tracker",
        DEVELOPER: { NAME: "Md Habibur Rahman Mahi", TITLE: "Founder and CEO of Infinity Group", PHOTO: "images/Picsart_24-12-22_22-58-18-749.png", WHATSAPP: "01727722018", TELEGRAM: "01727722018", INSTAGRAM: "https://www.instagram.com/h.r_mahi_?igsh=Z242dWFtcDZwdjF2", FACEBOOK: "https://www.facebook.com/share/1L8yaf25bk/", GROUP_INFO: "Infinity Group is dedicated to building innovative, user-centric digital solutions. Our vision is to empower people through technology, from Bangladesh to the world." },
        LOGO_PATH: "images/image (4).png",
        CURRENCY_SYMBOL: "৳",
    };
    const STORAGE_KEY = 'iExpanseTracker_v5_Final'; // New version to ensure fresh start
    let state = {};
    let expenseChart, monthlyChart;

    const DOMElements = {
        sidebar: document.getElementById('sidebar'),
        pageTitle: document.getElementById('page-title'),
        mainContent: document.getElementById('main-content')
    };

    function loadState() {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            state = JSON.parse(savedState);
        } else {
            state = {
                transactions: [
                    { id: Date.now() + 1, type: 'income', description: 'Sample Salary', amount: 50000, category: 'Salary', date: new Date().toISOString().split('T')[0] },
                    { id: Date.now() + 2, type: 'expense', description: 'Groceries', amount: 2500, category: 'Food', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] }
                ],
                categories: { income: ["Salary", "Bonus", "Gift"], expense: ["Food", "Transport", "Bills", "Shopping", "Health"] },
                budgets: [{ category: 'Food', amount: 8000 }, { category: 'Shopping', amount: 5000 }],
                settings: { darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches },
            };
        }
        saveState();
    }
    function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

    // =================================================================
    // SECTION 2: CORE APP INITIALIZATION & NAVIGATION
    // =================================================================
    function initApp() {
        loadState();
        renderAppShell();
        applyTheme(state.settings.darkMode, false); // Apply theme without re-rendering charts yet
        setupEventListeners();

        // **FIX:** Correctly handle initial page load based on hash
        const initialPage = window.location.hash.substring(1) || 'dashboard';
        navigateTo(initialPage, true); // `true` to indicate it's the initial load

        setTimeout(() => {
            document.getElementById('splash-screen').classList.add('fade-out');
        }, 1200);
        
        lucide.createIcons();
    }

    function navigateTo(pageId, isInitialLoad = false) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        
        // Show the target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        } else {
            // Fallback to dashboard if page not found
            document.getElementById('dashboard').classList.remove('hidden');
            pageId = 'dashboard';
        }

        // Update title and active nav link
        DOMElements.pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${pageId}`);
        });

        // Update URL hash, but not for the very first load if it's already correct
        if (!isInitialLoad || window.location.hash !== `#${pageId}`) {
            window.location.hash = pageId;
        }

        refreshPageContent(pageId);
        
        // Close sidebar on navigation on mobile
        if (window.innerWidth < 768) {
            DOMElements.sidebar.classList.add('-translate-x-full');
        }
    }

    function refreshPageContent(pageId) {
        // This function will render the content for the currently visible page
        switch (pageId) {
            case 'dashboard': renderDashboard(); break;
            case 'transactions': renderTransactionPage(); break;
            case 'budgets': renderBudgetsPage(); break;
            case 'settings': renderSettingsPage(); break;
        }
        lucide.createIcons();
    }

    // =================================================================
    // SECTION 3: EVENT LISTENERS
    // =================================================================
    function setupEventListeners() {
        // Global
        document.getElementById('sidebar-toggle').addEventListener('click', () => DOMElements.sidebar.classList.toggle('-translate-x-full'));
        document.getElementById('theme-toggle').addEventListener('click', handleThemeToggle);
        document.getElementById('add-transaction-btn').addEventListener('click', () => showTransactionModal());
        
        // Hash change listener for browser back/forward buttons
        window.addEventListener('hashchange', () => {
            const pageId = window.location.hash.substring(1) || 'dashboard';
            navigateTo(pageId);
        });
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('href').substring(1);
                navigateTo(pageId);
            });
        });

        // Modal
        document.getElementById('transaction-form').addEventListener('submit', handleTransactionFormSubmit);
        document.getElementById('cancel-button').addEventListener('click', hideTransactionModal);
        document.getElementById('transaction-modal').addEventListener('click', e => {
            if (e.target.id === 'transaction-modal') hideTransactionModal();
        });
        document.getElementById('type').addEventListener('change', e => populateCategorySelect(e.target.value));

        // Event delegation for dynamically created buttons (EDIT/DELETE)
        DOMElements.mainContent.addEventListener('click', handleDelegatedClicks);

        // Forms
        document.getElementById('add-budget-form').addEventListener('submit', handleBudgetFormSubmit);
        document.getElementById('add-category-form').addEventListener('submit', handleCategoryFormSubmit);
        document.getElementById('generate-report-btn').addEventListener('click', handleReportGeneration);
        document.getElementById('reset-app-btn').addEventListener('click', handleResetApp);
    }

    // =================================================================
    // SECTION 4: EVENT HANDLERS
    // =================================================================
    function handleDelegatedClicks(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const { action, id, category, type } = target.dataset;
        if (!action) return;

        if (action === 'edit-tx') showTransactionModal(state.transactions.find(t => t.id === parseInt(id)));
        if (action === 'delete-tx') handleDeleteTransaction(parseInt(id));
        if (action === 'delete-budget') handleDeleteBudget(category);
        if (action === 'delete-category') handleDeleteCategory(type, category);
    }
    
    const handleThemeToggle = () => { state.settings.darkMode = !state.settings.darkMode; saveState(); applyTheme(state.settings.darkMode, true); };
    const handleDeleteTransaction = (id) => { if (confirm('Are you sure you want to delete this transaction?')) { state.transactions = state.transactions.filter(t => t.id !== id); saveState(); refreshPageContent(window.location.hash.substring(1)); } };
    const handleDeleteBudget = (cat) => { if (confirm(`Delete budget for "${cat}"?`)) { state.budgets = state.budgets.filter(b => b.category !== cat); saveState(); renderBudgetsPage(); } };
    const handleDeleteCategory = (type, cat) => { if (confirm(`Delete category "${cat}"?`)) { state.categories[type] = state.categories[type].filter(c => c !== cat); saveState(); renderSettingsPage(); } };
    
    function handleTransactionFormSubmit(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('transaction-id').value);
        const transaction = {
            type: document.getElementById('type').value,
            description: document.getElementById('description').value.trim(),
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
        };
        if (!transaction.description || isNaN(transaction.amount) || !transaction.category || !transaction.date) { alert('Please fill all fields correctly.'); return; }

        if (id) {
            const index = state.transactions.findIndex(t => t.id === id);
            if (index > -1) state.transactions[index] = { ...transaction, id };
        } else {
            state.transactions.push({ ...transaction, id: Date.now() });
        }
        saveState();
        hideTransactionModal();
        refreshPageContent(window.location.hash.substring(1));
    }

    function handleBudgetFormSubmit(e) { e.preventDefault(); const category = document.getElementById('budget-category').value; const amount = parseFloat(document.getElementById('budget-amount').value); if (!category || isNaN(amount) || amount <= 0) { alert('Please select a category and enter a valid amount.'); return; } const budget = state.budgets.find(b => b.category === category); if (budget) { budget.amount = amount; } else { state.budgets.push({ category, amount }); } saveState(); renderBudgetsPage(); e.target.reset(); }
    function handleCategoryFormSubmit(e) { e.preventDefault(); const name = document.getElementById('new-category-name').value.trim(); const type = document.getElementById('new-category-type').value; if (name) { state.categories[type].push(name); saveState(); renderSettingsPage(); e.target.reset(); } else { alert('Please enter a category name.'); } }
    function handleReportGeneration() { const start = document.getElementById('start-date').value; const end = document.getElementById('end-date').value; if (!start || !end) { alert('Please select both start and end dates.'); return; } generatePDFReport(start, end); }
    function handleResetApp() { if (confirm('DANGER! This action will delete ALL your data permanently. Are you absolutely sure?')) { localStorage.removeItem(STORAGE_KEY); window.location.hash = ''; window.location.reload(); } }

    // =================================================================
    // SECTION 5: RENDER FUNCTIONS
    // =================================================================
    const formatCurrency = (amount) => `${CONFIG.CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    function renderDashboard() {
        const tx = state.transactions;
        const income = tx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = tx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        document.getElementById('total-income').textContent = formatCurrency(income);
        document.getElementById('total-expense').textContent = formatCurrency(expense);
        document.getElementById('total-balance').textContent = formatCurrency(income - expense);
        
        const recentList = document.getElementById('recent-transaction-list');
        recentList.innerHTML = tx.slice(0, 5).map(t => `<tr class="border-b dark:border-slate-700"> <td class="py-3 px-2 font-medium">${t.description}</td> <td class="py-3 px-2 hidden sm:table-cell text-slate-500">${t.category}</td> <td class="py-3 px-2 hidden md:table-cell text-slate-500">${formatDate(t.date)}</td> <td class="py-3 px-2 text-right font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}">${t.type === 'income' ? '+' : ''}${formatCurrency(t.amount)}</td> </tr>`).join('') || `<tr><td colspan="4" class="text-center py-4 text-slate-500">No recent transactions.</td></tr>`;
        renderCharts();
    }

    function renderTransactionPage() {
        const list = document.getElementById('all-transactions-list');
        list.innerHTML = state.transactions.map(t => `<tr class="border-b dark:border-slate-700"> <td class="py-3 px-2"><div class="font-medium">${t.description}</div><div class="text-xs text-slate-500">${t.category}</div></td> <td class="py-3 px-2 hidden sm:table-cell">${formatDate(t.date)}</td> <td class="py-3 px-2 text-right font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(t.amount)}</td> <td class="py-3 px-2 text-right"> <button class="p-1 hover:text-blue-500" data-action="edit-tx" data-id="${t.id}"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button> <button class="p-1 hover:text-red-500" data-action="delete-tx" data-id="${t.id}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button> </td> </tr>`).join('') || `<tr><td colspan="4" class="text-center py-4 text-slate-500">No transactions found.</td></tr>`;
    }

    function renderBudgetsPage() {
        document.getElementById('budget-category').innerHTML = state.categories.expense.map(c => `<option value="${c}">${c}</option>`).join('');
        const expensesThisMonth = state.transactions.filter(t => { const d = new Date(t.date); const now = new Date(); return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
        document.getElementById('budgets-list').innerHTML = state.budgets.map(b => { const spent = expensesThisMonth.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0); const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0; let color = 'progress-green'; if (pct > 75) color = 'progress-yellow'; if (pct > 100) color = 'progress-red'; return `<div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg shadow"><div class="flex justify-between items-center mb-2"><span class="font-semibold">${b.category}</span><button class="text-red-500 hover:text-red-700" data-action="delete-budget" data-category="${b.category}"><i data-lucide="x" class="w-4 h-4 pointer-events-none"></i></button></div><progress class="${color}" value="${spent}" max="${b.amount}"></progress><div class="text-sm text-slate-500 dark:text-slate-400 mt-2 flex justify-between"><span>${formatCurrency(spent)} of ${formatCurrency(b.amount)}</span><span>${pct.toFixed(0)}%</span></div></div>`; }).join('') || `<div class="col-span-full text-center py-4 text-slate-500">No budgets set.</div>`;
    }

    function renderSettingsPage() { const renderList = (type) => state.categories[type].map(c => `<div class="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded"><span>${c}</span><button class="text-red-400 hover:text-red-600" data-action="delete-category" data-type="${type}" data-category="${c}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></div>`).join('') || `<p class="text-slate-500 text-sm">No ${type} categories.</p>`; document.getElementById('income-categories-list').innerHTML = renderList('income'); document.getElementById('expense-categories-list').innerHTML = renderList('expense'); }
    function renderAppShell() { document.getElementById('footer-text').innerHTML = `© ${new Date().getFullYear()} ${CONFIG.DEVELOPER.NAME} | Infinity Group`; const devPage = document.getElementById('developer'); devPage.querySelector('#dev-photo').src = CONFIG.DEVELOPER.PHOTO; devPage.querySelector('#dev-name').textContent = CONFIG.DEVELOPER.NAME; devPage.querySelector('#dev-title').textContent = CONFIG.DEVELOPER.TITLE; devPage.querySelector('#dev-group-info').textContent = CONFIG.DEVELOPER.GROUP_INFO; devPage.querySelector('#dev-whatsapp').href = `https://wa.me/880${CONFIG.DEVELOPER.WHATSAPP}`; devPage.querySelector('#dev-telegram').href = `https://t.me/+880${CONFIG.DEVELOPER.TELEGRAM}`; devPage.querySelector('#dev-instagram').href = CONFIG.DEVELOPER.INSTAGRAM; devPage.querySelector('#dev-facebook').href = CONFIG.DEVELOPER.FACEBOOK; }
    
    // =================================================================
    // SECTION 6: UTILS & HELPERS
    // =================================================================
    function applyTheme(isDark, shouldRenderCharts) { document.documentElement.classList.toggle('dark', isDark); document.getElementById('theme-text').textContent = isDark ? 'Light Mode' : 'Dark Mode'; if(shouldRenderCharts) renderCharts(); }
    function showTransactionModal(tx = null) { const form = document.getElementById('transaction-form'); form.reset(); document.getElementById('transaction-id').value = tx ? tx.id : ''; document.getElementById('modal-title').textContent = tx ? 'Edit Transaction' : 'Add Transaction'; if (tx) { document.getElementById('type').value = tx.type; document.getElementById('description').value = tx.description; document.getElementById('amount').value = tx.amount; document.getElementById('date').value = tx.date; } else { document.getElementById('date').value = new Date().toISOString().split('T')[0]; } populateCategorySelect(tx ? tx.type : 'expense'); if (tx) document.getElementById('category').value = tx.category; document.getElementById('transaction-modal').classList.remove('hidden'); document.getElementById('transaction-modal').classList.add('flex'); }
    function hideTransactionModal() { document.getElementById('transaction-modal').classList.add('hidden'); document.getElementById('transaction-modal').classList.remove('flex'); }
    function populateCategorySelect(type) { document.getElementById('category').innerHTML = state.categories[type].map(c => `<option value="${c}">${c}</option>`).join(''); }
    function renderCharts() { if (!document.getElementById('dashboard').classList.contains('hidden')) { const isDark = state.settings.darkMode; const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'; const labelColor = isDark ? '#cbd5e1' : '#475569'; if (expenseChart) expenseChart.destroy(); if (monthlyChart) monthlyChart.destroy(); const expenseCtx = document.getElementById('expense-chart')?.getContext('2d'); const expenseByCategory = state.transactions.filter(t => t.type === 'expense').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {}); expenseChart = new Chart(expenseCtx, { type: 'doughnut', data: { labels: Object.keys(expenseByCategory), datasets: [{ data: Object.values(expenseByCategory), backgroundColor: ['#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#10b981'], borderColor: isDark ? '#1e293b' : '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: labelColor } } } } }); const monthlyCtx = document.getElementById('monthly-chart')?.getContext('2d'); const monthlyData = state.transactions.reduce((acc, t) => { const month = new Date(t.date).toLocaleString('default', { month: 'short' }); if (!acc[month]) acc[month] = { income: 0, expense: 0 }; acc[month][t.type] += t.amount; return acc; }, {}); const labels = Object.keys(monthlyData).sort((a,b) => new Date(`1 ${a} 2023`) - new Date(`1 ${b} 2023`)); monthlyChart = new Chart(monthlyCtx, { type: 'bar', data: { labels, datasets: [{ label: 'Income', data: labels.map(l => monthlyData[l].income), backgroundColor: '#22c55e' }, { label: 'Expense', data: labels.map(l => monthlyData[l].expense), backgroundColor: '#ef4444' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: labelColor }, grid: { color: gridColor } }, x: { ticks: { color: labelColor }, grid: { color: gridColor } } }, plugins: { legend: { labels: { color: labelColor } } } } }); } }
    function generatePDFReport(startDate, endDate) { const { jsPDF } = window.jspdf; const doc = new jsPDF(); const transactions = state.transactions.filter(t => { const tDate = new Date(t.date); return tDate >= new Date(startDate) && tDate <= new Date(endDate); }); doc.setFontSize(20); doc.text("Financial Report", 14, 22); doc.setFontSize(12); doc.text(`From: ${formatDate(startDate)} To: ${formatDate(endDate)}`, 14, 30); const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0); const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0); const head = [['Date', 'Description', 'Category', 'Type', 'Amount']]; const body = transactions.map(t => [formatDate(t.date), t.description, t.category, t.type.charAt(0).toUpperCase() + t.type.slice(1), formatCurrency(t.amount)]); doc.autoTable({ startY: 50, head: [['Summary', '']], body: [['Total Income', formatCurrency(totalIncome)], ['Total Expense', formatCurrency(totalExpense)], ['Balance', formatCurrency(totalIncome - totalExpense)]] }); doc.autoTable({ startY: doc.lastAutoTable.finalY + 10, head, body }); doc.save(`Report-${startDate}-to-${endDate}.pdf`); }
    
    // =================================================================
    // START THE APP
    // =================================================================
    initApp();
});