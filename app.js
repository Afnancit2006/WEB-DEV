// This function runs when the entire page is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to Masjid Finder Lite!");
    getUserLocation();
});

// A global variable to hold the map instance
let map;

// Main function to get user's location
function getUserLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        alert("Sorry, Geolocation is not supported by your browser.");
    }
}

// Function to run on successful location retrieval
function onSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    displayMap(latitude, longitude);
    findNearbyMosques(latitude, longitude);
    // NEW: Get prayer times
    getPrayerTimes(latitude, longitude);
}

// Function to run when an error occurs
function onError(error) {
    alert(`Error: ${error.message}. Please enable location services.`);
}

// Function to display the map
function displayMap(lat, lon) {
    map = L.map('map').setView([lat, lon], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const userMarker = L.marker([lat, lon]).addTo(map);
    userMarker.bindPopup("<b>You are here!</b>").openPopup();
}

// Function to find nearby mosques using Overpass API
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
            const mosqueMarker = L.marker([mosqueLat, mosqueLon]).addTo(map);
            mosqueMarker.bindPopup(`<b>${mosqueName}</b>`);
        });
    } catch (error) {
        console.error("Error fetching mosques:", error);
    }
}

// NEW: Function to get prayer times from Al-Adhan API
async function getPrayerTimes(lat, lon) {
    // Method 2 is for the Islamic Society of North America (ISNA). You can change it.
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const timings = data.data.timings;
        console.log("Prayer Times:", timings);
        
        // NEW: Call function to update the UI
        updatePrayerTimesUI(timings);

    } catch (error) {
        console.error("Error fetching prayer times:", error);
        alert("Could not fetch prayer times.");
    }
}

// NEW: Function to update the prayer times in the HTML
function updatePrayerTimesUI(timings) {
    document.getElementById('fajr-time').textContent = timings.Fajr;
    document.getElementById('dhuhr-time').textContent = timings.Dhuhr;
    document.getElementById('asr-time').textContent = timings.Asr;
    document.getElementById('maghrib-time').textContent = timings.Maghrib;
    document.getElementById('isha-time').textContent = timings.Isha;
}
