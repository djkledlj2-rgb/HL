window.onload = function() {
    const savedData = localStorage.getItem('csvData');
    if (savedData) {
        fillTable(savedData);
    }
};

document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = function(e) {
        const data = e.target.result;
        localStorage.setItem('csvData', data); 
        fillTable(data);
    };
});

function fillTable(data) {
    const lines = data.split('\n');
    lines.shift();

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    lines.forEach(function(line) {
        if (!line.trim()) return;

        const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
        const available = parseInt(cols[3]);
        const color = available > 0 ? '#4CAF50' : '#e63946';

        tbody.innerHTML += `
            <tr>
                <td>${cols[0]}</td>
                <td>${cols[1]}</td>
                <td>${cols[2]}</td>
                <td style="color:${color}; font-weight:600">${cols[3]}</td>
            </tr>
        `;
    });
}
