window.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to Masjid Finder Lite!");
    getUserLocation();
});


function getUserLocation(){
    if('geolocation' in navigator){
        console.log("Geolocation is available.");
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        console.error("Geolocation is not supported by your browser.");
        alert("Sorry, Geolocation is not supported by your browser.");
    }
}

function onSuccess(position){
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.log('Your Location: Latitude: ${latitude}, Longitude: ${longitude}');
    displayMap(latitude, longitude);
    findNearbyMosques(latitude, longitude);
}

function onError(error){
    console.error(`Error getting location: ${error.message}`);
    alert(`Error: ${error.message}. Please enable location services in your browser.`);
}

function displayMap(lat,lan){
    const map = L.map('map').setView([lat,lan],15);
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup("<b>You are here!</b>").openPopup();
}

async function findNearbyMosques(lat ,lan) {
    const radius = 5000;

    const query = `
        [out:json];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
          relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
        );
        out center;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Found mosques:", data.elements);
        data.elements.forEach(element => {
            const mosqueLat = element.lat || element.center.lat;
            const mosqueLon = element.lon || element.center.lon;
            const mosqueName = element.tags.name || "Unnamed Mosque";

            const mosqueMarker = L.marker([mosqueLat, mosqueLon]).addTo(map);
            mosqueMarker.bindPopup(`<b>${mosqueName}</b>`);
        });

    } catch (error) {
        console.error("Error fetching mosques:", error);
        alert("Could not fetch nearby mosques. Please try again later.");
    }
}