document.getElementById('dataForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const dataInput = document.getElementById('dataInput').value;
    try {
        const jsonData = JSON.parse(dataInput);
        const data = jsonData.data;

        const results = calculateStatistics(data);
        displayResults(results);
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

document.getElementById('uploadForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        alert('Por favor, selecciona un archivo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const data = parseCSV(text);
        const results = calculateStatistics(data);
        displayResults(results);
    };
    reader.readAsText(fileInput);
});

function parseCSV(text) {
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = {};
    headers.forEach((header, index) => {
        data[header] = rows.slice(1).map(row => parseFloat(row[index])).filter(val => !isNaN(val));
    });
    return data;
}

function calculateStatistics(data) {
    const results = {
        mean: {},
        median: {},
        mode: {},
        histogramData: [],
        boxplotData: []
    };

    for (const col in data) {
        const values = data[col];
        results.mean[col] = values.reduce((a, b) => a + b, 0) / values.length;
        results.median[col] = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
        results.mode[col] = mode(values);

        results.histogramData.push({
            x: values,
            type: 'histogram',
            name: col
        });

        results.boxplotData.push({
            y: values,
            type: 'box',
            name: col
        });
    }

    return results;
}

function mode(arr) {
    const freqMap = {};
    arr.forEach(val => (freqMap[val] = (freqMap[val] || 0) + 1));
    const maxFreq = Math.max(...Object.values(freqMap));
    return parseFloat(Object.keys(freqMap).find(key => freqMap[key] === maxFreq));
}

function displayResults(results) {
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('stats').innerHTML = `<pre>${JSON.stringify(results, null, 2)}</pre>`;

    Plotly.newPlot('histogram', results.histogramData);
    Plotly.newPlot('boxplot', results.boxplotData);
}
