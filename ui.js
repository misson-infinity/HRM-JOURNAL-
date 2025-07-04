// ui.js
"use strict";

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = `
        <div class="flex items-center justify-center p-4 border-b border-slate-200 dark:border-slate-700">
            <img src="${CONFIG.APP_LOGO}" alt="Logo" class="h-10 w-10 mr-2 rounded-full"><h1 class="text-xl font-bold">I Expanse</h1>
        </div>
        <nav class="mt-4 flex-1">
            <a href="#" data-page="dashboard" class="nav-link flex items-center px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/50"><i class='bx bxs-dashboard mr-3'></i> Dashboard</a>
            <a href="#" data-page="transactions" class="nav-link flex items-center px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/50"><i class='bx bx-list-ul mr-3'></i> Transactions</a>
            <a href="#" data-page="reports" class="nav-link flex items-center px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/50"><i class='bx bxs-report mr-3'></i> Reports</a>
            <a href="#" data-page="developer" class="nav-link flex items-center px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/50"><i class='bx bx-code-alt mr-3'></i> Developer</a>
        </nav>
        <div class="p-4"><button id="theme-toggle" class="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"><i class='bx ${state.settings.darkMode ? 'bxs-sun' : 'bxs-moon'} mr-2'></i><span>${state.settings.darkMode ? 'Light' : 'Dark'} Mode</span></button></div>`;
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

function updateActiveNavLink() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('bg-teal-50', link.dataset.page === state.ui.currentPage);
        link.classList.toggle('dark:bg-teal-900/50', link.dataset.page === state.ui.currentPage);
        link.classList.toggle('text-teal-600', link.dataset.page === state.ui.currentPage);
        link.classList.toggle('dark:text-teal-400', link.dataset.page === state.ui.currentPage);
    });
}

function renderPageTitle() {
    const title = state.ui.currentPage.charAt(0).toUpperCase() + state.ui.currentPage.slice(1);
    document.getElementById('page-title-container').innerHTML = `<h2>${title}</h2>`;
}

function renderPageContent() {
    const content = document.getElementById('page-content');
    if (state.ui.currentPage === 'dashboard') content.innerHTML = getDashboardTemplate();
    else if (state.ui.currentPage === 'transactions') content.innerHTML = getTransactionsTemplate();
    else if (state.ui.currentPage === 'reports') content.innerHTML = getReportsTemplate();
    else if (state.ui.currentPage === 'developer') content.innerHTML = getDeveloperTemplate();
    if (state.ui.currentPage === 'dashboard') renderDashboardData();
    else if (state.ui.currentPage === 'transactions') renderTransactionsData();
    else if (state.ui.currentPage === 'reports') renderReportsData();
    else if (state.ui.currentPage === 'developer') renderDeveloperData();
}

function getDashboardTemplate() {
    return `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"><div class="glass-card p-6 rounded-xl shadow-md flex items-center col-span-1 md:col-span-1"><div class="p-3 bg-green-100 dark:bg-green-900/50 rounded-full mr-4"><i class='bx bx-log-in text-green-500'></i></div><div><p class="text-sm text-slate-500">Total Income</p><p id="total-income" class="text-2xl font-bold"></p></div></div><div class="glass-card p-6 rounded-xl shadow-md flex items-center col-span-1 md:col-span-1"><div class="p-3 bg-red-100 dark:bg-red-900/50 rounded-full mr-4"><i class='bx bx-log-out text-red-500'></i></div><div><p class="text-sm text-slate-500">Total Expense</p><p id="total-expense" class="text-2xl font-bold"></p></div></div><div class="glass-card p-6 rounded-xl shadow-md flex items-center col-span-1 md:col-span-1"><div class="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-4"><i class='bx bx-wallet text-blue-500'></i></div><div><p class="text-sm text-slate-500">Balance</p><p id="total-balance" class="text-2xl font-bold"></p></div></div></div><div class="glass-card p-6 rounded-xl shadow-md"><h3 class="text-lg font-semibold mb-4">Recent Transactions</h3><div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="border-b dark:border-slate-700"><th class="py-2">Description</th><th class="py-2">Category</th><th class="py-2">Date</th><th class="py-2 text-right">Amount</th></tr></thead><tbody id="transaction-list"></tbody></table></div></div>`;
}
function renderDashboardData() {
    const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expense').textContent = formatCurrency(expense);
    document.getElementById('total-balance').textContent = formatCurrency(income - expense);
    const list = document.getElementById('transaction-list');
    list.innerHTML = state.transactions.sort((a,b) => b.date - a.date).slice(0, 5).map(t => { const cat = getCategoryById(t.category, t.type); return `<tr class="border-b dark:border-slate-700 ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}"><td class="py-3 font-medium text-slate-800 dark:text-slate-200">${t.description}</td><td>${cat?.name}</td><td>${t.date.toLocaleDateString()}</td><td class="text-right font-semibold">${formatCurrency(t.amount)}</td></tr>`}).join('') || `<tr><td colspan="4" class="text-center py-4 text-slate-500">No transactions yet.</td></tr>`;
}

