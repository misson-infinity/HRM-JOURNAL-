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
    settings: {
        userName: "Md Habibur Rahman Mahi", userTitle: "Founder of Infinity Group", userImage: "vector_lecture_design.png",
        currency: "৳", darkMode: false
    },
    ui: { currentPage: 'dashboard', editingTransactionId: null }
};

function initApp(page) {
    state.ui.currentPage = page;
    loadState();
    applyTheme();
    renderSidebar();
    renderFooter();
    renderPageContent(page);
    registerGlobalEventListeners();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
}

function renderPageContent(page) {
    switch (page) {
        case 'dashboard': renderDashboardPage(); break;
        case 'transactions': renderTransactionsPage(); break;
    }
}

function loadState() {
    const saved = localStorage.getItem('infinityTrackerPro');
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed, settings: { ...state.settings, ...parsed.settings } };
        state.transactions = state.transactions.map(t => ({ ...t, date: new Date(t.date) }));
    }
}
function saveState() { localStorage.setItem('infinityTrackerPro', JSON.stringify(state)); }

function applyTheme() {
    document.body.classList.toggle('dark-mode', state.settings.darkMode);
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) themeIcon.className = state.settings.darkMode ? 'bx bxs-sun' : 'bx bxs-moon';
}
function toggleTheme() { state.settings.darkMode = !state.settings.darkMode; applyTheme(); saveState(); }

function registerGlobalEventListeners() {
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => openModal());
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
}

const formatCurrency = (amount) => `${state.settings.currency}${parseFloat(amount || 0).toFixed(2)}`;
const getCategoryById = (id) => state.categories.find(c => c.id === id);

function addOrUpdateTransaction(data) {
    if (state.ui.editingTransactionId) {
        const index = state.transactions.findIndex(t => t.id === state.ui.editingTransactionId);
        state.transactions[index] = { ...state.transactions[index], ...data };
    } else {
        const newTransaction = { id: `trans_${Date.now()}`, ...data, date: new Date(data.date) };
        state.transactions.unshift(newTransaction);
    }
    state.ui.editingTransactionId = null;
    saveState();
    renderPageContent(state.ui.currentPage);
    closeModal();
}

function deleteTransaction(id) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState();
    renderPageContent(state.ui.currentPage);
}