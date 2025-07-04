document.addEventListener('DOMContentLoaded', () => {

    // --- SECTION 1: CONFIG & STATE MANAGEMENT ---
    const CONFIG = {
        APP_NAME: "I Expanse Tracker",
        DEVELOPER: { NAME: "Md Habibur Rahman Mahi", TITLE: "Founder and CEO of Infinity Group", PHOTO: "images/Picsart_24-12-22_22-58-18-749.png", WHATSAPP: "01727722018", TELEGRAM: "01727722018", INSTAGRAM: "https://www.instagram.com/h.r_mahi_?igsh=Z242dWFtcDZwdjF2", FACEBOOK: "https://www.facebook.com/share/1L8yaf25bk/", GROUP_INFO: "Infinity Group is dedicated to building innovative, user-centric digital solutions. Our vision is to empower people through technology, from Bangladesh to the world." },
        LOGO_PATH: "images/image (4).png",
        CURRENCY_SYMBOL: "৳",
    };
    const STORAGE_KEY = 'iExpanseTracker_v4';
    let state = {};
    let expenseChart, monthlyChart;

    const DOMElements = {
        sidebar: document.getElementById('sidebar'),
        pageTitle: document.getElementById('page-title'),
        // Add more common elements if needed
    };

    function loadState() {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            state = JSON.parse(savedState);
        } else {
            state = {
                transactions: [{ id: Date.now() + 1, type: 'income', description: 'Sample Salary', amount: 50000, category: 'Salary', date: new Date().toISOString().split('T')[0] }],
                categories: { income: ["Salary", "Bonus", "Gift"], expense: ["Food", "Transport", "Bills", "Shopping"] },
                budgets: [{ category: 'Food', amount: 8000 }],
                settings: { darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches },
            };
            saveState();
        }
    }
    function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

    // --- SECTION 2: CORE APP LOGIC ---
    function initApp() {
        loadState();
        renderAppShell();
        applyTheme(state.settings.darkMode);
        setupEventListeners();

        const initialPage = window.location.hash.substring(1) || 'dashboard';
        navigateTo(initialPage);

        setTimeout(() => document.getElementById('splash-screen').classList.add('fade-out'), 1500);
        lucide.createIcons();
    }

    function navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById(pageId)?.classList.remove('hidden');

        DOMElements.pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });
        
        window.location.hash = pageId;
        refreshPageContent(pageId);
        if (window.innerWidth < 768) DOMElements.sidebar.classList.add('-translate-x-full');
    }

    function refreshPageContent(pageId) {
        switch (pageId) {
            case 'dashboard': renderDashboard(); break;
            case 'transactions': renderTransactionPage(); break;
            case 'budgets': renderBudgetsPage(); break;
            case 'settings': renderSettingsPage(); break;
        }
        lucide.createIcons();
    }

    // --- SECTION 3: EVENT LISTENERS ---
    function setupEventListeners() {
        // Global
        document.getElementById('sidebar-toggle').addEventListener('click', () => DOMElements.sidebar.classList.toggle('-translate-x-full'));
        document.getElementById('theme-toggle').addEventListener('click', handleThemeToggle);
        document.getElementById('add-transaction-btn').addEventListener('click', () => showTransactionModal());
        
        // Navigation
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

        // Page specific event delegation
        document.body.addEventListener('click', handleDelegatedClicks);

        // Forms
        document.getElementById('add-budget-form').addEventListener('submit', handleBudgetFormSubmit);
        document.getElementById('add-category-form').addEventListener('submit', handleCategoryFormSubmit);
        document.getElementById('generate-report-btn').addEventListener('click', handleReportGeneration);
        document.getElementById('reset-app-btn').addEventListener('click', handleResetApp);
    }

    function handleDelegatedClicks(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const { id, action, category, type } = target.dataset;

        if (action === 'edit-tx') showTransactionModal(state.transactions.find(t => t.id === parseInt(id)));
        if (action === 'delete-tx') handleDeleteTransaction(parseInt(id));
        if (action === 'delete-budget') handleDeleteBudget(category);
        if (action === 'delete-category') handleDeleteCategory(type, category);
    }
    
    // --- SECTION 4: HANDLERS ---
    const handleThemeToggle = () => { state.settings.darkMode = !state.settings.darkMode; saveState(); applyTheme(state.settings.darkMode); };
    const handleDeleteTransaction = (id) => { if (confirm('Delete this transaction?')) { state.transactions = state.transactions.filter(t => t.id !== id); saveState(); refreshPageContent('transactions'); } };
    const handleDeleteBudget = (cat) => { if (confirm(`Delete budget for ${cat}?`)) { state.budgets = state.budgets.filter(b => b.category !== cat); saveState(); renderBudgetsPage(); } };
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
        if (!transaction.description || !transaction.amount) { alert('Fill all fields'); return; }

        if (id) {
            const index = state.transactions.findIndex(t => t.id === id);
            state.transactions[index] = { ...transaction, id };
        } else {
            state.transactions.push({ ...transaction, id: Date.now() });
        }
        saveState();
        hideTransactionModal();
        refreshPageContent(window.location.hash.substring(1) || 'dashboard');
    }

    function handleBudgetFormSubmit(e) {
        e.preventDefault();
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        if (!category || !amount) { alert('Please select category and amount.'); return; }
        updateBudget(category, amount);
        renderBudgetsPage();
        e.target.reset();
    }
    
    function handleCategoryFormSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('new-category-name').value.trim();
        const type = document.getElementById('new-category-type').value;
        if (name) {
            state.categories[type].push(name);
            saveState();
            renderSettingsPage();
            e.target.reset();
        }
    }

    function handleReportGeneration() {
        const start = document.getElementById('start-date').value;
        const end = document.getElementById('end-date').value;
        if (!start || !end) { alert('Please select dates.'); return; }
        generatePDFReport(start, end);
    }
    
    function handleResetApp() {
        if (confirm('DANGER! This will delete ALL data. Are you sure?')) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        }
    }


    // --- SECTION 5: RENDER FUNCTIONS ---
    const formatCurrency = (amount) => `${CONFIG.CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`;

    function renderDashboard() {
        const tx = state.transactions;
        const income = tx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = tx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        document.getElementById('total-income').textContent = formatCurrency(income);
        document.getElementById('total-expense').textContent = formatCurrency(expense);
        document.getElementById('total-balance').textContent = formatCurrency(income - expense);
        
        const recentList = document.getElementById('recent-transaction-list');
        recentList.innerHTML = tx.slice(0, 5).map(t => `
            <tr class="border-b dark:border-slate-700">
                <td class="py-3 px-2 font-medium">${t.description}</td>
                <td class="py-3 px-2 hidden sm:table-cell text-slate-500">${t.category}</td>
                <td class="py-3 px-2 hidden md:table-cell text-slate-500">${new Date(t.date).toLocaleDateString()}</td>
                <td class="py-3 px-2 text-right font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(t.amount)}</td>
            </tr>`).join('');
        renderCharts();
    }

    function renderTransactionPage() {
        const list = document.getElementById('all-transactions-list');
        list.innerHTML = state.transactions.map(t => `
            <tr class="border-b dark:border-slate-700">
                <td class="py-3 px-2"><div class="font-medium">${t.description}</div><div class="text-xs text-slate-500">${t.category}</div></td>
                <td class="py-3 px-2 hidden sm:table-cell">${new Date(t.date).toLocaleDateString()}</td>
                <td class="py-3 px-2 text-right font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(t.amount)}</td>
                <td class="py-3 px-2 text-right">
                    <button class="p-1 hover:text-blue-500" data-action="edit-tx" data-id="${t.id}"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>
                    <button class="p-1 hover:text-red-500" data-action="delete-tx" data-id="${t.id}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                </td>
            </tr>`).join('');
    }

    function renderBudgetsPage() {
        document.getElementById('budget-category').innerHTML = state.categories.expense.map(c => `<option value="${c}">${c}</option>`).join('');
        
        const expensesThisMonth = state.transactions.filter(t => {
            const tDate = new Date(t.date);
            const today = new Date();
            return t.type === 'expense' && tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
        });

        document.getElementById('budgets-list').innerHTML = state.budgets.map(b => {
            const spent = expensesThisMonth.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0);
            const percentage = (spent / b.amount) * 100;
            let color = 'progress-green';
            if (percentage > 75) color = 'progress-yellow';
            if (percentage > 100) color = 'progress-red';
            return `<div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg"><div class="flex justify-between items-center mb-2"><span class="font-semibold">${b.category}</span><button class="text-red-500" data-action="delete-budget" data-category="${b.category}"><i data-lucide="x" class="w-4 h-4 pointer-events-none"></i></button></div><progress class="${color}" value="${spent}" max="${b.amount}"></progress><div class="text-sm text-slate-500 mt-2 flex justify-between"><span>${formatCurrency(spent)} of ${formatCurrency(b.amount)}</span><span>${percentage.toFixed(0)}%</span></div></div>`;
        }).join('');
    }

    function renderSettingsPage() {
        const renderList = (type) => state.categories[type].map(c => `<div class="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded"><span>${c}</span><button class="text-red-400" data-action="delete-category" data-type="${type}" data-category="${c}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></div>`).join('');
        document.getElementById('income-categories-list').innerHTML = renderList('income');
        document.getElementById('expense-categories-list').innerHTML = renderList('expense');
    }

    function renderAppShell() {
        document.getElementById('footer-text').innerHTML = `© ${new Date().getFullYear()} ${CONFIG.DEVELOPER.NAME}`;
        const devPage = document.getElementById('developer');
        devPage.querySelector('#dev-photo').src = CONFIG.DEVELOPER.PHOTO;
        devPage.querySelector('#dev-name').textContent = CONFIG.DEVELOPER.NAME;
        devPage.querySelector('#dev-title').textContent = CONFIG.DEVELOPER.TITLE;
        devPage.querySelector('#dev-group-info').textContent = CONFIG.DEVELOPER.GROUP_INFO;
        devPage.querySelector('#dev-whatsapp').href = `https://wa.me/880${CONFIG.DEVELOPER.WHATSAPP}`;
        devPage.querySelector('#dev-telegram').href = `https://t.me/+880${CONFIG.DEVELOPER.TELEGRAM}`;
        devPage.querySelector('#dev-instagram').href = CONFIG.DEVELOPER.INSTAGRAM;
        devPage.querySelector('#dev-facebook').href = CONFIG.DEVELOPER.FACEBOOK;
    }
    
    // --- UTILS & HELPERS ---
    const updateBudget = (cat, amt) => { const b = state.budgets.find(b => b.category === cat); if (b) b.amount = amt; else state.budgets.push({ category: cat, amount: amt }); saveState(); };
    const applyTheme = (isDark) => { document.documentElement.classList.toggle('dark', isDark); document.getElementById('theme-text').textContent = isDark ? 'Light Mode' : 'Dark Mode'; renderCharts(); };

    function showTransactionModal(tx = null) {
        document.getElementById('transaction-form').reset();
        document.getElementById('transaction-id').value = tx ? tx.id : '';
        document.getElementById('modal-title').textContent = tx ? 'Edit Transaction' : 'Add Transaction';
        if (tx) {
            document.getElementById('type').value = tx.type;
            document.getElementById('description').value = tx.description;
            document.getElementById('amount').value = tx.amount;
            document.getElementById('date').value = tx.date;
        } else {
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        }
        populateCategorySelect(tx ? tx.type : 'expense');
        if (tx) document.getElementById('category').value = tx.category;
        document.getElementById('transaction-modal').classList.remove('hidden');
    }

    function hideTransactionModal() { document.getElementById('transaction-modal').classList.add('hidden'); }
    function populateCategorySelect(type) { document.getElementById('category').innerHTML = state.categories[type].map(c => `<option value="${c}">${c}</option>`).join(''); }

    function renderCharts() { /* Abridged, similar to before */ }
    function generatePDFReport(start, end) { /* Abridged, similar to before */ }

    // --- START THE APP ---
    initApp();
});