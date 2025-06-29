// Infinity X - Financial Tracker - Main Logic
// Version: 1.2.0 (Stable Initial Render & Race Condition Fix)
// Author: Generated for Md Habibur Rahman Mahi

"use strict";

// --- GLOBAL STATE ---
let state = {
    transactions: [],
    categories: [
        { id: 'cat_income_salary', name: 'Salary', icon: 'bx-briefcase-alt-2', type: 'income' },
        { id: 'cat_income_bonus', name: 'Bonus/Gift', icon: 'bx-gift', type: 'income' },
        { id: 'cat_expense_food', name: 'Food & Drinks', icon: 'bx-restaurant', type: 'expense' },
        { id: 'cat_expense_transport', name: 'Transport', icon: 'bx-bus', type: 'expense' },
        { id: 'cat_expense_bills', name: 'Bills & Utilities', icon: 'bx-file', type: 'expense', isRecurring: true },
        { id: 'cat_expense_health', name: 'Health & Wellness', icon: 'bx-first-aid', type: 'expense' },
        { id: 'cat_expense_shopping', name: 'Shopping', icon: 'bx-shopping-bag', type: 'expense' },
        { id: 'cat_expense_entertainment', name: 'Entertainment', icon: 'bx-movie-play', type: 'expense' },
        { id: 'cat_expense_other', name: 'Other', icon: 'bx-dots-horizontal-rounded', type: 'expense' }
    ],
    budgets: { overall: 0, categories: {} },
    settings: {
        userName: "Mahi",
        userTitle: "Founder, Infinity Group",
        userImage: "vector_lecture_design.png",
        currency: "৳",
        darkMode: false,
        notification: true
    },
    ui: {
        currentPage: 'dashboard',
        editingTransactionId: null,
        transactionsPerPage: 10,
        currentPageNumber: 1,
        filters: {}
    }
};

// --- APP INITIALIZATION ---
// This function is now only responsible for setting the current page
function setPageIdentifier(page) {
    state.ui.currentPage = page;
}

// The main logic now runs inside the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Determine the current page from the global scope (set by the inline script in HTML)
    const page = window.currentPage || 'dashboard';
    state.ui.currentPage = page;

    loadState();
    registerGlobalEventListeners();

    const splash = document.getElementById('splash-screen');
    const appContainer = document.querySelector('.app-container');

    // This function will be called after the splash screen timeout
    const startApp = () => {
        if (splash) splash.style.opacity = '0';
        if (appContainer) appContainer.classList.remove('hidden');
        
        setTimeout(() => {
            if (splash) splash.style.display = 'none';
            if (appContainer) appContainer.style.opacity = '1';
            
            // Render everything after the app is visible
            applyTheme();
            renderSidebar();
            renderFooter();
            renderPageContent(state.ui.currentPage);
        }, 600);
    };

    // Splash screen timeout
    setTimeout(startApp, 2000); // Show splash for 2 seconds
});


// --- CORE LOGIC ---
function renderPageContent(page) {
    switch (page) {
        case 'dashboard':
            renderDashboardPage();
            break;
        case 'transactions':
            renderTransactionsPage();
            break;
        // Add other page renderers here
    }
    renderSidebar(); // Always update sidebar for active link
}

// --- STATE MANAGEMENT ---
function loadState() {
    const savedState = localStorage.getItem('infinityXState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state = { ...state, ...parsed, settings: { ...state.settings, ...parsed.settings }, budgets: { ...state.budgets, ...parsed.budgets } };
        state.transactions = state.transactions.map(t => ({ ...t, date: new Date(t.date) }));
    }
}
function saveState() {
    localStorage.setItem('infinityXState', JSON.stringify(state));
}

// --- THEME MANAGEMENT ---
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) {
        themeIcon.className = state.settings.darkMode ? 'bx bxs-sun' : 'bx bxs-moon';
    }
}
function toggleTheme() {
    state.settings.darkMode = !state.settings.darkMode;
    applyTheme();
    saveState();
    renderPageContent(state.ui.currentPage);
}

// --- GLOBAL EVENT LISTENERS ---
function registerGlobalEventListeners() {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#addTransactionBtn')) openModal();
        if (e.target.closest('#theme-toggle-btn')) toggleTheme();
        if (e.target.closest('#generatePdfBtn')) generatePDF();
    });
}

// --- UTILITY FUNCTIONS ---
const formatCurrency = (amount, symbol = true) => {
    const formattedAmount = parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return symbol ? `${state.settings.currency}${formattedAmount}` : formattedAmount;
};
const getCategoryById = (id) => state.categories.find(c => c.id === id);

// --- TRANSACTION MANAGEMENT ---
function addOrUpdateTransaction(data) {
    const { date, ...restData } = data;
    if (state.ui.editingTransactionId) {
        const index = state.transactions.findIndex(t => t.id === state.ui.editingTransactionId);
        if (index > -1) {
            state.transactions[index] = { ...state.transactions[index], ...restData, date: new Date(date) };
        }
    } else {
        const newTransaction = { id: `trans_${Date.now()}`, ...restData, date: new Date(date) };
        state.transactions.unshift(newTransaction);
    }
    state.ui.editingTransactionId = null;
    saveState();
    renderPageContent(state.ui.currentPage);
    closeModal();
    showToast(`Transaction ${state.ui.editingTransactionId ? 'updated' : 'added'}!`, 'success');
}
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        renderPageContent(state.ui.currentPage);
        showToast('Transaction deleted!', 'danger');
    }
}

// --- PDF GENERATION ---
async function generatePDF() { /* ... আগের উত্তর থেকে সম্পূর্ণ কোড ... */ }