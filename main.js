// main.js
"use strict";
document.addEventListener('DOMContentLoaded', () => {
    loadState(); applyTheme();
    navigateTo(window.location.hash.substring(1) || 'dashboard');
    registerEventListeners();
    setTimeout(() => { const s = document.getElementById('splash-screen'); if(s) { s.style.opacity = '0'; s.style.visibility = 'hidden'; } }, 3000);
});

function navigateTo(pageId) { state.ui.currentPage = pageId; window.location.hash = pageId; renderSidebar(); renderPageTitle(); renderPageContent(); updateActiveNavLink(); if (window.innerWidth < 768) { toggleSidebar(false); } }

function registerEventListeners() {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link')) { e.preventDefault(); navigateTo(e.target.closest('.nav-link').dataset.page); }
        if (e.target.closest('.nav-link-footer')) { e.preventDefault(); navigateTo(e.target.closest('.nav-link-footer').dataset.page); }
        if (e.target.closest('#sidebar-toggle')) { toggleSidebar(); }
        if (e.target.closest('#add-transaction-button')) { openModal(); }
    });
    window.addEventListener('hashchange', () => navigateTo(window.location.hash.substring(1) || 'dashboard'));
    window.addEventListener('resize', () => { state.ui.isSidebarOpen = window.innerWidth > 768; toggleSidebar(state.ui.isSidebarOpen); });
}

function addOrUpdateTransaction(data) {
    if (state.ui.editingTransactionId) {
        const index = state.transactions.findIndex(t => t.id === state.ui.editingTransactionId);
        state.transactions[index] = { ...state.transactions[index], ...data, amount: parseFloat(data.amount), date: new Date(data.date) };
    } else {
        state.transactions.push({ id: `txn_${Date.now()}`, ...data, amount: parseFloat(data.amount), date: new Date(data.date) });
    }
    state.ui.editingTransactionId = null; saveState(); renderPageContent(); closeModal();
    showToast(`Transaction saved!`, 'bg-green-500');
}

function deleteTransaction(id) {
    if (confirm('Are you sure?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState(); renderPageContent(); showToast('Transaction deleted!', 'bg-red-500');
    }
}

function applyTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark'); state.settings.darkMode = true;
    } else {
        document.documentElement.classList.remove('dark'); state.settings.darkMode = false;
    }
}

function toggleTheme() { state.settings.darkMode = !state.settings.darkMode; localStorage.theme = state.settings.darkMode ? 'dark' : 'light'; applyTheme(); renderSidebar(); renderPageContent(); }

function toggleSidebar(forceState = null) {
    const sidebar = document.getElementById('sidebar'); const main = document.getElementById('main-content');
    let overlay = document.querySelector('.sidebar-overlay');
    state.ui.isSidebarOpen = forceState !== null ? forceState : !state.ui.isSidebarOpen;
    if (window.innerWidth < 768) {
        if(state.ui.isSidebarOpen) { sidebar.classList.remove('-translate-x-full'); if(!overlay) { const o = document.createElement('div'); o.className = 'sidebar-overlay fixed inset-0 bg-black/50 z-30'; o.onclick = () => toggleSidebar(false); document.body.appendChild(o); }
        } else { sidebar.classList.add('-translate-x-full'); overlay?.remove(); }
    } else {
        if(state.ui.isSidebarOpen) { sidebar.classList.remove('-translate-x-full'); main.classList.remove('md:ml-0'); main.classList.add('md:ml-64'); }
        else { sidebar.classList.add('-translate-x-full'); main.classList.add('md:ml-0'); main.classList.remove('md:ml-64'); }
    }
}

const formatCurrency = (amount) => `${state.settings.currency} ${parseFloat(amount || 0).toLocaleString('en-IN')}`;
const getCategoryById = (id, type) => state.categories[type]?.find(c => c.id === id);

async function generatePDF(dateFrom, dateTo) {
    if (!dateFrom || !dateTo) return showToast('Please select a date range.', 'bg-red-500');
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    const { DEVELOPER_NAME, DEVELOPER_TITLE, DEVELOPER_PHOTO, APP_NAME, APP_SLOGAN } = CONFIG;
    try {
        const toBase64 = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = reject; });
        const imgBlob = await fetch(DEVELOPER_PHOTO).then(res => res.blob());
        const imgBase64 = await toBase64(imgBlob);

        doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 50, 'F');
        doc.addImage(imgBase64, 'PNG', 15, 10, 30, 30);
        doc.setFontSize(24); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold');
        doc.text(APP_NAME, 55, 22);
        doc.setFontSize(10); doc.setTextColor(200, 200, 200); doc.setFont(undefined, 'normal');
        doc.text(APP_SLOGAN, 55, 30);
        doc.setFontSize(12); doc.text(`Report for: ${DEVELOPER_NAME}`, 200, 20, { align: 'right' });
        doc.text(`Title: ${DEVELOPER_TITLE}`, 200, 26, { align: 'right' });
        
        const transactions = state.transactions.filter(t => new Date(t.date) >= new Date(dateFrom) && new Date(t.date) <= new Date(dateTo));
        const head = [['Date', 'Description', 'Category', 'Type', 'Amount']];
        const body = transactions.map(t => [new Date(t.date).toLocaleDateString(), t.description, getCategoryById(t.category, t.type)?.name || 'N/A', t.type.toUpperCase(), formatCurrency(t.amount)]);
        doc.autoTable({ head, body, startY: 60, theme: 'grid' });
        
        doc.save(`IExpanse_Report_${dateFrom}_to_${dateTo}.pdf`);
    } catch (e) { showToast('Error generating PDF.', 'bg-red-500'); }
}