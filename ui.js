// ui.js
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <div class="flex items-center justify-center p-4 border-b border-slate-200 dark:border-slate-700">
            <img src="${CONFIG.APP_LOGO}" alt="Logo" class="h-10 w-10 mr-2"><h1 class="text-xl font-bold">I Expanse</h1>
        </div>
        <nav class="mt-4 flex-1">
            <a href="#" data-page="dashboard" class="nav-link flex items-center px-6 py-3"><i class='bx bxs-dashboard mr-3'></i> Dashboard</a>
            <a href="#" data-page="transactions" class="nav-link flex items-center px-6 py-3"><i class='bx bx-list-ul mr-3'></i> Transactions</a>
            <a href="#" data-page="reports" class="nav-link flex items-center px-6 py-3"><i class='bx bxs-report mr-3'></i> Reports</a>
            <a href="#" data-page="developer" class="nav-link flex items-center px-6 py-3"><i class='bx bx-code-alt mr-3'></i> Developer</a>
        </nav>
        <div class="p-4"><button id="theme-toggle" class="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700"><i class='bx ${state.settings.darkMode ? 'bxs-sun' : 'bxs-moon'} mr-2'></i><span id="theme-text">${state.settings.darkMode ? 'Light' : 'Dark'} Mode</span></button></div>`;
    document.getElementById('theme-toggle').onclick = toggleTheme;
    updateActiveNavLink();
}
function updateActiveNavLink() { document.querySelectorAll('.nav-link').forEach(link => { link.classList.toggle('bg-teal-50 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400', link.dataset.page === state.ui.currentPage); }); }
function renderPageTitle() { const title = state.ui.currentPage.charAt(0).toUpperCase() + state.ui.currentPage.slice(1); document.getElementById('page-title-container').innerHTML = `<h2>${title}</h2>`; }
function renderPageContent() {
    const content = document.getElementById('page-content');
    if (state.ui.currentPage === 'dashboard') content.innerHTML = getDashboardTemplate();
    else if (state.ui.currentPage === 'transactions') content.innerHTML = getTransactionsTemplate();
    else if (state.ui.currentPage === 'reports') content.innerHTML = getReportsTemplate();
    else if (state.ui.currentPage === 'developer') content.innerHTML = getDeveloperTemplate();
    // After rendering, populate data
    if (state.ui.currentPage === 'dashboard') renderDashboardData();
    else if (state.ui.currentPage === 'transactions') renderTransactionsData();
    else if (state.ui.currentPage === 'reports') renderReportsData();
    else if (state.ui.currentPage === 'developer') renderDeveloperData();
}
// Templates for each page...
function getDashboardTemplate() { return `...`; } // Placeholder, UI generation is complex
function renderDashboardData() { /* ... */ } // Placeholder
//... all other templates and data renderers
function openModal(id = null) {
    state.ui.editingTransactionId = id;
    const t = id ? state.transactions.find(t => t.id === id) : {};
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `<div id="transaction-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md p-6"><h3 class="text-xl font-bold mb-4">${id ? 'Edit' : 'Add'} Transaction</h3><form id="transaction-form"> ... </form></div></div>`;
    // Add form submission logic
}
function closeModal() { document.getElementById('modal-container').innerHTML = ''; }
function showToast(message, className) { const toast = document.createElement('div'); toast.className = `toast p-4 rounded-lg text-white shadow-lg mb-2 ${className}`; toast.textContent = message; document.getElementById('toast-container').appendChild(toast); setTimeout(() => toast.remove(), 3000); }