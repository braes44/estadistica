document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', leerArchivo);
});

function leerArchivo(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const contenido = e.target.result;
        procesarDatos(contenido);
    };

    reader.readAsText(file);
}

function procesarManual() {
    const manualInput = document.getElementById('manualInput').value;
    procesarDatos(manualInput);
}

function reiniciar() {
    location.reload();
}

function procesarDatos(contenido) {
    const filas = contenido.split('\n').slice(1);
    const datos = filas.map(fila => parseFloat(fila.split(',')[1]));

    if (document.getElementById('histogramaCheck').checked) {
        generarHistograma(datos);
    }
    if (document.getElementById('cajasCheck').checked) {
        generarCajas(datos);
    }
    if (document.getElementById('controlCheck').checked) {
        generarGraficoControl(datos);
    }
}

function generarHistograma(datos) {
    const ctx = document.getElementById('histograma').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos,
            datasets: [{
                label: 'Histograma',
                data: datos,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function generarCajas(datos) {
    Plotly.newPlot('cajasYBigotes', [{
        y: datos,
        type: 'box'
    }], { title: 'Cajas y Bigotes' });
}

function generarGraficoControl(datos) {
    const media = jStat.mean(datos);
    const desviacion = jStat.stdev(datos);
    const limites = [media - 3 * desviacion, media + 3 * desviacion];

    Plotly.newPlot('controlChart', [{
        y: datos,
        type: 'scatter',
        mode: 'lines+markers'
    }], {
        title: 'Gráfico de Control',
        shapes: [
            { type: 'line', y0: limites[0], y1: limites[0], x0: 0, x1: datos.length, line: { color: 'red' } },
            { type: 'line', y0: limites[1], y1: limites[1], x0: 0, x1: datos.length, line: { color: 'red' } }
        ]
    });
}
