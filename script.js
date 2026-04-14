const SUPABASE_URL = 'https://tguyatrputtyjnazfzax.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndXlhdHJwdXR0eWpuYXpmemF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTAxNDMsImV4cCI6MjA5MTY4NjE0M30.K8P4TUPkd0HNhAEUkJhtdumEIExFJ0Iv6TmFgkyt5E0';

window.addEventListener('load', loadData);

document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = async function(e) {
        const lines = e.target.result.split('\n');
        lines.shift();

        const rows = [];
        lines.forEach(function(line) {
            if (!line.trim()) return;
            const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
            if (cols[0]) {
                rows.push({
                    name: cols[0],
                    total: parseInt(cols[1]) || 0,
                    available: parseInt(cols[3]) || 0
                });
            }
        });

        console.log('строк для записывания:', rows.length);

        const delRes = await fetch(`${SUPABASE_URL}/rest/v1/resources?id=gte.0`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Видалення:', delRes.status);

        const postRes = await fetch(`${SUPABASE_URL}/rest/v1/resources`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(rows)
        });
        console.log('Записывание:', postRes.status);

        if (postRes.ok) {
            console.log('Данные записаны успешно! ✅');
            loadData();
        } else {
            const err = await postRes.text();
            console.error('Ошибка импорта:', err);
        }
    };
});

async function loadData() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/resources?select=*&order=total.desc`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });

    console.log('Загрузка:', res.status);
    const data = await res.json();
    console.log('Получено:', data.length);

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(function(row) {
        const color = row.available > 0 ? '#4CAF50' : '#e63946';
        tbody.innerHTML += `
            <tr>
                <td>${row.name}</td>
                <td>${row.total}</td>
                <td style="color:${color}; font-weight:600">${row.available}</td>
            </tr>
        `;
    });
}
