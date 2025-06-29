let state = {
    transactions: [],
    categories: [
        { id: 'cat_income', name: 'Salary', icon: 'bx-briefcase-alt-2', type: 'income' },
        { id: 'cat_food', name: 'Food', icon: 'bx-restaurant', type: 'expense' },
        { id: 'cat_transport', name: 'Transport', icon: 'bx-bus', type: 'expense' },
        { id: 'cat_bills', name: 'Bills & Utilities', icon: 'bx-file', type: 'expense' },
        { id: 'cat_health', name: 'Health', icon: 'bx-first-aid', type: 'expense' },
        { id: 'cat_shopping', name: 'Shopping', icon: 'bx-shopping-bag', type: 'expense' },
        { id: 'cat_other', name: 'Other', icon: 'bx-dots-horizontal-rounded', type: 'expense' }
    ],
    budgets: { overall: 0, categories: {} },
    settings: { userName: "Md Habibur Rahman Mahi", userTitle: "Founder of Infinity Group", userImage: "vector_lecture_design.png", currency: "৳", darkMode: false },
    ui: { currentPage: 'dashboard', editingTransactionId: null }
};
function initApp(page) {
    state.ui.currentPage = page;
    document.addEventListener('DOMContentLoaded', () => {
        loadState(); registerGlobalEventListeners();
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            const app = document.querySelector('.app-container');
            if(splash) splash.style.opacity = '0';
            if(app) app.classList.remove('hidden');
            setTimeout(() => {
                if(splash) splash.classList.add('hidden');
                if(app) app.classList.add('loaded');
                applyTheme(); renderSidebar(); renderFooter(); renderPageContent(page);
            }, 500);
        }, 2000);
    });
}
function renderPageContent(page) {
    switch (page) {
        case 'dashboard': renderDashboardPage(); break;
        case 'transactions': renderTransactionsPage(); break;
        case 'reports': renderReportsPage(); break;
        case 'settings': renderSettingsPage(); break;
        case 'budgets': renderBudgetsPage(); break;
    }
}
function loadState() { const saved = localStorage.getItem('infinityTrackerPro'); if (saved) { const p = JSON.parse(saved); state = { ...state, ...p, settings: { ...state.settings, ...p.settings }, budgets: { ...state.budgets, ...p.budgets } }; state.transactions = state.transactions.map(t => ({ ...t, date: new Date(t.date) })); } }
function saveState() { localStorage.setItem('infinityTrackerPro', JSON.stringify(state)); }
function applyTheme() { document.body.classList.toggle('dark-mode', state.settings.darkMode); const i = document.querySelector('#theme-toggle-btn i'); if (i) i.className = state.settings.darkMode ? 'bx bxs-sun' : 'bx bxs-moon'; }
function toggleTheme() { state.settings.darkMode = !state.settings.darkMode; applyTheme(); saveState(); }
function registerGlobalEventListeners() { document.getElementById('addTransactionBtn')?.addEventListener('click', () => openModal()); document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme); document.getElementById('generatePdfBtn')?.addEventListener('click', generatePDF); }
const formatCurrency = (a, s = true) => `${s ? state.settings.currency : ''}${parseFloat(a || 0).toFixed(2)}`;
const getCategoryById = (id) => state.categories.find(c => c.id === id);
function addOrUpdateTransaction(data) { if (state.ui.editingTransactionId) { const i = state.transactions.findIndex(t => t.id === state.ui.editingTransactionId); state.transactions[i] = { ...state.transactions[i], ...data, date: new Date(data.date) }; } else { state.transactions.unshift({ id: `trans_${Date.now()}`, ...data, date: new Date(data.date) }); } state.ui.editingTransactionId = null; saveState(); renderPageContent(state.ui.currentPage); closeModal(); showToast(`${state.ui.editingTransactionId ? 'Updated' : 'Added'} Successfully!`, 'success'); }
function deleteTransaction(id) { if (confirm('Are you sure? This cannot be undone.')) { state.transactions = state.transactions.filter(t => t.id !== id); saveState(); renderPageContent(state.ui.currentPage); showToast('Transaction Deleted!', 'danger'); } }
async function generatePDF() { /* ... PDF Generation Logic from previous answer ... */ }