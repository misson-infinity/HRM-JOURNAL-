// ui.js

// This file contains all functions related to updating the User Interface.

// --- Formatters ---
function formatCurrency(amount) {
    return `${CONFIG.CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
}

// --- Render Core UI Elements ---
function renderAppShell() {
    // Set App Name, Titles, and Logos
    document.title = CONFIG.APP_NAME;
    document.querySelectorAll('.app-logo').forEach(el => el.src = CONFIG.LOGO_PATH);
    document.querySelectorAll('.app-name').forEach(el => el.textContent = CONFIG.APP_NAME);
    document.querySelector('.app-slogan').textContent = CONFIG.SLOGAN;
    document.querySelector('link[rel="icon"]').href = CONFIG.LOGO_PATH;

    // Set Footer
    document.querySelector('#footer-text').innerHTML = `© ${new Date().getFullYear()} <img src="${CONFIG.LOGO_PATH}" class="w-4 h-4 rounded-full inline-block mx-1"> ${CONFIG.DEVELOPER.NAME} | Infinity Group`;

    // Developer Page Content
    const devPage = document.getElementById('developer-page-content');
    if (devPage) {
        devPage.querySelector('#dev-photo').src = CONFIG.DEVELOPER.PHOTO;
        devPage.querySelector('#dev-name').textContent = CONFIG.DEVELOPER.NAME;
        devPage.querySelector('#dev-title').textContent = CONFIG.DEVELOPER.TITLE;
        devPage.querySelector('#dev-group-info').textContent = CONFIG.DEVELOPER.GROUP_INFO;
        devPage.querySelector('#dev-whatsapp').href = `https://wa.me/880${CONFIG.DEVELOPER.WHATSAPP}`;
        devPage.querySelector('#dev-telegram').href = `https://t.me/+880${CONFIG.DEVELOPER.TELEGRAM}`;
        devPage.querySelector('#dev-instagram').href = CONFIG.DEVELOPER.INSTAGRAM;
        devPage.querySelector('#dev-facebook').href = CONFIG.DEVELOPER.FACEBOOK;
    }
}

function applyTheme(isDark) {
    const themeText = document.getElementById('theme-text');
    if (isDark) {
        document.documentElement.classList.add('dark');
        themeText.textContent = 'Light Mode';
    } else {
        document.documentElement.classList.remove('dark');
        themeText.textContent = 'Dark Mode';
    }
    // Re-render charts to adapt to theme
    if (window.expenseChart) window.expenseChart.destroy();
    if (window.monthlyChart) window.monthlyChart.destroy();
    renderDashboardCharts();
}

// --- Render Page-Specific Content ---

// Dashboard
function updateDashboardSummary() {
    const transactions = getTransactions();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('total-balance').textContent = formatCurrency(balance);
}

function renderRecentTransactions() {
    const list = document.getElementById('recent-transaction-list');
    if (!list) return;
    list.innerHTML = '';
    const recent = getTransactions().slice(0, 5);

    if (recent.length === 0) {
        list.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No transactions yet. Add one to get started!</td></tr>`;
        return;
    }

    recent.forEach(t => {
        const row = document.createElement('tr');
        row.className = `border-b dark:border-slate-700`;
        const amountClass = t.type === 'income' ? 'text-green-500' : 'text-red-500';
        const sign = t.type === 'income' ? '+' : '-';
        row.innerHTML = `
            <td class="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">${t.description}</td>
            <td class="py-3 px-2 text-slate-500 dark:text-slate-400">${t.category}</td>
            <td class="py-3 px-2 text-slate-500 dark:text-slate-400">${formatDate(t.date)}</td>
            <td class="py-3 px-2 text-right font-semibold ${amountClass}">${sign} ${formatCurrency(t.amount)}</td>
        `;
        list.appendChild(row);
    });
}

function renderDashboardCharts() {
    const expenseCtx = document.getElementById('expense-chart')?.getContext('2d');
    const monthlyCtx = document.getElementById('monthly-chart')?.getContext('2d');
    if (!expenseCtx || !monthlyCtx) return;

    const transactions = getTransactions();
    const settings = getSettings();
    const gridColor = settings.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const labelColor = settings.darkMode ? '#cbd5e1' : '#475569';

    // Expense Doughnut Chart
    const expenseByCategory = transactions.filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    window.expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expenseByCategory),
            datasets: [{
                data: Object.values(expenseByCategory),
                backgroundColor: ['#4b6cb7', '#182848', '#3b82f6', '#ef4444', '#eab308', '#22c55e', '#8b5cf6', '#ec4899'],
                borderColor: settings.darkMode ? '#1e293b' : '#ffffff',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: labelColor } },
                title: { display: true, text: 'Expense by Category', color: labelColor }
            }
        }
    });

    // Monthly Bar Chart
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[month]) acc[month] = { income: 0, expense: 0 };
      acc[month][t.type] += t.amount;
      return acc;
    }, {});
    
    const sortedLabels = Object.keys(monthlyData).sort((a,b) => new Date(`1 ${a}`) - new Date(`1 ${b}`));

    window.monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [
              { label: 'Income', data: sortedLabels.map(l => monthlyData[l].income), backgroundColor: '#22c55e' },
              { label: 'Expense', data: sortedLabels.map(l => monthlyData[l].expense), backgroundColor: '#ef4444' }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { color: labelColor }, grid: { color: gridColor } },
                x: { ticks: { color: labelColor }, grid: { color: gridColor } }
            },
            plugins: {
                legend: { labels: { color: labelColor } },
                title: { display: true, text: 'Monthly Overview', color: labelColor }
            }
        }
    });
}

// Transactions Page
function renderTransactionPage() {
    const list = document.getElementById('all-transactions-list');
    if(!list) return;
    list.innerHTML = '';
    const transactions = getTransactions(); // Can be filtered later

    if (transactions.length === 0) {
        list.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No transactions found.</td></tr>`;
        return;
    }

    transactions.forEach(t => {
        const row = document.createElement('tr');
        row.className = 'border-b dark:border-slate-700';
        const amountClass = t.type === 'income' ? 'text-green-500' : 'text-red-500';
        row.innerHTML = `
            <td class="py-3 px-2">
                <div class="font-medium text-slate-800 dark:text-slate-200">${t.description}</div>
                <div class="text-xs text-slate-500">${t.category}</div>
            </td>
            <td class="py-3 px-2 text-slate-500 dark:text-slate-400">${formatDate(t.date)}</td>
            <td class="py-3 px-2 text-right font-semibold ${amountClass}">${formatCurrency(t.amount)}</td>
            <td class="py-3 px-2 text-right">
                <button class="p-1 hover:text-blue-500 edit-btn" data-id="${t.id}"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                <button class="p-1 hover:text-red-500 delete-btn" data-id="${t.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        `;
        list.appendChild(row);
    });
    lucide.createIcons();
}

