/**
 * login.js
 * Logic for the University Management System login page
 */

document.addEventListener('DOMContentLoaded', () => {
    // Student Login
    const studentForm = document.querySelector('.login-card:nth-child(1) form');
    if (studentForm) {
        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('student-user').value;
            const password = document.getElementById('student-pass').value;
            
            const success = await Auth.login('student', username, password);
            if (success) {
                window.location.href = 'student.html';
            } else {
                alert('Invalid student credentials');
            }
        });
    }

    // Faculty Login
    const facultyForm = document.querySelector('.login-card:nth-child(2) form');
    if (facultyForm) {
        facultyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('faculty-user').value;
            const password = document.getElementById('faculty-pass').value;
            
            const success = await Auth.login('faculty', username, password);
            if (success) {
                window.location.href = 'faculty.html';
            } else {
                alert('Invalid faculty credentials');
            }
        });
    }

    // Admin Login
    const adminForm = document.querySelector('.login-card:nth-child(3) form');
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-user').value;
            const password = document.getElementById('admin-pass').value;
            
            const success = await Auth.login('admin', username, password);
            if (success) {
                window.location.href = 'admin.html';
            } else {
                alert('Invalid admin credentials');
            }
        });
    }
});
