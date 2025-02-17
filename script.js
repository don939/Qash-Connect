// Global variables for maps
let userLocation = null;
let activeMap = null;
let activeMarker = null;
let watchId = null;

// Initialize map with error handling and default location
function initializeMap(mapId) {
    // Default coordinates (Johannesburg, South Africa)
    const defaultLocation = {
        lat: -26.2041,
        lng: 28.0473
    };

    // Map styling to match the theme
    const mapStyle = [
        {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#FFE4B5" }]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#87CEEB" }]
        }
    ];

    // Create map with default location
    const mapOptions = {
        zoom: 15,
        center: defaultLocation,
        styles: mapStyle,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
    };

    // Initialize the map
    activeMap = new google.maps.Map(document.getElementById(mapId), mapOptions);

    // Try to get user's location
    if (navigator.geolocation) {
        // Show loading indicator
        showLoadingOverlay();

        // Watch position for real-time updates
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Update map center
                activeMap.setCenter(userLocation);

                // Update or create marker
                if (activeMarker) {
                    activeMarker.setPosition(userLocation);
                } else {
                    activeMarker = new google.maps.Marker({
                        position: userLocation,
                        map: activeMap,
                        title: "Your Location",
                        animation: google.maps.Animation.DROP,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#000000",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#FFE4B5"
                        }
                    });
                }

                // Add click listener to marker
                activeMarker.addListener('click', () => {
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div style="color: #000000; padding: 10px;">
                                <h5>Your Location</h5>
                                <p>Lat: ${userLocation.lat.toFixed(6)}</p>
                                <p>Lng: ${userLocation.lng.toFixed(6)}</p>
                            </div>
                        `
                    });
                    infoWindow.open(activeMap, activeMarker);
                });

                // Hide loading indicator
                hideLoadingOverlay();
            },
            (error) => {
                console.error("Error getting location:", error);
                handleLocationError(true, activeMap.getCenter());
                hideLoadingOverlay();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        handleLocationError(false, activeMap.getCenter());
    }

    // Add map controls
    addMapControls(activeMap);
}

// Add custom map controls
function addMapControls(map) {
    // Recenter button
    const centerControl = document.createElement('div');
    centerControl.style.cssText = `
        background-color: #000000;
        border: 2px solid #FFE4B5;
        border-radius: 25px;
        box-shadow: 0 2px 6px rgba(0,0,0,.3);
        cursor: pointer;
        margin: 10px;
        padding: 10px;
        text-align: center;
    `;
    centerControl.innerHTML = '<i class="fas fa-crosshairs" style="color: #FFE4B5;"></i>';
    centerControl.addEventListener('click', () => {
        if (userLocation) {
            map.setCenter(userLocation);
            map.setZoom(15);
        }
    });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControl);
}

// Handle location errors
function handleLocationError(browserHasGeolocation, pos) {
    const message = browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.";
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background-color: #FFE4B5;
        border: 2px solid #000000;
        border-radius: 10px;
        color: #000000;
        margin: 10px;
        padding: 10px;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    activeMap.controls[google.maps.ControlPosition.TOP_CENTER].push(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show/hide loading overlay
function showLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Clean up when changing sections
function cleanupMap() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    activeMap = null;
    activeMarker = null;
}

// Update the showSection function
function showSection(section) {
    // Clean up existing map
    cleanupMap();

    // Show loading animation
    showLoadingOverlay();

    // Hide all sections first
    document.querySelector('.hero-section').style.display = 'none';
    document.getElementById('cash-at-hand-section').style.display = 'none';
    document.getElementById('cash-to-give-section').style.display = 'none';
    document.getElementById('admin-panel-section').style.display = 'none';

    // Show the selected section after a small delay
    setTimeout(() => {
        switch(section) {
            case 'hero':
                document.querySelector('.hero-section').style.display = 'block';
                break;
            case 'cash-at-hand':
                document.getElementById('cash-at-hand-section').style.display = 'block';
                setTimeout(() => initializeMap('map'), 100);
                break;
            case 'cash-to-give':
                document.getElementById('cash-to-give-section').style.display = 'block';
                setTimeout(() => initializeMap('provider-map'), 100);
                break;
            case 'admin':
                document.getElementById('admin-panel-section').style.display = 'block';
                break;
        }
        hideLoadingOverlay();
    }, 500);
}

// QR Code Generation
function generateQRCode(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Create data object
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        amount: formData.get('amount')
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(data);

    // Generate QR code
    const qr = qrcode(0, 'L');
    qr.addData(jsonString);
    qr.make();

    // Display QR code
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = qr.createImgTag(10);
    qrContainer.style.display = 'block';
}

// QR Code Scanner
async function initQRScanner() {
    try {
        const video = document.getElementById('qr-video');
        const scannedDetails = document.getElementById('scanned-details');
        
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        
        video.srcObject = stream;
        video.play();

        // Create QR scanner instance
        const scanner = new Html5Qrcode("qr-video");
        
        scanner.start(
            video,
            {
                fps: 10,
                qrbox: 250
            },
            async (decodedText) => {
                try {
                    // Parse the QR code data
                    const data = JSON.parse(decodedText);
                    
                    // Update the scanned details display
                    document.getElementById('scanned-name').textContent = `Name: ${data.name}`;
                    document.getElementById('scanned-phone').textContent = `Phone: ${data.phone}`;
                    document.getElementById('scanned-amount').textContent = `Amount: ${data.amount}`;
                    
                    // Show the scanned details
                    scannedDetails.style.display = 'block';
                    
                    // Stop scanning
                    await scanner.stop();
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Show success message
                    alert('QR Code scanned successfully!');
                } catch (error) {
                    console.error('Error parsing QR code data:', error);
                    alert('Invalid QR code format');
                }
            },
            (error) => {
                // Handle scan errors silently
                console.error('QR Code scanning error:', error);
            }
        );
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please make sure you have granted camera permissions.');
    }
}