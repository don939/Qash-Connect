let dashboardRefreshInterval;

function startDashboardRefresh() {
    // Refresh every 5 minutes
    dashboardRefreshInterval = setInterval(initializeAdminDashboard, 300000);
}

function stopDashboardRefresh() {
    if (dashboardRefreshInterval) {
        clearInterval(dashboardRefreshInterval);
    }
}

function initializeAdminDashboard() {
    fetch('get_dashboard_data.php')
        .then(response => response.json())
        .then(data => {
            updateStats(data.stats);
            createActivityChart(data.activity);
            createTransactionPieChart(data.transactions);
            createVolumeChart(data.volume);
            createLocationChart(data.locations);
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
            showToast('Error', 'Failed to load dashboard data', 'danger');
        });
}

function updateStats(stats) {
    document.getElementById('hourly-users').textContent = stats.hourly;
    document.getElementById('daily-users').textContent = stats.daily;
    document.getElementById('weekly-users').textContent = stats.weekly;
    document.getElementById('yearly-users').textContent = stats.yearly;
}

// Update your existing chart creation functions to use the real data
function createActivityChart(activity) {
    const ctx = document.getElementById('userActivityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: activity.map(item => item.month),
            datasets: [{
                label: 'Active Users',
                data: activity.map(item => item.count),
                borderColor: '#000000',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(255, 228, 181, 0.2)'
            }]
        },
        // ... rest of your chart options
    });
}

// Similarly update other chart creation functions 