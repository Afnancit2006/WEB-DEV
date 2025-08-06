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