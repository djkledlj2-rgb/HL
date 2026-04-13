
window.addEventListener('load', function() {
    const saved = localStorage.getItem('csvData');
    if (saved) {
        renderTable(saved);
    }
});

document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = function(e) {
        const content = e.target.result;
        localStorage.setItem('csvData', content);
        renderTable(content);
    };
});
function renderTable(content) {
    const lines = content.split('\n');
    lines.shift();

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    lines.forEach(function(line) {
        if (!line.trim()) return;

        const cols = line.split(',').map(c => c.replace(/"/g, '').trim());

        const name = cols[0];
        const total = cols[1];
        const available = parseInt(cols[3]);
        const color = available > 0 ? '#4CAF50' : '#e63946';

        tbody.innerHTML += `
            <tr>
                <td>${name}</td>
                <td>${total}</td>
                <td style="color:${color}; font-weight:600">${available}</td>
            </tr>
        `;
    });
}