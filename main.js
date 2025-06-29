let state = {
    transactions: [],
    categories: [
        { id: 'cat_food', name: 'Food', icon: 'bx-restaurant' }, { id: 'cat_transport', name: 'Transport', icon: 'bx-bus' }, { id: 'cat_bills', name: 'Bills', icon: 'bx-file' },
        { id: 'cat_health', name: 'Health', icon: 'bx-first-aid' }, { id: 'cat_shopping', name: 'Shopping', icon: 'bx-shopping-bag' }, { id: 'cat_income', name: 'Salary', icon: 'bx-briefcase' }
    ],
    settings: {
        userName: "Md Habibur Rahman Mahi", userTitle: "Founder of Infinity Group", userImage: "vector_lecture_design.png", currency: "৳", darkMode: false
    },
    ui: { currentPage: 'dashboard' }
};

function initApp(page) {
    state.ui.currentPage = page;
    loadState();
    applyTheme();
    renderSidebar();
    renderFooter();
    renderPageContent(page);
    registerGlobalEventListeners();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(err => console.error('Service worker registration failed:', err));
    }
}

function renderPageContent(page) {
    switch (page) {
        case 'dashboard': renderDashboardPage(); break;
        // Add other page renderers here
    }
}

function loadState() {
    const savedState = localStorage.getItem('infinityTrackerPro');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        state = { ...state, ...parsedState, settings: { ...state.settings, ...parsedState.settings } };
    }
}
function saveState() { localStorage.setItem('infinityTrackerPro', JSON.stringify(state)); }

function applyTheme() {
    document.body.classList.toggle('dark-mode', state.settings.darkMode);
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if(themeIcon) themeIcon.className = state.settings.darkMode ? 'bx bxs-sun' : 'bx bxs-moon';
}

function toggleTheme() {
    state.settings.darkMode = !state.settings.darkMode;
    applyTheme();
    saveState();
}

function registerGlobalEventListeners() {
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => alert("Add Transaction Modal will open!"));
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
}

const formatCurrency = (amount) => `${state.settings.currency}${parseFloat(amount || 0).toFixed(2)}`;
const getCategoryById = (id) => state.categories.find(c => c.id === id);