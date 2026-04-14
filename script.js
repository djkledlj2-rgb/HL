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

        const delRes = await fetch(`${SUPABASE_URL}/rest/v1/resources?id=gte.0`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

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

        if (postRes.ok) {
            loadData();
        }
    };
});

async function updateAvailable(id, newValue) {
    await fetch(`${SUPABASE_URL}/rest/v1/resources?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ available: parseInt(newValue) || 0 })
    });
    loadData();
}

async function loadData() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/resources?select=*&order=total.desc`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });

    const data = await res.json();
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(function(row) {
        const color = row.available > 0 ? '#4CAF50' : '#e63946';
        tbody.innerHTML += `
            <tr>
                <td>${row.name}</td>
                <td>${row.total}</td>
                <td>
                    <span 
                        style="color:${color}; font-weight:600; cursor:pointer;"
                        onclick="startEdit(this, ${row.id}, ${row.available})"
                        title="Натисни щоб змінити"
                    >${row.available}</span>
                </td>
            </tr>
        `;
    });
}

function startEdit(span, id, currentValue) {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.style.cssText = `
        width: 60px;
        background: #2a2a2a;
        color: #ffffff;
        border: 1px solid #e63946;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 14px;
        text-align: center;
    `;

    span.replaceWith(input);
    input.focus();
    input.select();

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            updateAvailable(id, input.value);
        }
        if (e.key === 'Escape') {
            loadData();
        }
    });

    input.addEventListener('blur', function() {
        updateAvailable(id, input.value);
    });
}
