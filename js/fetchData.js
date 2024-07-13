const apiUrl = 'data/data.json'; // Path to the local JSON file

// Function to fetch data from JSON file and store it in LocalStorage
async function fetchDataAndStoreInLocalStorage() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    localStorage.setItem('apiData', JSON.stringify(data));
    renderTable(data.customers);
    renderChart(data.transactions);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}