// Budgets Page
function renderBudgetsPage() {
    const container = document.getElementById('budgets-list');
    if (!container) return;
    const budgets = getBudgets();
    const transactions = getTransactions();
    const expenseCategories = getCategories().expense;
    
    // Populate select dropdown
    const categorySelect = document.getElementById('budget-category');
    categorySelect.innerHTML = expenseCategories.map(c => `<option value="${c}">${c}</option>`).join('');

    container.innerHTML = '';
    if(budgets.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-slate-500 col-span-full">No budgets set. Create one to track your spending.</div>`;
        return;
    }
    
    const expensesThisMonth = transactions.filter(t => {
        const tDate = new Date(t.date);
        const today = new Date();
        return t.type === 'expense' && tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
    });

    budgets.forEach(budget => {
        const spent = expensesThisMonth
            .filter(t => t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = (spent / budget.amount) * 100;
        let progressColor = 'progress-green';
        if (percentage > 75 && percentage <= 100) progressColor = 'progress-yellow';
        else if (percentage > 100) progressColor = 'progress-red';

        const budgetCard = document.createElement('div');
        budgetCard.className = 'bg-white dark:bg-slate-800 p-4 rounded-lg shadow';
        budgetCard.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="font-semibold">${budget.category}</span>
                <button class="text-red-500 hover:text-red-700 delete-budget-btn" data-category="${budget.category}"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <progress class="${progressColor}" value="${spent}" max="${budget.amount}"></progress>
            <div class="text-sm text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
                <span>${formatCurrency(spent)} of ${formatCurrency(budget.amount)}</span>
                <span class="font-medium">${percentage.toFixed(0)}%</span>
            </div>
        `;
        container.appendChild(budgetCard);
    });
    lucide.createIcons();
}

// Settings Page
function renderSettingsPage() {
    const incomeList = document.getElementById('income-categories-list');
    const expenseList = document.getElementById('expense-categories-list');
    if (!incomeList || !expenseList) return;

    const categories = getCategories();

    incomeList.innerHTML = categories.income.map(c => `
        <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded">
            <span>${c}</span>
            <button class="delete-category-btn text-red-400 hover:text-red-600" data-type="income" data-category="${c}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
    `).join('');

    expenseList.innerHTML = categories.expense.map(c => `
        <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded">
            <span>${c}</span>
            <button class="delete-category-btn text-red-400 hover:text-red-600" data-type="expense" data-category="${c}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
    `).join('');

    lucide.createIcons();
}

// --- Modals & Popups ---
function showTransactionModal(transactionToEdit = null) {
    const modal = document.getElementById('transaction-modal');
    const form = document.getElementById('transaction-form');
    const title = document.getElementById('modal-title');
    const typeSelect = document.getElementById('type');

    form.reset();
    document.getElementById('transaction-id').value = '';

    if (transactionToEdit) {
        title.textContent = 'Edit Transaction';
        document.getElementById('transaction-id').value = transactionToEdit.id;
        typeSelect.value = transactionToEdit.type;
        document.getElementById('description').value = transactionToEdit.description;
        document.getElementById('amount').value = transactionToEdit.amount;
        document.getElementById('date').value = transactionToEdit.date;
        
        populateCategorySelect(transactionToEdit.type);
        document.getElementById('category').value = transactionToEdit.category;
    } else {
        title.textContent = 'Add Transaction';
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        populateCategorySelect(typeSelect.value);
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideTransactionModal() {
    const modal = document.getElementById('transaction-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function populateCategorySelect(type) {
    const categorySelect = document.getElementById('category');
    const categories = getCategories()[type];
    categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}


function showInsightsModal() {
    const modal = document.getElementById('ai-insights-modal');
    const content = document.getElementById('insights-content');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    content.innerHTML = `<div class="flex justify-center items-center h-full"><div class="spinner h-12 w-12 rounded-full border-4 border-slate-200"></div></div>`;
    
    // Simulate AI analysis
    setTimeout(() => {
        const transactions = getTransactions();
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        let insights = '<ul class="space-y-3 list-disc list-inside">';
        if(transactions.length < 3) {
            insights += '<li>Start by adding more transactions to get personalized insights.</li>';
        } else {
            const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
            if(savingsRate > 20) {
                insights += `<li>Great job! Your savings rate is <strong class="text-green-500">${savingsRate.toFixed(1)}%</strong>. Keep up the good work.</li>`;
            } else if (savingsRate > 0) {
                insights += `<li>You are saving <strong class="text-yellow-500">${savingsRate.toFixed(1)}%</strong> of your income. Look for small expenses to cut down to improve this.</li>`;
            } else {
                insights += `<li><strong class="text-red-500">Warning:</strong> Your expenses are higher than your income. It's crucial to review your spending immediately.</li>`;
            }

            const expenseByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});
            const topCategory = Object.keys(expenseByCategory).sort((a,b) => expenseByCategory[b] - expenseByCategory[a])[0];
            if(topCategory) {
                insights += `<li>Your highest spending is in the <strong class="text-blue-400">${topCategory}</strong> category. Consider setting a budget for it.</li>`;
            }
        }
        insights += `<li>Regularly tracking every expense is the first step towards financial freedom.</li>`;
        insights += '</ul>';
        content.innerHTML = insights;

    }, 1500);
}