function getTransactionsTemplate() { return `...`; }
function renderTransactionsData() { /* ... */ }
function getReportsTemplate() { return `...`; }
function renderReportsData() { /* ... */ }
function getDeveloperTemplate() {
    return `<div class="glass-card p-6 md:p-8 rounded-xl shadow-md text-center"><img src="${CONFIG.DEVELOPER_PHOTO}" alt="Developer" class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-teal-500"><h2 class="text-2xl font-bold">${CONFIG.DEVELOPER_NAME}</h2><h3 class="text-lg text-teal-500 font-semibold mb-4">${CONFIG.DEVELOPER_TITLE}</h3><p class="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 mb-6">Infinity Group is dedicated to building innovative digital solutions.</p><div id="social-links" class="flex justify-center space-x-4"></div></div>`;
}
function renderDeveloperData() {
    const links = document.getElementById('social-links');
    links.innerHTML = `
        <a href="https://wa.me/${CONFIG.CONTACT.WHATSAPP}" target="_blank" class="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><i class='bx bxl-whatsapp text-2xl text-green-500'></i></a>
        <a href="https://t.me/+${CONFIG.CONTACT.TELEGRAM}" target="_blank" class="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><i class='bx bxl-telegram text-2xl text-sky-500'></i></a>
        <a href="${CONFIG.CONTACT.INSTAGRAM}" target="_blank" class="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><i class='bx bxl-instagram text-2xl text-pink-500'></i></a>
        <a href="${CONFIG.CONTACT.FACEBOOK}" target="_blank" class="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><i class='bx bxl-facebook text-2xl text-blue-600'></i></a>
    `;
}

function openModal(id = null) {
    state.ui.editingTransactionId = id;
    const t = id ? state.transactions.find(t => t.id === id) : {};
    document.getElementById('modal-container').innerHTML = `
        <div id="transaction-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md p-6">
                <h3 class="text-xl font-bold mb-4">${id ? 'Edit' : 'Add'} Transaction</h3>
                <form id="transaction-form">
                    <input type="hidden" id="transaction-id" value="${t.id || ''}">
                    <div class="mb-4"><label for="type" class="block text-sm font-medium mb-1">Type</label><select id="type" class="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">${['expense', 'income'].map(v => `<option value="${v}" ${t.type === v ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('')}</select></div>
                    <div class="mb-4"><label for="description" class="block text-sm font-medium mb-1">Description</label><input type="text" id="description" value="${t.description || ''}" class="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg" required></div>
                    <div class="mb-4"><label for="amount" class="block text-sm font-medium mb-1">Amount</label><input type="number" id="amount" value="${t.amount || ''}" class="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg" required></div>
                    <div class="mb-4"><label for="category" class="block text-sm font-medium mb-1">Category</label><select id="category" class="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg" required></select></div>
                    <div class="mb-4"><label for="date" class="block text-sm font-medium mb-1">Date</label><input type="date" id="date" value="${t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" class="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg" required></div>
                    <div class="flex justify-end space-x-2"><button type="button" id="cancel-button" class="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600">Cancel</button><button type="submit" class="px-4 py-2 rounded-lg bg-teal-500 text-white">Save</button></div>
                </form>
            </div>
        </div>
    `;
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const updateCategories = () => { const type = typeSelect.value; categorySelect.innerHTML = state.categories[type].map(c => `<option value="${c.id}" ${t.category === c.id ? 'selected' : ''}>${c.name}</option>`).join(''); };
    updateCategories();
    typeSelect.addEventListener('change', updateCategories);
    document.getElementById('cancel-button').onclick = closeModal;
    document.getElementById('transaction-form').onsubmit = (e) => { e.preventDefault(); addOrUpdateTransaction({ type: typeSelect.value, description: document.getElementById('description').value, amount: document.getElementById('amount').value, category: categorySelect.value, date: document.getElementById('date').value }); };
}
function closeModal() { document.getElementById('modal-container').innerHTML = ''; }
function showToast(message, className) { const toast = document.createElement('div'); toast.className = `toast p-4 rounded-lg text-white shadow-lg mb-2 ${className}`; toast.textContent = message; document.getElementById('toast-container').appendChild(toast); setTimeout(() => toast.remove(), 3000); }