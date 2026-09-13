const API_URL = '/api/students';

const form = document.getElementById('student-form');
const tbody = document.getElementById('students-tbody');
const emptyMsg = document.getElementById('empty-msg');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchBox = document.getElementById('search-box');

let allStudents = [];
let editingId = null;

// ==================== ډاټا راوړل او ښودل ====================
async function loadStudents() {
    try {
        const res = await fetch(API_URL);
        allStudents = await res.json();
        renderTable(allStudents);
    } catch (err) {
        alert('د معلوماتو په راوړلو کې ستونزه: ' + err.message);
    }
}

function renderTable(students) {
    tbody.innerHTML = '';

    if (students.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    students.forEach((s, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(s.full_name)}</td>
            <td>${escapeHtml(s.father_name || '-')}</td>
            <td>${escapeHtml(s.class_name || '-')}</td>
            <td>${s.age || '-'}</td>
            <td>${escapeHtml(s.phone || '-')}</td>
            <td>${escapeHtml(s.address || '-')}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${s.id}">ایډیټ</button>
                <button class="action-btn delete-btn" data-id="${s.id}">حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // د ایډیټ او حذف بټنونو لپاره event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => startEdit(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== اضافه کول / بدلول ====================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        full_name: document.getElementById('full_name').value.trim(),
        father_name: document.getElementById('father_name').value.trim(),
        class_name: document.getElementById('class_name').value.trim(),
        age: document.getElementById('age').value || null,
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };

    if (!data.full_name) {
        alert('د زده کونکي نوم اړین دی');
        return;
    }

    try {
        if (editingId) {
            // بدلول (Update)
            const res = await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error((await res.json()).error);
        } else {
            // اضافه کول (Create)
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error((await res.json()).error);
        }

        resetForm();
        loadStudents();
    } catch (err) {
        alert('خطا: ' + err.message);
    }
});

function startEdit(id) {
    const student = allStudents.find(s => s.id == id);
    if (!student) return;

    editingId = id;
    document.getElementById('student-id').value = id;
    document.getElementById('full_name').value = student.full_name;
    document.getElementById('father_name').value = student.father_name || '';
    document.getElementById('class_name').value = student.class_name || '';
    document.getElementById('age').value = student.age || '';
    document.getElementById('phone').value = student.phone || '';
    document.getElementById('address').value = student.address || '';

    formTitle.textContent = '✏️ د زده کونکي معلومات بدل کړئ';
    submitBtn.textContent = 'بدلونونه خوندي کړئ';
    cancelBtn.style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteStudent(id) {
    if (!confirm('ایا تاسو ډاډه یاست چې دا زده کونکی حذف کړئ؟')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error((await res.json()).error);
        loadStudents();
    } catch (err) {
        alert('خطا: ' + err.message);
    }
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    editingId = null;
    document.getElementById('student-id').value = '';
    formTitle.textContent = '➕ نوی زده کونکی اضافه کړئ';
    submitBtn.textContent = 'زده کونکی اضافه کړئ';
    cancelBtn.style.display = 'none';
}

// ==================== لټون ====================
searchBox.addEventListener('input', () => {
    const q = searchBox.value.trim().toLowerCase();
    if (!q) {
        renderTable(allStudents);
        return;
    }
    const filtered = allStudents.filter(s =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.father_name || '').toLowerCase().includes(q) ||
        (s.class_name || '').toLowerCase().includes(q)
    );
    renderTable(filtered);
});

// پیل
loadStudents();
