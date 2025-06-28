// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let state = {
        transactions: [],
        budgets: {
            overall: 0,
            categories: {}
        },
        settings: {
            userName: "Md Habibur Rahman Mahi",
            currency: "₹"
        },
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        editingTransactionId: null
    };

    // --- DOM ELEMENTS ---
    const monthFilter = document.getElementById('monthFilter');
    const yearFilter = document.getElementById('yearFilter');
    const fab = document.getElementById('addTransactionBtn');
    const modal = document.getElementById('transactionModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const transactionForm = document.getElementById('transactionForm');
    const transactionTableBody = document.getElementById('transactionTableBody');
    const emptyState = document.getElementById('emptyState');
    
    // --- INITIALIZATION ---
    function initializeApp() {
        populateDateFilters();
        loadState();
        registerEventListeners();
        renderAll();
    }

    function populateDateFilters() {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthFilter.innerHTML = months.map((month, index) => `<option value="${index}">${month}</option>`).join('');
        monthFilter.value = state.currentMonth;
        yearFilter.value = state.currentYear;
    }
    
    // --- STATE & DATA PERSISTENCE ---
    function loadState() {
        const savedState = localStorage.getItem('infinityTrackerState');
        if (savedState) {
            state = JSON.parse(savedState);
            // Ensure date objects are correctly parsed if stored as strings
            state.transactions.forEach(t => t.date = new Date(t.date));
        }
        // Always set current month/year to today on load, but keep historic data
        state.currentMonth = new Date().getMonth();
        state.currentYear = new Date().getFullYear();
    }

    function saveState() {
        localStorage.setItem('infinityTrackerState', JSON.stringify(state));
    }
    
    // --- RENDERING ---
    function renderAll() {
        const filteredTransactions = getFilteredTransactions();
        renderDashboard(filteredTransactions);
        renderTransactionTable(filteredTransactions);
        renderBudgets(filteredTransactions);
        renderCharts(filteredTransactions);
    }
    
    function renderDashboard(transactions) {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        document.getElementById('totalIncome').textContent = formatCurrency(income);
        document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
        document.getElementById('currentBalance').textContent = formatCurrency(income - expenses);
        document.getElementById('transactionCount').textContent = transactions.length;
    }

    function renderTransactionTable(transactions) {
        transactionTableBody.innerHTML = '';
        if (transactions.length === 0) {
            emptyState.classList.add('visible');
            return;
        }
        emptyState.classList.remove('visible');
        
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        transactions.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="type-indicator ${t.type}">${t.type}</span></td>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>
                    <div class="details-cell">
                        <strong>${t.description}</strong>
                        ${t.notes ? `<small>${t.notes}</small>` : ''}
                    </div>
                </td>
                <td>${t.category || '-'}</td>
                <td class="amount ${t.type}">${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="handleEditTransaction('${t.id}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn duplicate-btn" onclick="handleDuplicateTransaction('${t.id}')"><i class="fas fa-copy"></i></button>
                        <button class="action-btn delete-btn" onclick="handleDeleteTransaction('${t.id}')"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            transactionTableBody.appendChild(row);
        });
    }

    // --- CHARTS ---
    let expensePieChart, incomeExpenseBarChart;
    function renderCharts(transactions) {
        const expenseData = transactions.filter(t => t.type === 'expense');
        
        // Pie Chart
        const categoryTotals = expenseData.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
        
        if (expensePieChart) expensePieChart.destroy();
        expensePieChart = new Chart(document.getElementById('expensePieChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals),
                    backgroundColor: ['#E76F51', '#F4A261', '#E9C46A', '#2A9D8F', '#264653', '#84a59d', '#e76f5180']
                }]
            }
        });

        // Bar Chart
        const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        if(incomeExpenseBarChart) incomeExpenseBarChart.destroy();
        incomeExpenseBarChart = new Chart(document.getElementById('incomeExpenseBarChart'), {
            type: 'bar',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    label: 'Amount',
                    data: [incomeTotal, expenseTotal],
                    backgroundColor: [ 'rgba(42, 157, 143, 0.8)', 'rgba(231, 111, 81, 0.8)']
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }


    // --- EVENT LISTENERS & HANDLERS ---
    function registerEventListeners() {
        fab.addEventListener('click', () => openModal());
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        transactionForm.addEventListener('submit', handleFormSubmit);
        monthFilter.addEventListener('change', handleFilterChange);
        yearFilter.addEventListener('change', handleFilterChange);
    }
    
    function handleFilterChange() {
        state.currentMonth = parseInt(monthFilter.value);
        state.currentYear = parseInt(yearFilter.value);
        renderAll();
    }

    function openModal(transaction = null) {
        transactionForm.reset();
        if (transaction) {
            // Edit mode
            document.getElementById('modalTitle').textContent = "Edit Transaction";
            state.editingTransactionId = transaction.id;
            document.getElementById('transactionId').value = transaction.id;
            document.getElementById('transactionAmount').value = transaction.amount;
            document.getElementById('transactionDescription').value = transaction.description;
            document.getElementById('transactionDate').valueAsDate = new Date(transaction.date);
            // ... populate other fields like category, notes etc.
        } else {
            // Add mode
            document.getElementById('modalTitle').textContent = "Add Transaction";
            state.editingTransactionId = null;
            document.getElementById('transactionDate').valueAsDate = new Date();
        }
        modal.classList.add('visible');
    }

    function closeModal() {
        modal.classList.remove('visible');
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const newTransaction = {
            id: state.editingTransactionId || 'id_' + Date.now(),
            type: transactionForm.querySelector('.toggle-btn.active').dataset.type,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            description: document.getElementById('transactionDescription').value,
            category: 'Default', // Simplified for this example
            date: new Date(document.getElementById('transactionDate').value),
            notes: '', // Simplified
        };

        if (state.editingTransactionId) {
            // Update existing
            const index = state.transactions.findIndex(t => t.id === state.editingTransactionId);
            state.transactions[index] = newTransaction;
        } else {
            // Add new
            state.transactions.push(newTransaction);
        }
        
        saveState();
        renderAll();
        closeModal();
        showToast(state.editingTransactionId ? 'Transaction Updated!' : 'Transaction Added!');
    }
    
    window.handleEditTransaction = (id) => {
        const transaction = state.transactions.find(t => t.id === id);
        if(transaction) openModal(transaction);
    };

    window.handleDeleteTransaction = (id) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            state.transactions = state.transactions.filter(t => t.id !== id);
            saveState();
            renderAll();
            showToast('Transaction Deleted!');
        }
    };
    
    window.handleDuplicateTransaction = (id) => {
        const original = state.transactions.find(t => t.id === id);
        if (original) {
            const newCopy = {...original, id: 'id_' + Date.now(), date: new Date() };
            state.transactions.push(newCopy);
            saveState();
            renderAll();
            showToast('Transaction Duplicated!');
        }
    };


    // --- UTILITY FUNCTIONS ---
    function formatCurrency(amount) {
        return `${state.settings.currency}${amount.toFixed(2)}`;
    }

    function getFilteredTransactions() {
        return state.transactions.filter(t => 
            new Date(t.date).getMonth() === state.currentMonth &&
            new Date(t.date).getFullYear() === state.currentYear
        );
    }

    function showToast(message) {
        const toast = document.getElementById('toastNotification');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    window.openTab = (evt, tabName) => {
        let i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tab-link");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    // PDF Generation (Updated)
    document.getElementById('generatePdfBtn').addEventListener('click', async () => {
         try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            // Your new designed PDF header code here...
            doc.setFontSize(24);
            doc.setTextColor('#2A9D8F');
            doc.text('Infinity Tracker Report', 14, 25);
            
            const transactions = getFilteredTransactions();
            const bodyData = transactions.map(t => [
                t.type,
                new Date(t.date).toLocaleDateString(),
                t.description,
                t.category,
                formatCurrency(t.amount)
            ]);

            doc.autoTable({
                head: [['Type', 'Date', 'Description', 'Category', 'Amount']],
                body: bodyData,
                startY: 50
            });
            
            doc.save('Infinity_Tracker_Report.pdf');
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Could not generate PDF. Please try again.");
        }
    });

    // --- START THE APP ---
    initializeApp();
});