// state.js
let state = {
    transactions: [],
    categories: { income: [], expense: [] },
    settings: { currency: CONFIG.DEFAULT_CURRENCY, darkMode: false },
    ui: { currentPage: 'dashboard', isSidebarOpen: false, editingTransactionId: null, filter: {} }
};

function loadState() {
    const savedState = localStorage.getItem('iExpanseTrackerState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state = { ...state, ...parsed, categories: parsed.categories && parsed.categories.income.length > 0 ? parsed.categories : CONFIG.INITIAL_CATEGORIES, settings: { ...state.settings, ...parsed.settings } };
        state.transactions = state.transactions.map(t => ({ ...t, date: new Date(t.date) }));
    } else { state.categories = CONFIG.INITIAL_CATEGORIES; }
}
function saveState() { localStorage.setItem('iExpanseTrackerState', JSON.stringify(state)); }