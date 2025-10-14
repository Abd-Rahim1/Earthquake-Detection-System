let earthquakeData = [];

function parseCSVFile(file) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.data && results.data.length > 0) {
                earthquakeData = results.data;
                console.log('Data loaded:', earthquakeData.length, 'records');
            }
        },
        error: function(error) {
            console.error('Error parsing CSV:', error);
            alert('Error parsing CSV file. Please check the format.');
        }
    });
}

function loadSampleData() {
    document.getElementById('visualizeSpinner').classList.remove('hidden');
    
    const sampleData = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
        const date = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        let lat, lng;
        const region = Math.random();
        
        if (region < 0.4) {
            lat = (Math.random() * 130) - 60;
            lng = (Math.random() * 115) - 180;
        } else if (region < 0.7) {
            lat = (Math.random() * 25) + 20;
            lng = (Math.random() * 160) - 10;
        } else {
            lat = (Math.random() * 130) - 60;
            lng = (Math.random() * 20) - 45;
        }
        
        const magnitude = 4.0 + Math.random() * Math.random() * 5.0;
        
        const depth = Math.pow(Math.random(), 2) * 200;
        
        sampleData.push({
            Time: date.toISOString(),
            Magnitude: magnitude,
            Latitude: lat,
            Longitude: lng,
            Depth: depth
        });
    }
    
    sampleData.sort((a, b) => new Date(b.Time) - new Date(a.Time));
    
    earthquakeData = sampleData;
    
    setTimeout(() => {
        document.getElementById('visualizeSpinner').classList.add('hidden');
        visualizeData();
    }, 1000);
}

function visualizeData() {
    if (!earthquakeData || earthquakeData.length === 0) {
        alert('No data available. Please upload a CSV file or load sample data.');
        return;
    }
    
    updateDataTable();
    
    createHeatmap();
    
    createMagnitudeChart();
}

function updateDataTable() {
    const tableBody = document.getElementById('earthquakeTableBody');
    tableBody.innerHTML = '';
    
    const displayData = earthquakeData.slice(0, 50);
    
    displayData.forEach(quake => {
        const row = document.createElement('tr');
        
        let timeDisplay = quake.Time;
        if (typeof quake.Time === 'string') {
            const date = new Date(quake.Time);
            if (!isNaN(date)) {
                timeDisplay = date.toLocaleString();
            }
        }
        
        row.innerHTML = `
            <td>${timeDisplay}</td>
            <td>${typeof quake.Magnitude === 'number' ? quake.Magnitude.toFixed(1) : quake.Magnitude}</td>
            <td>${typeof quake.Latitude === 'number' ? quake.Latitude.toFixed(3) : quake.Latitude}</td>
            <td>${typeof quake.Longitude === 'number' ? quake.Longitude.toFixed(3) : quake.Longitude}</td>
            <td>${typeof quake.Depth === 'number' ? quake.Depth.toFixed(1) : quake.Depth}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function createHeatmap() {
    const data = [{
        type: 'scattergeo',
        lat: earthquakeData.map(d => d.Latitude),
        lon: earthquakeData.map(d => d.Longitude),
        text: earthquakeData.map(d => `Magnitude: ${typeof d.Magnitude === 'number' ? d.Magnitude.toFixed(1) : d.Magnitude}<br>Depth: ${typeof d.Depth === 'number' ? d.Depth.toFixed(1) : d.Depth} km`),
        marker: {
            size: earthquakeData.map(d => Math.max(5, d.Magnitude * 2)),
            color: earthquakeData.map(d => d.Magnitude),
            colorscale: 'Viridis',
            cmin: 4,
            cmax: 9,
            colorbar: {
                title: 'Magnitude'
            }
        },
        hoverinfo: 'text'
    }];
    
    const layout = {
        title: 'Global Earthquake Distribution',
        geo: {
            projection: {
                type: 'natural earth'
            },
            showland: true,
            landcolor: 'rgb(217, 217, 217)',
            countrycolor: 'rgb(255, 255, 255)',
            oceancolor: 'rgb(233, 245, 248)',
            showlakes: true,
            lakecolor: 'rgb(233, 245, 248)',
            showrivers: true,
            rivercolor: 'rgb(233, 245, 248)',
            showcountries: true,
            resolution: 50
        },
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 40,
            pad: 0
        },
        height: 400
    };
    
    Plotly.newPlot('heatmapChart', data, layout);
}

function createMagnitudeChart() {
    const magnitudeBins = {};
    const binSize = 0.5;
    
    earthquakeData.forEach(quake => {
        if (typeof quake.Magnitude === 'number') {
            const bin = Math.floor(quake.Magnitude / binSize) * binSize;
            magnitudeBins[bin] = (magnitudeBins[bin] || 0) + 1;
        }
    });
    
    const bins = Object.keys(magnitudeBins).sort((a, b) => parseFloat(a) - parseFloat(b));
    const counts = bins.map(bin => magnitudeBins[bin]);
    
    const data = [{
        x: bins.map(bin => `${parseFloat(bin).toFixed(1)}-${(parseFloat(bin) + binSize).toFixed(1)}`),
        y: counts,
        type: 'bar',
        marker: {
            color: bins.map(bin => {
                const val = parseFloat(bin);
                if (val < 5.0) return '#4CAF50';
                if (val < 6.0) return '#FF9800';
                if (val < 7.0) return '#F44336';
                return '#9C27B0';
            })
        }
    }];
    
    const layout = {
        title: 'Earthquake Magnitude Distribution',
        xaxis: {
            title: 'Magnitude Range'
        },
        yaxis: {
            title: 'Number of Earthquakes'
        },
        margin: {
            l: 50,
            r: 20,
            b: 60,
            t: 40
        },
        height: 400
    };
    
    Plotly.newPlot('magnitudeDistChart', data, layout);
}