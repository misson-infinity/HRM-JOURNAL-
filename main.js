// Infinity X - Financial Tracker - Main Logic
// Version: 1.0.0
// Author: Generated for Md Habibur Rahman Mahi

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
    ui: { currentPage: 'dashboard', editingTransactionId: null, transactionsPerPage: 10, currentPageNumber: 1, filters: {} }
};

// --- APP INITIALIZATION ---
function initApp(page) {
    state.ui.currentPage = page;
    document.addEventListener('DOMContentLoaded', () => {
        loadState();
        registerGlobalEventListeners();
        // Splash Screen Logic
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            const app = document.querySelector('.app-container');
            if (splash) splash.style.opacity = '0';
            if (app) app.classList.remove('hidden');
            setTimeout(() => {
                if (splash) splash.style.display = 'none';
                if (app) app.style.opacity = '1';
                // Initial render after splash screen
                applyTheme();
                renderSidebar();
                renderFooter();
                renderPageContent(page);
            }, 600);
        }, 3000); // 3-second splash screen
    });
}

// --- CORE LOGIC ---
function renderPageContent(page) {
    switch (page) {
        case 'dashboard': renderDashboardPage(); break;
        case 'transactions': renderTransactionsPage(); break;
        case 'reports': renderReportsPage(); break;
        case 'settings': renderSettingsPage(); break;
        case 'budgets': renderBudgetsPage(); break;
    }
    // Update active link in sidebar
    renderSidebar();
}

// --- STATE MANAGEMENT ---
function loadState() {
    const savedState = localStorage.getItem('infinityXState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        // Merge saved state carefully to avoid breaking on new features
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
    if (themeIcon) themeIcon.className = state.settings.darkMode ? 'bx bxs-sun' : 'bx bxs-moon';
}
function toggleTheme() {
    state.settings.darkMode = !state.settings.darkMode;
    applyTheme();
    saveState();
    // Re-render charts for new theme colors
    renderPageContent(state.ui.currentPage);
}

// --- GLOBAL EVENT LISTENERS ---
function registerGlobalEventListeners() {
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => openModal());
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('generatePdfBtn')?.addEventListener('click', generatePDF);
}

// --- UTILITY FUNCTIONS ---
const formatCurrency = (amount, symbol = true) => `${symbol ? state.settings.currency : ''}${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getCategoryById = (id) => state.categories.find(c => c.id === id);

// --- TRANSACTION MANAGEMENT ---
function addOrUpdateTransaction(data) {
    if (state.ui.editingTransactionId) {
        const index = state.transactions.findIndex(t => t.id === state.ui.editingTransactionId);
        if (index > -1) {
            state.transactions[index] = { ...state.transactions[index], ...data, date: new Date(data.date) };
        }
    } else {
        const newTransaction = { id: `trans_${Date.now()}`, ...data, date: new Date(data.date) };
        state.transactions.unshift(newTransaction);
    }
    state.ui.editingTransactionId = null;
    saveState();
    renderPageContent(state.ui.currentPage);
    closeModal();
    showToast(`Transaction ${state.ui.editingTransactionId ? 'updated' : 'added'} successfully!`, 'success');
}
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        renderPageContent(state.ui.currentPage);
        showToast('Transaction deleted!', 'danger');
    }
}

// --- PDF GENERATION (PROFESSIONAL) ---
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { userName, userTitle, userImage, currency } = state.settings;

    try {
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
        const imgBlob = await fetch(userImage).then(res => res.blob());
        const imgBase64 = await toBase64(imgBlob);

        // Header
        doc.addImage("logo.svg", 'SVG', 15, 12, 20, 20);
        doc.setFontSize(22);
        doc.setTextColor("#08D9D6");
        doc.text("Infinity X Financial Report", 40, 22);

        // User Info Section with Picture
        doc.addImage(imgBase64, 'PNG', 150, 8, 30, 30);
        doc.setFontSize(12);
        doc.setTextColor("#252A34");
        doc.setFont(undefined, 'bold');
        doc.text(userName, 145, 15, { align: 'right' });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor("#6B7280");
        doc.text(userTitle, 145, 21, { align: 'right' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 145, 27, { align: 'right' });
        doc.setDrawColor("#E5E7EB");
        doc.line(15, 40, 195, 40);

        // Body with autoTable
        const transactions = state.transactions; // Can be filtered later
        const head = [['Date', 'Description', 'Category', 'Type', 'Amount']];
        const body = transactions.map(t => [
            t.date.toLocaleDateString(),
            t.description,
            getCategoryById(t.category)?.name || 'N/A',
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            formatCurrency(t.amount)
        ]);
        doc.autoTable({
            head: head, body: body, startY: 50, theme: 'grid',
            headStyles: { fillColor: [8, 217, 214], textColor: 255 },
            styles: { font: 'Poppins', fontStyle: 'normal' }
        });

        // Summary Footer
        const finalY = doc.lastAutoTable.finalY + 15;
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        doc.setFontSize(14);
        doc.text("Summary", 15, finalY);
        doc.setFontSize(12);
        doc.text(`Total Income: ${formatCurrency(income)}`, 15, finalY + 8);
        doc.text(`Total Expense: ${formatCurrency(expense)}`, 15, finalY + 15);
        doc.setFont(undefined, 'bold');
        doc.setTextColor("#007D65");
        doc.text(`Final Balance: ${formatCurrency(income - expense)}`, 15, finalY + 22);

        doc.save(`InfinityX_Report_${Date.now()}.pdf`);
        showToast("PDF report generated successfully!", "success");
    } catch (error) {
        console.error("PDF generation failed:", error);
        showToast("Could not generate PDF. Please try again.", "danger");
    }
}