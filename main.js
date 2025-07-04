// main.js
"use strict";
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    applyTheme();
    navigateTo(window.location.hash.substring(1) || 'dashboard');
    registerEventListeners();
    const splashScreen = document.getElementById('splash-screen');
    setTimeout(() => { if(splashScreen) { splashScreen.style.opacity = '0'; splashScreen.style.visibility = 'hidden'; } }, 2500);
});

function navigateTo(pageId) {
    state.ui.currentPage = pageId;
    window.location.hash = pageId;
    renderSidebar(); renderPageTitle(); renderPageContent(); updateActiveNavLink();
    if (window.innerWidth < 768) { toggleSidebar(false); }
}

function registerEventListeners() {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link')) { e.preventDefault(); navigateTo(e.target.closest('.nav-link').dataset.page); }
        if (e.target.closest('.nav-link-footer')) { e.preventDefault(); navigateTo(e.target.closest('.nav-link-footer').dataset.page); }
        if (e.target.closest('#sidebar-toggle')) { toggleSidebar(); }
        if (e.target.closest('#add-transaction-button')) { openModal(); }
    });
    window.addEventListener('hashchange', () => navigateTo(window.location.hash.substring(1) || 'dashboard'));
}

function addOrUpdateTransaction(data) {
    if (state.ui.editingTransactionId) {
        const index = state.transactions.findIndex(t => t.id === state.ui.editingTransactionId);
        state.transactions[index] = { ...state.transactions[index], ...data };
    } else {
        state.transactions.push({ id: `txn_${Date.now()}`, ...data });
    }
    state.ui.editingTransactionId = null;
    saveState();
    renderPageContent(); closeModal();
    showToast(`Transaction saved!`, 'bg-green-500');
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState(); renderPageContent(); showToast('Transaction deleted!', 'bg-red-500');
    }
}

function applyTheme() {
    if (state.settings.darkMode || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        state.settings.darkMode = true;
    } else {
        document.documentElement.classList.remove('dark');
        state.settings.darkMode = false;
    }
}

function toggleTheme() { state.settings.darkMode = !state.settings.darkMode; saveState(); applyTheme(); renderSidebar(); renderPageContent(); }

function toggleSidebar(forceState = null) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const overlay = document.querySelector('.sidebar-overlay');
    state.ui.isSidebarOpen = forceState !== null ? forceState : !state.ui.isSidebarOpen;
    if (window.innerWidth < 768) {
        if(state.ui.isSidebarOpen) {
            sidebar.classList.add('open');
            if(!overlay) { const o = document.createElement('div'); o.className = 'sidebar-overlay fixed inset-0 bg-black/50 z-30'; o.onclick = () => toggleSidebar(false); document.body.appendChild(o); }
        } else {
            sidebar.classList.remove('open');
            overlay?.remove();
        }
    } else {
        if(state.ui.isSidebarOpen) { sidebar.classList.remove('-translate-x-full'); mainContent.classList.remove('md:ml-0'); mainContent.classList.add('md:ml-64'); }
        else { sidebar.classList.add('-translate-x-full'); mainContent.classList.add('md:ml-0'); mainContent.classList.remove('md:ml-64'); }
    }
}

const formatCurrency = (amount) => `${state.settings.currency} ${parseFloat(amount || 0).toLocaleString('en-IN')}`;
const getCategoryById = (id, type) => state.categories[type]?.find(c => c.id === id);