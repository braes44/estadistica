document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const processButton = document.getElementById("processData");
    const analysisType = document.getElementById("analysisType");
    const chartCanvas = document.getElementById("chart");
    const resultsSection = document.getElementById("resultsSection");
    const downloadPDFButton = document.getElementById("downloadPDF");

    let chartInstance;

    // Leer archivo CSV
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const data = parseCSV(text);
            processData(data);
        };
        reader.readAsText(file);
    });

    // Procesar datos
    processButton.addEventListener("click", () => {
        const selectedAnalysis = analysisType.value;

        if (!selectedAnalysis) {
            alert("Por favor, selecciona un análisis.");
            return;
        }

        resultsSection.classList.remove("hidden");

        if (chartInstance) {
            chartInstance.destroy();
        }

        switch (selectedAnalysis) {
            case "histogram":
                createHistogram();
                break;
            case "boxplot":
                createBoxPlot();
                break;
            // Agregar más análisis
        }
    });

    // Descargar PDF
    downloadPDFButton.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();

        doc.text("Reporte Estadístico", 10, 10);
        doc.text(`Fecha: ${dateStr}`, 10, 20);
        doc.text(`Hora: ${timeStr}`, 10, 30);

        const chartImage = chartCanvas.toDataURL("image/png");
        doc.addImage(chartImage, "PNG", 10, 40, 180, 100);

        doc.save("reporte_estadistico.pdf");
    });

    function parseCSV(csvText) {
        const rows = csvText.split("\n");
        return rows.map(row => row.split(",").map(Number));
    }

    function createHistogram() {
        // Lógica para crear un histograma
    }

    function createBoxPlot() {
        // Lógica para crear un boxplot
    }
});
