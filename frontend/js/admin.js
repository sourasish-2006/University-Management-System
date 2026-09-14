const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadDepartments();
    loadCourses();

    // Setup Session
    const session = Auth.checkSession('admin');
    if (!session) return;

    // Handle Profile Settings
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgDiv = document.getElementById('settings-msg');
            msgDiv.textContent = 'Updating...';
            msgDiv.className = 'status-msg';
            
            const newUsername = document.getElementById('new-username').value;
            const newPassword = document.getElementById('new-password').value;
            
            if (!newUsername && !newPassword) {
                msgDiv.textContent = 'Please enter a new username or password.';
                msgDiv.classList.add('error');
                return;
            }
            
            const res = await Auth.updateProfile(session.userId, newUsername, newPassword);
            if (res.success) {
                msgDiv.textContent = 'Profile updated successfully!';
                msgDiv.classList.add('success');
                settingsForm.reset();
            } else {
                msgDiv.textContent = res.error || 'Update failed';
                msgDiv.classList.add('error');
            }
        });
    }

    // Handle Department Submit
    document.getElementById('dept-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('dept-msg');
        msgDiv.textContent = 'Saving...';
        msgDiv.className = 'status-msg';

        const data = {
            name: document.getElementById('dept-name').value,
            head_of_department: document.getElementById('dept-head').value
        };

        try {
            const res = await fetch(`${API_BASE}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (res.ok) {
                msgDiv.textContent = 'Department added successfully!';
                msgDiv.classList.add('success');
                document.getElementById('dept-form').reset();
                loadDepartments(); // Refresh lists
            } else {
                msgDiv.textContent = result.error || 'Failed to add department';
                msgDiv.classList.add('error');
            }
        } catch (err) {
            msgDiv.textContent = 'Network error. Ensure Flask server is running.';
            msgDiv.classList.add('error');
        }
    });

    // Handle Course Submit
    document.getElementById('course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('course-msg');
        msgDiv.textContent = 'Saving...';
        msgDiv.className = 'status-msg';

        const data = {
            course_code: document.getElementById('course-code').value,
            title: document.getElementById('course-title').value,
            credits: document.getElementById('course-credits').value,
            department_id: document.getElementById('course-dept').value
        };

        try {
            const res = await fetch(`${API_BASE}/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (res.ok) {
                msgDiv.textContent = 'Course added successfully!';
                msgDiv.classList.add('success');
                document.getElementById('course-form').reset();
                loadCourses(); // Refresh lists
            } else {
                msgDiv.textContent = result.error || 'Failed to add course';
                msgDiv.classList.add('error');
            }
        } catch (err) {
            msgDiv.textContent = 'Network error. Ensure Flask server is running.';
            msgDiv.classList.add('error');
        }
    });
});

async function loadDepartments() {
    try {
        const res = await fetch(`${API_BASE}/departments`);
        if (!res.ok) throw new Error('Failed to fetch');
        const depts = await res.json();
        
        // Update table
        const tbody = document.getElementById('dept-list');
        tbody.innerHTML = '';
        depts.forEach(d => {
            tbody.innerHTML += `<tr><td>${d.id}</td><td>${d.name}</td><td>${d.head_of_department || '-'}</td></tr>`;
        });

        // Update dropdown for Course form
        const select = document.getElementById('course-dept');
        select.innerHTML = '<option value="">Select Department...</option>';
        depts.forEach(d => {
            select.innerHTML += `<option value="${d.id}">${d.name}</option>`;
        });
    } catch (err) {
        document.getElementById('dept-list').innerHTML = `<tr><td colspan="3" class="error">Could not connect to API.</td></tr>`;
        document.getElementById('course-dept').innerHTML = `<option value="">Error loading departments</option>`;
    }
}

async function loadCourses() {
    try {
        const res = await fetch(`${API_BASE}/courses`);
        if (!res.ok) throw new Error('Failed to fetch');
        const courses = await res.json();
        
        const tbody = document.getElementById('course-list');
        tbody.innerHTML = '';
        if (courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No courses found.</td></tr>';
        }
        courses.forEach(c => {
            tbody.innerHTML += `<tr><td>${c.course_code}</td><td>${c.title}</td><td>${c.credits}</td></tr>`;
        });
    } catch (err) {
        document.getElementById('course-list').innerHTML = `<tr><td colspan="3" class="error">Could not connect to API.</td></tr>`;
    }
}
