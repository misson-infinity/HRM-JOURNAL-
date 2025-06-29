// Infinity X - Financial Tracker - Main Logic
// Version: 2.2.0 (Fully Functional & Stable with Mobile Nav)
"use strict";

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
        userName: "Md Habibur Rahman Mahi", userTitle: "Founder, Infinity Group", userImage: "Picsart_24-12-22_22-58-18-749.png",
        currency: "৳", darkMode: false
    },
    ui: {
        currentPage: 'dashboard',
        isSidebarCollapsed: window.innerWidth < 992,
        editingTransactionId: null,
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const page = window.currentPage || 'dashboard';
    initApp(page);
});

function initApp(page) {
    state.ui.currentPage = page;
    loadState();
    registerGlobalEventListeners();
    const splash = document.getElementById('splash-screen');
    const appContainer = document.querySelector('.app-container');
    setTimeout(() => {
        if (splash) splash.style.opacity = '0';
        if (appContainer) appContainer.classList.remove('hidden');
        setTimeout(() => {
            if (splash) splash.style.display = 'none';
            if (appContainer) appContainer.style.opacity = '1';
            applyTheme();
            applySidebarState();
            renderSidebar();
            renderFooter();
            renderPageContent(page);
        }, 600);
    }, 2000);
}

function renderPageContent(page) {
    switch (page) {
        case 'dashboard': renderDashboardPage(); break;
        case 'transactions': renderTransactionsPage(); break;
        case 'reports': renderReportsPage(); break;
        case 'settings': renderSettingsPage(); break;
        case 'budgets': renderBudgetsPage(); break;
    }
    renderSidebar();
}

function loadState() {
    const savedState = localStorage.getItem('infinityXState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state = { ...state, ...parsed, settings: { ...state.settings, ...parsed.settings }, budgets: { ...state.budgets, ...parsed.budgets } };
        state.transactions = state.transactions.map(t => ({ ...t, date: new Date(t.date) }));
    }
    state.ui.isSidebarCollapsed = window.innerWidth < 992;
}

function saveState() {
    localStorage.setItem('infinityXState', JSON.stringify(state));
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) themeIcon.className = state.settings.darkMode ? 'bx bxs-sun' : 'bx bxs-moon';
}

function toggleTheme() {
    state.settings.darkMode = !state.settings.darkMode;
    applyTheme();
    saveState();
    renderPageContent(state.ui.currentPage);
}

function applySidebarState() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const menuIcon = document.querySelector('#menu-toggle-btn i');
    if (!sidebar || !mainContent) return;
    if (window.innerWidth > 992) {
        if (state.ui.isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('full-width');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('full-width');
        }
    } else {
        if (state.ui.isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    if (menuIcon) menuIcon.className = state.ui.isSidebarCollapsed ? 'bx bx-menu' : 'bx bx-x';
}

function toggleSidebar() {
    state.ui.isSidebarCollapsed = !state.ui.isSidebarCollapsed;
    applySidebarState();
    setTimeout(() => {
        if (['dashboard', 'reports'].includes(state.ui.currentPage)) {
            renderPageContent(state.ui.currentPage);
        }
    }, 400);
}

function registerGlobalEventListeners() {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#menu-toggle-btn') || e.target.closest('.sidebar-header')) toggleSidebar();
        if (e.target.closest('#addTransactionBtn')) openModal();
        if (e.target.closest('#theme-toggle-btn')) toggleTheme();
        if (e.target.closest('#generatePdfBtn')) {
            const monthFilter = document.getElementById('reportMonthFilter');
            if (monthFilter && monthFilter.value) generatePDF(monthFilter.value);
            else showToast('Please select a month for the report.', 'warning');
        }
    });
    window.addEventListener('resize', () => {
        state.ui.isSidebarCollapsed = window.innerWidth < 992;
        applySidebarState();
    });
}

const formatCurrency = (amount, symbol = true) => `${symbol ? state.settings.currency : ''}${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getCategoryById = (id) => state.categories.find(c => c.id === id);

function addOrUpdateTransaction(data) {
    if (state.ui.editingTransactionId) {
        const index = state.transactions.findIndex(t => t.id === state.ui.editingTransactionId);
        state.transactions[index] = { ...state.transactions[index], ...data, date: new Date(data.date) };
    } else {
        state.transactions.unshift({ id: `trans_${Date.now()}`, ...data, date: new Date(data.date) });
    }
    state.ui.editingTransactionId = null;
    saveState();
    renderPageContent(state.ui.currentPage);
    closeModal();
    showToast(`Transaction saved!`, 'success');
}

function deleteTransaction(id) {
    if (confirm('Are you sure?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        renderPageContent(state.ui.currentPage);
        showToast('Transaction deleted!', 'danger');
    }
}

async function generatePDF(monthYear) {
    if (typeof window.jspdf === 'undefined') return showToast('PDF library not loaded.', 'danger');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const { userName, userTitle, userImage } = state.settings;
    try {
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader(); reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result); reader.onerror = reject;
        });
        const imgBlob = await fetch(userImage).then(res => res.blob());
        const imgBase64 = await toBase64(imgBlob);
        
        doc.setFillColor(22, 33, 62); doc.rect(0, 0, 210, 50, 'F');
        doc.addImage(imgBase64, 'PNG', 15, 10, 30, 30);
        doc.setFontSize(26); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold');
        doc.text("Infinity X", 55, 20);
        doc.setFontSize(12); doc.setTextColor(200, 200, 200); doc.setFont(undefined, 'normal');
        doc.text("Financial Statement", 55, 28);
        
        doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold');
        doc.text(userName, 200, 20, { align: 'right' });
        doc.setFontSize(10); doc.setTextColor(200, 200, 200); doc.setFont(undefined, 'normal');
        doc.text(userTitle, 200, 26, { align: 'right' });
        
        const [year, month] = monthYear.split('-');
        const reportDate = new Date(year, month - 1);
        const monthName = reportDate.toLocaleString('default', { month: 'long' });
        doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.text(`Report for: ${monthName} ${year}`, 15, 60);

        const transactions = state.transactions.filter(t => new Date(t.date).getFullYear() == year && new Date(t.date).getMonth() == (month - 1));
        const head = [['Date', 'Description', 'Category', 'Type', 'Amount']];
        const body = transactions.map(t => [t.date.toLocaleDateString(), t.description, getCategoryById(t.category)?.name || 'N/A', t.type, formatCurrency(t.amount)]);
        doc.autoTable({ head, body, startY: 70, theme: 'grid', headStyles: { fillColor: [8, 217, 214] } });
        
        const finalY = doc.lastAutoTable.finalY + 15;
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        doc.setFontSize(14); doc.text("Summary", 15, finalY);
        doc.setFontSize(12); doc.text(`Total Income: ${formatCurrency(income)}`, 15, finalY + 8);
        doc.text(`Total Expense: ${formatCurrency(expense)}`, 15, finalY + 15);
        doc.setFont(undefined, 'bold'); doc.setTextColor("#007D65");
        doc.text(`Final Balance: ${formatCurrency(income - expense)}`, 15, finalY + 22);

        doc.save(`InfinityX_Report_${monthName}_${year}.pdf`);
        showToast("PDF generated!", "success");
    } catch (error) { showToast("Could not generate PDF.", "danger"); }
}