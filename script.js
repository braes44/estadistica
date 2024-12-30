// script.js
document.addEventListener("DOMContentLoaded", () => {
    const dataTable = document.getElementById("dataTable");
    const addColumnButton = document.getElementById("addColumn");
    const addRowButton = document.getElementById("addRow");
    const processButton = document.getElementById("processData");
    const resetButton = document.getElementById("resetAnalysis");
    const analysisCheckboxes = document.querySelectorAll(".analysisCheckbox");
    const chartTitleInput = document.getElementById("chartTitle");
    const resultsSection = document.getElementById("resultsSection");
    const resultsDiv = document.getElementById("results");
    const chartCanvas = document.getElementById("chart");
    const downloadPDFButton = document.getElementById("downloadPDF");

    let chartInstance;

    // Agregar columna
    addColumnButton.addEventListener("click", () => {
        const headerRow = dataTable.querySelector("thead tr");
        const rows = dataTable.querySelectorAll("tbody tr");
        const colIndex = headerRow.children.length + 1;

        const newHeader = document.createElement("th");
        newHeader.textContent = `Columna ${colIndex}`;
        headerRow.appendChild(newHeader);

        rows.forEach(row => {
            const newCell = document.createElement("td");
            newCell.contentEditable = "true";
            row.appendChild(newCell);
        });
    });

    // Agregar fila
    addRowButton.addEventListener("click", () => {
        const row = document.createElement("tr");
        const colCount = dataTable.querySelector("thead tr").children.length;

        for (let i = 0; i < colCount; i++) {
            const cell = document.createElement("td");
            cell.contentEditable = "true";
            row.appendChild(cell);
        }

        dataTable.querySelector("tbody").appendChild(row);
    });

    // Procesar datos
    processButton.addEventListener("click", () => {
        const data = [];
        const rows = dataTable.querySelectorAll("tbody tr");

        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll("td").forEach(cell => {
                const value = parseFloat(cell.textContent.trim());
                if (!isNaN(value)) rowData.push(value);
            });
            if (rowData.length) data.push(rowData);
        });

        if (data.length === 0) {
            alert("Por favor, ingresa datos válidos.");
            return;
        }

        const flatData = data.flat();
        const selectedAnalyses = Array.from(analysisCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        if (selectedAnalyses.length === 0) {
            alert("Por favor, selecciona al menos un análisis.");
            return;
        }

        const chartTitle = chartTitleInput.value || "Gráfico sin título";

        resultsSection.classList.remove("hidden");
        resultsDiv.textContent = "";
        chartCanvas.classList.add("hidden");

        if (chartInstance) {
            chartInstance.destroy();
        }

        selectedAnalyses.forEach(analysis => {
            switch (analysis) {
                case "histogram":
                    createHistogram(flatData, chartTitle);
                    break;
                // Otros análisis pueden añadirse aquí
            }
        });
    });

    // Reiniciar análisis
    resetButton.addEventListener("click", () => {
        analysisCheckboxes.forEach(checkbox => (checkbox.checked = false));
        resultsSection.classList.add("hidden");
        chartCanvas.classList.add("hidden");
        if (chartInstance) chartInstance.destroy();
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

    // Crear histograma
    function createHistogram(data, title) {
        const labels = Array.from(new Set(data)).sort((a, b) => a - b);
        const frequencies = labels.map(label => data.filter(value => value === label).length);

        chartCanvas.classList.remove("hidden");
        chartInstance = new Chart(chartCanvas, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: title,
                        data: frequencies,
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            },
        });
    }
});
