// Infinity X - Financial Tracker - Main Logic
// Version: 1.2.0 (Stable Initial Render & Race Condition Fix)
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
        userName: "Mahi", userTitle: "Founder, Infinity Group", userImage: "vector_lecture_design.png",
        currency: "৳", darkMode: false, notification: true
    },
    ui: { currentPage: 'dashboard', editingTransactionId: null }
};

document.addEventListener('DOMContentLoaded', () => {
    // This listener ensures all initial HTML is parsed before JS runs.
    const page = window.currentPage || 'dashboard';
    initApp(page);
});

function initApp(page) {
    state.ui.currentPage = page;
    loadState();
    registerGlobalEventListeners();
    
    const splash = document.getElementById('splash-screen');
    const appContainer = document.querySelector('.app-container');
    
    // Splash Screen Logic
    setTimeout(() => {
        if (splash) splash.style.opacity = '0';
        if (appContainer) appContainer.classList.remove('hidden');
        
        setTimeout(() => {
            if (splash) splash.style.display = 'none';
            if (appContainer) appContainer.style.opacity = '1';
            
            // Render everything after the app is visible and ready
            applyTheme();
            renderSidebar();
            renderFooter();
            renderPageContent(page);
        }, 600); // Wait for splash fade-out
    }, 2500); // Show splash for 2.5 seconds
}

function renderPageContent(page) {
    switch (page) {
        case 'dashboard': renderDashboardPage(); break;
        case 'transactions': renderTransactionsPage(); break;
    }
    renderSidebar(); // Always update sidebar for active link
}

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

function registerGlobalEventListeners() {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#addTransactionBtn')) openModal();
        if (e.target.closest('#theme-toggle-btn')) toggleTheme();
        if (e.target.closest('#generatePdfBtn')) generatePDF();
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
    showToast(`Transaction ${state.ui.editingTransactionId ? 'updated' : 'added'}!`, 'success');
}
function deleteTransaction(id) {
    if (confirm('Are you sure? This cannot be undone.')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        renderPageContent(state.ui.currentPage);
        showToast('Transaction deleted!', 'danger');
    }
}

async function generatePDF() {
    if (typeof window.jspdf === 'undefined') return showToast('PDF library not loaded.', 'danger');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { userName, userTitle, userImage } = state.settings;
    try {
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
        const imgBlob = await fetch(userImage).then(res => res.blob());
        const imgBase64 = await toBase64(imgBlob);

        doc.addImage("logo.svg", 'SVG', 15, 12, 20, 20);
        doc.setFontSize(22); doc.setTextColor("#08D9D6");
        doc.text("Infinity X Financial Report", 40, 22);
        doc.addImage(imgBase64, 'PNG', 150, 8, 30, 30);
        doc.setFontSize(12); doc.setTextColor("#252A34"); doc.setFont(undefined, 'bold');
        doc.text(userName, 145, 15, { align: 'right' });
        doc.setFont(undefined, 'normal'); doc.setFontSize(10); doc.setTextColor("#6B7280");
        doc.text(userTitle, 145, 21, { align: 'right' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 145, 27, { align: 'right' });
        doc.setDrawColor("#E5E7EB"); doc.line(15, 40, 195, 40);

        const head = [['Date', 'Description', 'Category', 'Type', 'Amount']];
        const body = state.transactions.map(t => [ t.date.toLocaleDateString(), t.description, getCategoryById(t.category)?.name || 'N/A', t.type, formatCurrency(t.amount) ]);
        doc.autoTable({ head, body, startY: 50, theme: 'grid', headStyles: { fillColor: [8, 217, 214], textColor: 255 } });
        
        const finalY = doc.lastAutoTable.finalY + 15;
        const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        doc.setFontSize(14); doc.text("Summary", 15, finalY);
        doc.setFontSize(12); doc.text(`Total Income: ${formatCurrency(income)}`, 15, finalY + 8);
        doc.text(`Total Expense: ${formatCurrency(expense)}`, 15, finalY + 15);
        doc.setFont(undefined, 'bold'); doc.setTextColor("#007D65");
        doc.text(`Final Balance: ${formatCurrency(income - expense)}`, 15, finalY + 22);
        doc.save(`InfinityX_Report_${Date.now()}.pdf`);
        showToast("PDF generated!", "success");
    } catch (error) { showToast("Could not generate PDF.", "danger"); }
}