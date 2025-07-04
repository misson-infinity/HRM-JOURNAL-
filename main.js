// main.js

// This is the main script that initializes the app and handles all user interactions.

document.addEventListener('DOMContentLoaded', () => {
    // --- INITIALIZATION ---
    function initApp() {
        // 1. Register Service Worker for PWA capabilities
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => console.log('Service Worker registered successfully:', registration))
                .catch(error => console.log('Service Worker registration failed:', error));
        }

        // 2. Hide splash screen after a delay
        setTimeout(() => {
            document.getElementById('splash-screen').classList.add('fade-out');
        }, 2000);

        // 3. Render basic app info (name, logo, etc.)
        renderAppShell();
        
        // 4. Set initial theme
        applyTheme(getSettings().darkMode);

        // 5. Render page-specific content
        const currentPage = window.location.pathname.split('/').pop();
        updateActiveNav(currentPage);
        
        switch (currentPage) {
            case 'index.html':
            case '':
                updateDashboardSummary();
                renderRecentTransactions();
                renderDashboardCharts();
                break;
            case 'transactions.html':
                renderTransactionPage();
                break;
            case 'budgets.html':
                renderBudgetsPage();
                break;
            case 'settings.html':
                renderSettingsPage();
                break;
        }

        // 6. Initialize Lucide icons
        lucide.createIcons();
        
        // 7. Setup all event listeners
        setupEventListeners();
    }

    // --- EVENT LISTENERS SETUP ---
    function setupEventListeners() {
        // Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
        
        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const isDark = toggleDarkMode();
            applyTheme(isDark);
        });

        // Add Transaction Button
        document.getElementById('add-transaction-btn').addEventListener('click', () => {
            showTransactionModal();
        });

        // Modal Cancel/Close Buttons
        document.getElementById('cancel-button').addEventListener('click', hideTransactionModal);
        document.getElementById('transaction-modal').addEventListener('click', (e) => {
            if (e.target.id === 'transaction-modal') hideTransactionModal();
        });

        // Transaction Form
        document.getElementById('transaction-form').addEventListener('submit', handleTransactionFormSubmit);
        document.getElementById('type').addEventListener('change', (e) => populateCategorySelect(e.target.value));

        // AI Insights Modal
        document.getElementById('get-insights-btn')?.addEventListener('click', showInsightsModal);
        document.getElementById('close-insights-btn')?.addEventListener('click', hideInsightsModal);
        document.getElementById('ai-insights-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'ai-insights-modal') hideInsightsModal();
        });
        
        // Page specific listeners
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'transactions.html') {
             document.getElementById('all-transactions-list').addEventListener('click', handleTransactionListClick);
        }
        if (currentPage === 'reports.html') {
            document.getElementById('generate-report-btn').addEventListener('click', handleReportGeneration);
        }
        if (currentPage === 'budgets.html') {
            document.getElementById('add-budget-form').addEventListener('submit', handleBudgetFormSubmit);
            document.getElementById('budgets-list').addEventListener('click', handleDeleteBudget);
        }
        if (currentPage === 'settings.html') {
            document.getElementById('add-category-form').addEventListener('submit', handleCategoryFormSubmit);
            document.querySelector('.categories-container').addEventListener('click', handleDeleteCategory);
        }
    }

    // --- EVENT HANDLERS ---
    function handleTransactionFormSubmit(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('transaction-id').value);
        const transaction = {
            type: document.getElementById('type').value,
            description: document.getElementById('description').value.trim(),
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
        };
        
        if (!transaction.description || !transaction.amount || !transaction.category || !transaction.date) {
            alert('Please fill all fields.');
            return;
        }

        if (id) {
            updateTransaction({ ...transaction, id });
        } else {
            addTransaction(transaction);
        }
        
        hideTransactionModal();
        refreshPageContent();
    }

    function handleTransactionListClick(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('edit-btn')) {
            const transaction = getTransactionById(id);
            showTransactionModal(transaction);
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(id);
                renderTransactionPage();
            }
        }
    }

    function handleReportGeneration() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        if (!startDate || !endDate) {
            alert('Please select both a start and end date.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date.');
            return;
        }
        generatePDFReport(startDate, endDate);
    }
    
    function handleBudgetFormSubmit(e) {
        e.preventDefault();
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        if (!category || !amount) {
            alert('Please select a category and enter an amount.');
            return;
        }
        updateBudget(category, amount);
        renderBudgetsPage();
        e.target.reset();
    }

    function handleDeleteBudget(e) {
        const deleteBtn = e.target.closest('.delete-budget-btn');
        if (deleteBtn) {
            const category = deleteBtn.dataset.category;
            if (confirm(`Are you sure you want to delete the budget for "${category}"?`)) {
                deleteBudget(category);
                renderBudgetsPage();
            }
        }
    }

    function handleCategoryFormSubmit(e) {
        e.preventDefault();
        const type = document.getElementById('new-category-type').value;
        const name = document.getElementById('new-category-name').value.trim();
        if (name) {
            addCategory(type, name);
            renderSettingsPage();
            e.target.reset();
        }
    }

    function handleDeleteCategory(e) {
        const deleteBtn = e.target.closest('.delete-category-btn');
        if (deleteBtn) {
            const { type, category } = deleteBtn.dataset;
            if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
                deleteCategory(type, category);
                renderSettingsPage();
            }
        }
    }

    // --- UTILITY FUNCTIONS ---
    function updateActiveNav(pageName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === pageName) {
                link.classList.add('active');
            }
        });
    }
    
    function refreshPageContent() {
        // A simple way to refresh content without a full reload
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'index.html' || currentPage === '') {
            updateDashboardSummary();
            renderRecentTransactions();
            if (window.expenseChart) window.expenseChart.destroy();
            if (window.monthlyChart) window.monthlyChart.destroy();
            renderDashboardCharts();
        } else if (currentPage === 'transactions.html') {
            renderTransactionPage();
        }
        // This logic can be expanded for other pages if needed
    }

    // --- START THE APP ---
    initApp();
});