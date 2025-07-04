// state.js

// This file manages the application's state and interacts with localStorage.

const STORAGE_KEY = 'iExpanseTrackerState_v2';

let state = {
    transactions: [],
    categories: {},
    budgets: [],
    settings: {
        darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    },
};

function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
    } else {
        // Initialize with defaults if no saved state
        state.categories = { ...CONFIG.DEFAULT_CATEGORIES };
        state.budgets = [...CONFIG.INITIAL_BUDGETS];
        // Add some dummy data for first-time users
        const today = new Date();
        state.transactions = [
             { id: Date.now() + 1, type: 'income', description: 'Monthly Salary', amount: 50000, category: 'Salary', date: today.toISOString().split('T')[0] },
             { id: Date.now() + 2, type: 'expense', description: 'Groceries', amount: 3500, category: 'Food', date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0] },
             { id: Date.now() + 3, type: 'expense', description: 'Internet Bill', amount: 1000, category: 'Bills', date: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0] },
        ];
        saveState();
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Transaction Functions ---
function getTransactions() {
    return state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function addTransaction(transaction) {
    state.transactions.push({ ...transaction, id: Date.now() });
    saveState();
}

function updateTransaction(updatedTransaction) {
    const index = state.transactions.findIndex(t => t.id === updatedTransaction.id);
    if (index !== -1) {
        state.transactions[index] = updatedTransaction;
        saveState();
    }
}

function deleteTransaction(id) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState();
}

function getTransactionById(id) {
    return state.transactions.find(t => t.id === id);
}

// --- Category Functions ---
function getCategories() {
    return state.categories;
}

function addCategory(type, categoryName) {
    if (categoryName && !state.categories[type].map(c => c.toLowerCase()).includes(categoryName.toLowerCase())) {
        state.categories[type].push(categoryName);
        saveState();
    }
}

function deleteCategory(type, categoryName) {
    state.categories[type] = state.categories[type].filter(c => c !== categoryName);
    saveState();
}

// --- Budget Functions ---
function getBudgets() {
    return state.budgets;
}

function updateBudget(category, amount) {
    const budget = state.budgets.find(b => b.category === category);
    if (budget) {
        budget.amount = amount;
    } else {
        state.budgets.push({ category, amount });
    }
    saveState();
}

function deleteBudget(category) {
    state.budgets = state.budgets.filter(b => b.category !== category);
    saveState();
}

// --- Settings Functions ---
function getSettings() {
    return state.settings;
}

function toggleDarkMode() {
    state.settings.darkMode = !state.settings.darkMode;
    saveState();
    return state.settings.darkMode;
}

// Initial load
loadState();