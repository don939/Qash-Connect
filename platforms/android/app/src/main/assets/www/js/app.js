// Add timeout to detect if deviceready is taking too long
let deviceReadyTimeout = setTimeout(() => {
    console.warn('Cordova initialization is taking longer than expected');
    showLoadingError();
}, 10000); // 10 second timeout

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    clearTimeout(deviceReadyTimeout);
    console.log('Cordova is ready at:', new Date().toISOString());
    
    // Show loading indicator
    showLoading();
    
    try {
        // Initialize app components
        initializeApp()
            .then(() => {
                hideLoading();
                console.log('App fully initialized');
            })
            .catch(error => {
                console.error('App initialization error:', error);
                showError(error);
            });
    } catch (error) {
        console.error('Fatal initialization error:', error);
        showFatalError(error);
    }
}

async function initializeApp() {
    // Initialize components in sequence
    await initializePlugins();
    await initializeGeolocation();
    await initializeMaps();
    await initializeQRScanner();
    // ... other initializations
}

function showLoading() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) {
        loadingEl.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

function showError(error) {
    // Show user-friendly error message
    showToast('Error', 'Failed to initialize app: ' + error.message, 'error');
}

function showFatalError(error) {
    // Show fatal error screen
    const errorScreen = document.createElement('div');
    errorScreen.className = 'fatal-error-screen';
    errorScreen.innerHTML = `
        <div class="error-content">
            <h2>Unable to Start App</h2>
            <p>Please try restarting the app. If the problem persists, contact support.</p>
            <button onclick="window.location.reload()">Retry</button>
        </div>
    `;
    document.body.appendChild(errorScreen);
}

// Rest of your JavaScript code 