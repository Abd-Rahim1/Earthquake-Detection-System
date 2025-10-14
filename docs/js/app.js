document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupTabNavigation();
    setupEventListeners();
    loadModel();
});

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

function setupEventListeners() {
    document.getElementById('predictBtn').addEventListener('click', predictMagnitude);
    
    document.getElementById('mapSelectBtn').addEventListener('click', function() {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lng = parseFloat(document.getElementById('longitude').value);
        
        if (!isNaN(lat) && !isNaN(lng)) {
            setMapMarker(lat, lng);
        }
    });
    
    document.getElementById('visualizeBtn').addEventListener('click', visualizeData);
    
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleData);
    
    document.getElementById('dataUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            parseCSVFile(file);
        }
    });
}