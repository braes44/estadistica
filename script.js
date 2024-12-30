document.addEventListener("DOMContentLoaded", () => {
    const dataTable = document.getElementById("dataTable");
    const addColumnButton = document.getElementById("addColumn");
    const addRowButton = document.getElementById("addRow");
    const processButton = document.getElementById("processData");
    const statTest = document.getElementById("statTest");
    const resultsSection = document.getElementById("resultsSection");
    const resultsDiv = document.getElementById("results");

    // Add a new column
    addColumnButton.addEventListener("click", () => {
        const headerRow = dataTable.querySelector("thead tr");
        const rows = dataTable.querySelectorAll("tbody tr");
        const colIndex = headerRow.children.length + 1;

        // Add header
        const newHeader = document.createElement("th");
        newHeader.textContent = `Columna ${colIndex}`;
        headerRow.appendChild(newHeader);

        // Add cells
        rows.forEach(row => {
            const newCell = document.createElement("td");
            newCell.contentEditable = "true";
            row.appendChild(newCell);
        });
    });

    // Add a new row
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

    // Process data
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
        const test = statTest.value;
        let result;

        switch (test) {
            case "mean":
                result = flatData.reduce((a, b) => a + b, 0) / flatData.length;
                break;
            case "median":
                flatData.sort((a, b) => a - b);
                const mid = Math.floor(flatData.length / 2);
                result = flatData.length % 2 !== 0 ? flatData[mid] : (flatData[mid - 1] + flatData[mid]) / 2;
                break;
            case "mode":
                const freq = {};
                flatData.forEach(num => freq[num] = (freq[num] || 0) + 1);
                result = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
                break;
            case "kurtosis":
                const mean = flatData.reduce((a, b) => a + b, 0) / flatData.length;
                const variance = flatData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / flatData.length;
                result = flatData.reduce((a, b) => a + Math.pow((b - mean) / Math.sqrt(variance), 4), 0) / flatData.length - 3;
                break;
            case "skewness":
                const m = flatData.reduce((a, b) => a + b, 0) / flatData.length;
                const sd = Math.sqrt(flatData.reduce((a, b) => a + Math.pow(b - m, 2), 0) / flatData.length);
                result = flatData.reduce((a, b) => a + Math.pow((b - m) / sd, 3), 0) / flatData.length;
                break;
        }

        resultsSection.classList.remove("hidden");
        resultsDiv.textContent = `Resultado (${test}): ${result}`;
    });
});