function hideInsightsModal() {
    const modal = document.getElementById('ai-insights-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}


// --- PDF Report Generation ---
function generatePDFReport(startDate, endDate) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const transactions = getTransactions().filter(t => {
        const tDate = new Date(t.date);
        return tDate >= new Date(startDate) && tDate <= new Date(endDate);
    });

    // Header
    doc.addImage(CONFIG.LOGO_PATH, 'PNG', 14, 6, 20, 20);
    doc.setFontSize(20);
    doc.text(CONFIG.APP_NAME, 40, 15);
    doc.setFontSize(10);
    doc.text(CONFIG.APP_SLOGAN, 40, 22);
    doc.line(14, 30, 196, 30); // horizontal line

    // Report Title
    doc.setFontSize(16);
    doc.text("Financial Report", 105, 40, null, null, "center");
    doc.setFontSize(12);
    doc.text(`From: ${formatDate(startDate)} To: ${formatDate(endDate)}`, 105, 48, null, null, "center");

    // Summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    doc.autoTable({
        startY: 55,
        body: [
            ['Total Income:', formatCurrency(totalIncome)],
            ['Total Expense:', formatCurrency(totalExpense)],
            ['Net Balance:', formatCurrency(balance)],
        ],
        theme: 'plain',
        styles: { fontSize: 12, fontStyle: 'bold' },
    });


    // Transactions Table
    const head = [['Date', 'Description', 'Category', 'Type', 'Amount']];
    const body = transactions.map(t => [
        formatDate(t.date),
        t.description,
        t.category,
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        formatCurrency(t.amount)
    ]);

    doc.autoTable({
        head: head,
        body: body,
        startY: doc.lastAutoTable.finalY + 10,
        headStyles: { fillColor: [75, 108, 183] }, // #4b6cb7
        didParseCell: function (data) {
            // Color rows based on type
            const row = data.row.raw;
            if (row && row[3] === 'Income') {
                data.cell.styles.textColor = [34, 197, 94]; // green-500
            } else if (row && row[3] === 'Expense') {
                data.cell.styles.textColor = [239, 68, 68]; // red-500
            }
        }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        const footerText = `Report generated by ${CONFIG.APP_NAME} for ${CONFIG.DEVELOPER.NAME}`;
        doc.text(footerText, 105, 290, null, null, 'center');
    }

    // Save the PDF
    doc.save(`I-Expanse-Report-${startDate}-to-${endDate}.pdf`);
}