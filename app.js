// This function runs when the entire page is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to Masjid Finder Lite!");
    getUserLocation();
});

// Global variables
let map;
let userLocation;
let userMarker;
let watchId;
let routeLine;

// --- Custom Icons ---
const userIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#3498db" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 32],
});

// REVERTED: Switched back to the reliable orange SVG icon for mosques
const mosqueIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e67e22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36A5.5 5.5 0 0 1 12 15.5 5.5 5.5 0 0 1 6.5 10c0-1.7.78-3.23 2-4.24A9.01 9.01 0 0 0 12 3z"></path><path d="M16 2v4"></path><path d="M18 6L14 6"></path></svg>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});


function getUserLocation() {
    document.getElementById('loader-wrapper').style.display = 'flex';
    if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    } else {
        onError({ message: "Geolocation is not supported by your browser." });
    }
}

function onSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    userLocation = [latitude, longitude];

    if (!map) {
        displayMap(latitude, longitude);
        findNearbyMosques(latitude, longitude);
        getPrayerTimes(latitude, longitude);
    }

    if (userMarker) {
        userMarker.setLatLng(userLocation);
    }
}

function onError(error) {
    alert(`Error: ${error.message}. Please enable location services.`);
    document.getElementById('loader-wrapper').style.display = 'none';
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
}

function displayMap(lat, lon) {
    map = L.map('map').setView([lat, lon], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
    userMarker.bindPopup("<b>You are here!</b>").openPopup();

    document.getElementById('loader-wrapper').style.display = 'none';
    document.getElementById('main-content').style.visibility = 'visible';
}

async function findNearbyMosques(lat, lon) {
    const radius = 5000;
    const query = `[out:json];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon}););out center;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        data.elements.forEach(element => {
            const mosqueLat = element.lat || element.center.lat;
            const mosqueLon = element.lon || element.center.lon;
            const mosqueName = element.tags.name || "Unnamed Mosque";
            const popupContent = `<b>${mosqueName}</b><br><button class="directions-btn" onclick="getRoute(${mosqueLat}, ${mosqueLon})">Get Directions</button>`;
            L.marker([mosqueLat, mosqueLon], { icon: mosqueIcon }).addTo(map).bindPopup(popupContent);
        });
    } catch (error) {
        console.error("Error fetching mosques:", error);
    }
}

async function getRoute(mosqueLat, mosqueLon) {
    const [userLat, userLon] = userLocation;
    const url = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${mosqueLon},${mosqueLat}?overview=full&geometries=geojson`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            const latlngs = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            if (routeLine) {
                map.removeLayer(routeLine);
            }
            routeLine = L.polyline(latlngs, { color: '#3498db', weight: 5 }).addTo(map);
            map.fitBounds(routeLine.getBounds());
        } else {
            alert("Could not find a route to this mosque.");
        }
    } catch (error) {
        console.error("Error fetching route:", error);
    }
}
window.getRoute = getRoute;

async function getPrayerTimes(lat, lon) {
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        updatePrayerTimesUI(data.data.timings);
    } catch (error) {
        console.error("Error fetching prayer times:", error);
    }
}

function updatePrayerTimesUI(timings) {
    document.getElementById('fajr-time').textContent = timings.Fajr;
    document.getElementById('dhuhr-time').textContent = timings.Dhuhr;
    document.getElementById('asr-time').textContent = timings.Asr;
    document.getElementById('maghrib-time').textContent = timings.Maghrib;
    document.getElementById('isha-time').textContent = timings.Isha;
}