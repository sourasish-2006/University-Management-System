/**
 * faculty.js
 * Logic for the University Management System faculty dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verify Authentication
    const session = Auth.checkSession('faculty');
    if (!session) return;

    // 2. Personalize Dashboard
    const heading = document.querySelector('h1');
    if (heading) {
        heading.textContent = `Welcome to Faculty Portal, ${session.username}`;
    }

    // 2.5 Handle Profile Settings
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgDiv = document.getElementById('settings-msg');
            msgDiv.textContent = 'Updating...';
            msgDiv.style.color = '#333';
            
            const newUsername = document.getElementById('new-username').value;
            const newPassword = document.getElementById('new-password').value;
            
            if (!newUsername && !newPassword) {
                msgDiv.textContent = 'Please enter a new username or password.';
                msgDiv.style.color = '#ef4444';
                return;
            }
            
            const res = await Auth.updateProfile(session.userId, newUsername, newPassword);
            if (res.success) {
                msgDiv.textContent = 'Profile updated successfully!';
                msgDiv.style.color = '#10b981';
                settingsForm.reset();
                if (heading) heading.textContent = `Welcome to Faculty Portal, ${sessionStorage.getItem('ums_session') ? JSON.parse(sessionStorage.getItem('ums_session')).username : ''}`;
            } else {
                msgDiv.textContent = res.error || 'Update failed';
                msgDiv.style.color = '#ef4444';
            }
        });
    }

    // 3. Handle Menu Card Clicks
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const href = card.getAttribute('href');
            
            // Handle Logout
            if (card.classList.contains('logout') || href === 'home.html') {
                e.preventDefault();
                Auth.logout();
                return;
            }
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const viewId = href.substring(1) + '-view';
                const viewElement = document.getElementById(viewId);
                
                if (viewElement) {
                    document.querySelector('.menu-grid').style.display = 'none';
                    document.querySelectorAll('.feature-view').forEach(v => v.classList.add('hidden'));
                    viewElement.classList.remove('hidden');
                } else {
                    const actionName = card.querySelector('h3') ? card.querySelector('h3').textContent : href.substring(1);
                    alert(`Navigating to Faculty feature: ${actionName}\n(This feature will be implemented soon)`);
                }
            }
        });
    });

    // 4. Back to Menu buttons
    document.querySelectorAll('.btn-back-menu').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.feature-view').forEach(v => v.classList.add('hidden'));
            document.querySelector('.menu-grid').style.display = 'grid'; 
        });
    });

    // 5. Results form submission
    const resultsForm = document.getElementById('results-form');
    if (resultsForm) {
        resultsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgDiv = document.getElementById('results-msg');
            msgDiv.textContent = 'Uploading...';
            msgDiv.style.color = '#333';
            
            const level = document.getElementById('res-level').value;
            const program = document.getElementById('res-program').value;
            const title = document.getElementById('res-title').value;
            const link = document.getElementById('res-link').value;
            
            try {
                const res = await fetch('http://localhost:5000/api/faculty/results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parent_level: level, program: program, title: title, result_link: link })
                });
                const data = await res.json();
                if (res.ok) {
                    msgDiv.textContent = 'Result uploaded successfully!';
                    msgDiv.style.color = '#10b981';
                    resultsForm.reset();
                } else {
                    throw new Error(data.error || 'Upload failed');
                }
            } catch (err) {
                msgDiv.textContent = err.message;
                msgDiv.style.color = '#ef4444';
            }
        });
    }
});
