function processData() {
    const input = document.getElementById("dataInput").value;
    const data = input.split(",").map(Number).filter(n => !isNaN(n));

    if (data.length === 0) {
        alert("Por favor, ingrese datos válidos.");
        return;
    }

    document.getElementById("results").style.display = "block";

    // Cálculos estadísticos
    const mean = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
    const sortedData = [...data].sort((a, b) => a - b);
    const median = (sortedData.length % 2 === 0)
        ? ((sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2).toFixed(2)
        : sortedData[Math.floor(sortedData.length / 2)];
    const mode = data.sort((a, b) =>
        data.filter(v => v === a).length - data.filter(v => v === b).length
    ).pop();
    const variance = (data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length).toFixed(2);
    const stdDev = Math.sqrt(variance).toFixed(2);

    document.getElementById("stats").innerHTML = `
        <table>
            <tr><th>Media</th><th>Mediana</th><th>Moda</th><th>Varianza</th><th>Desviación Estándar</th></tr>
            <tr><td>${mean}</td><td>${median}</td><td>${mode}</td><td>${variance}</td><td>${stdDev}</td></tr>
        </table>
    `;

    // Histograma
    const histogramCanvas = document.getElementById("histogram");
    const ctxHistogram = histogramCanvas.getContext("2d");
    ctxHistogram.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);

    const bins = 5;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;
    const frequencies = Array(bins).fill(0);

    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
        frequencies[binIndex]++;
    });

    const barWidth = histogramCanvas.width / bins;
    const maxFrequency = Math.max(...frequencies);

    frequencies.forEach((freq, index) => {
        const barHeight = (freq / maxFrequency) * histogramCanvas.height;
        ctxHistogram.fillStyle = "blue";
        ctxHistogram.fillRect(index * barWidth, histogramCanvas.height - barHeight, barWidth - 2, barHeight);
    });
}
