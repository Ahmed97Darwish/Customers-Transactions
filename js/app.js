document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'data/data.json'; // Path to the local JSON file
    const customersTable = document.getElementById('customersTable').getElementsByTagName('tbody')[0];
    const ctx = document.getElementById('transactionsChart').getContext('2d');
    const paginationControls = document.getElementById('paginationControls');
    let chartInstance;
    let allCustomerTransactions = [];
    let displayedTransactionsCount = 0;
    const transactionsPerPage = 10;

    // Fetch data from JSON file and store it in LocalStorage
    async function fetchDataAndStoreInLocalStorage() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            localStorage.setItem('apiData', JSON.stringify(data));
            renderTable(data.customers);
            renderChart([]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    }

    // Get data from LocalStorage
    function getDataFromLocalStorage() {
        const storedData = localStorage.getItem('apiData');
        if (storedData) {
            const data = JSON.parse(storedData);
            renderTable(data.customers);
        } else {
            fetchDataAndStoreInLocalStorage();
        }
    }

    // Render the table
    function renderTable(customers) {
        customersTable.innerHTML = '';
        displayedTransactionsCount = 0;
        const storedData = localStorage.getItem('apiData');
        const data = storedData ? JSON.parse(storedData) : { customers: [], transactions: [] };

        // Get filter values
        const nameFilterValue = document.getElementById('filterNameInput').value.toLowerCase();
        const amountFilterValue = document.getElementById('filterAmountInput').value;

        allCustomerTransactions = [];

        customers
            .filter(customer => customer.name.toLowerCase().includes(nameFilterValue))
            .forEach(customer => {
                const customerTransactions = data.transactions.filter(transaction => transaction.customer_id === customer.id);
                customerTransactions
                    .filter(transaction => amountFilterValue === '' || transaction.amount >= amountFilterValue)
                    .forEach(transaction => {
                        allCustomerTransactions.push({ customerName: customer.name, ...transaction });
                    });
            });

        displayTransactions(1);
        renderPaginationControls();
    }

    // Display transactions with pagination
    function displayTransactions(pageNumber) {
        customersTable.innerHTML = '';
        const startIndex = (pageNumber - 1) * transactionsPerPage;
        const endIndex = startIndex + transactionsPerPage;
        const transactionsToShow = allCustomerTransactions.slice(startIndex, endIndex);

        transactionsToShow.forEach(transaction => {
            const row = customersTable.insertRow();
            row.insertCell(0).innerText = transaction.customerName;
            row.insertCell(1).innerText = transaction.date;
            row.insertCell(2).innerText = transaction.amount;

            row.addEventListener('click', () => {
                renderChart(allCustomerTransactions.filter(t => t.customer_id === transaction.customer_id));
            });
        });
    }

    // Render pagination controls
    function renderPaginationControls() {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(allCustomerTransactions.length / transactionsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', () => {
                displayTransactions(i);
            });
            paginationControls.appendChild(li);
        }
    }

    // Render the chart
    function renderChart(transactions) {
        const groupedTransactions = transactions.reduce((acc, transaction) => {
            const date = transaction.date;
            if (!acc[date]) acc[date] = 0;
            acc[date] += transaction.amount;
            return acc;
        }, {});

        const labels = Object.keys(groupedTransactions);
        const data = Object.values(groupedTransactions);

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Transaction Amounts Over Time',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount'
                        }
                    }
                }
            }
        });
    }

    // Initial render using LocalStorage data if available
    fetchDataAndStoreInLocalStorage();

    // Add event listeners to the filter inputs to filter the table
    document.getElementById('filterNameInput').addEventListener('input', () => {
        const storedData = localStorage.getItem('apiData');
        if (storedData) {
            const data = JSON.parse(storedData);
            renderTable(data.customers);
        }
    });

    document.getElementById('filterAmountInput').addEventListener('input', () => {
        const storedData = localStorage.getItem('apiData');
        if (storedData) {
            const data = JSON.parse(storedData);
            renderTable(data.customers);
        }
    });
});
