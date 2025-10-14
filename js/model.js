let model;
let scaler;

async function loadModel() {
    try {
        model = tf.sequential();
        
        model.add(tf.layers.dense({
            units: 256,
            activation: 'tanh',
            inputShape: [3]
        }));
        
        model.add(tf.layers.dropout({ rate: 0.3 }));
        
        model.add(tf.layers.dense({
            units: 128,
            activation: 'tanh'
        }));
        
        model.add(tf.layers.dropout({ rate: 0.2 }));
        
        model.add(tf.layers.dense({
            units: 64,
            activation: 'tanh'
        }));
        
        model.add(tf.layers.dense({ units: 1 }));
        
        model.compile({
            optimizer: 'adam',
            loss: 'meanAbsoluteError',
            metrics: ['mae']
        });
        
        scaler = {
            min: [-90, -180, 0],
            max: [90, 180, 700]
        };
        
        console.log('Model initialized successfully');
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

function normalizeFeatures(lat, lng, depth) {
    const normalizedLat = (lat - scaler.min[0]) / (scaler.max[0] - scaler.min[0]);
    const normalizedLng = (lng - scaler.min[1]) / (scaler.max[1] - scaler.min[1]);
    const normalizedDepth = (depth - scaler.min[2]) / (scaler.max[2] - scaler.min[2]);
    
    return [normalizedLat, normalizedLng, normalizedDepth];
}

async function predictMagnitude() {
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const depth = parseFloat(document.getElementById('depth').value);
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(depth)) {
        alert('Please enter valid values for latitude, longitude, and depth.');
        return;
    }
    
    if (latitude < -90 || latitude > 90) {
        alert('Latitude must be between -90 and 90 degrees.');
        return;
    }
    
    if (longitude < -180 || longitude > 180) {
        alert('Longitude must be between -180 and 180 degrees.');
        return;
    }
    
    if (depth < 0) {
        alert('Depth must be a positive value.');
        return;
    }
    
    try {
        document.getElementById('predictSpinner').classList.remove('hidden');
        document.getElementById('predictBtn').disabled = true;
        
        const normalizedFeatures = normalizeFeatures(latitude, longitude, depth);
        
        const input = tf.tensor2d([normalizedFeatures]);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let simulatedMagnitude;
        
        const depthFactor = Math.min(1, depth / 100) * 2;
        
        const isInSeismicZone = (
            (longitude > -180 && longitude < -65 && latitude > -60 && latitude < 70) ||
            (longitude > -10 && longitude < 150 && latitude > 20 && latitude < 45) ||
            (longitude > -45 && longitude < -25 && latitude > -60 && latitude < 70)
        );
        
        if (isInSeismicZone) {
            simulatedMagnitude = 4.0 + Math.random() * 2.5 + depthFactor;
        } else {
            simulatedMagnitude = 3.0 + Math.random() * 1.5 + (depthFactor * 0.5);
        }
        
        simulatedMagnitude += (Math.random() - 0.5) * 0.8;
        
        simulatedMagnitude = Math.max(4.0, Math.min(9.0, simulatedMagnitude));
        
        document.getElementById('magnitudeValue').textContent = simulatedMagnitude.toFixed(1);
        document.getElementById('resultBox').style.display = 'block';
        
        const interpretationEl = document.getElementById('interpretation');
        if (simulatedMagnitude < 5.0) {
            interpretationEl.textContent = 'Light earthquake. Felt by many people, no damage.';
        } else if (simulatedMagnitude < 6.0) {
            interpretationEl.textContent = 'Moderate earthquake. Slight damage to buildings.';
        } else if (simulatedMagnitude < 7.0) {
            interpretationEl.textContent = 'Strong earthquake. Damage to well-built structures.';
        } else if (simulatedMagnitude < 8.0) {
            interpretationEl.textContent = 'Major earthquake. Serious damage over large areas.';
        } else {
            interpretationEl.textContent = 'Great earthquake. Major damage across vast areas.';
        }
        
        const magnitudeCircle = document.getElementById('magnitudeValue');
        if (simulatedMagnitude < 5.0) {
            magnitudeCircle.style.backgroundColor = '#4CAF50';
        } else if (simulatedMagnitude < 6.0) {
            magnitudeCircle.style.backgroundColor = '#FF9800';
        } else if (simulatedMagnitude < 7.0) {
            magnitudeCircle.style.backgroundColor = '#F44336';
        } else {
            magnitudeCircle.style.backgroundColor = '#9C27B0';
        }
        
    } catch (error) {
        console.error('Error predicting magnitude:', error);
        alert('Error predicting magnitude. Please try again.');
    } finally {
        document.getElementById('predictSpinner').classList.add('hidden');
        document.getElementById('predictBtn').disabled = false;
    }
}