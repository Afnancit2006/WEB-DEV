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

    console.log('Your Location:');
    console.log('Latitude: ${latitude}');
    console.log('Longitute: ${longitude}');
}

function onError(error){
    console.error(`Error getting location: ${error.message}`);
    alert(`Error: ${error.message}. Please enable location services in your browser.`);
}