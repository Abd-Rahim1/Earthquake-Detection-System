let map;
let marker;

function initializeMap() {
    map = L.map('map').setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    map.on('click', function(e) {
        setMapMarker(e.latlng.lat, e.latlng.lng);
        document.getElementById('latitude').value = e.latlng.lat.toFixed(5);
        document.getElementById('longitude').value = e.latlng.lng.toFixed(5);
    });
}

function setMapMarker(lat, lng) {
    if (marker) {
        map.removeLayer(marker);
    }
    
    marker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 5);
}