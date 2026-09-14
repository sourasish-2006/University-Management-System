/**
 * student.js
 * Logic for the University Management System student dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verify Authentication
    const session = Auth.checkSession('student');
    if (!session) return; // Stop execution if no valid session

    // 2. Personalize Dashboard
    const heading = document.querySelector('h1');
    if (heading) {
        heading.textContent = `Welcome to Student Portal, ${session.username}`;
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
                if (heading) heading.textContent = `Welcome to Student Portal, ${sessionStorage.getItem('ums_session') ? JSON.parse(sessionStorage.getItem('ums_session')).username : ''}`;
            } else {
                msgDiv.textContent = res.error || 'Update failed';
                msgDiv.style.color = '#ef4444';
            }
        });
    }

    // 3. Handle Menu Card Clicks
    const menuCards = document.querySelectorAll('.menu-card');
    const mainMenu = document.getElementById('main-menu');
    const featureViews = document.querySelectorAll('.feature-view');
    const backButtons = document.querySelectorAll('.btn-back-menu');

    function hideAllViews() {
        mainMenu.classList.add('hidden');
        featureViews.forEach(view => view.classList.add('hidden'));
    }

    menuCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const href = card.getAttribute('href');
            
            // Handle Logout
            if (card.classList.contains('logout') || href === 'home.html') {
                e.preventDefault();
                Auth.logout();
                return;
            }
            
            // Navigate to internal views
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetViewId = href.substring(1) + '-view';
                const targetView = document.getElementById(targetViewId);
                
                if (targetView) {
                    hideAllViews();
                    targetView.classList.remove('hidden');
                } else {
                    alert('Feature not found');
                }
            }
        });
    });

    // 4. Handle "Back to Menu" buttons
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            hideAllViews();
            mainMenu.classList.remove('hidden');
        });
    });

    // 5. Fetch Real Data from Backend
    fetchAvailableCourses();
});

async function fetchAvailableCourses() {
    try {
        const res = await fetch('http://localhost:5000/api/courses');
        if (res.ok) {
            const courses = await res.json();
            const tbody = document.querySelector('#results-view tbody');
            if (tbody) {
                tbody.innerHTML = ''; // Clear mock data
                if(courses.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3">No courses available yet.</td></tr>';
                }
                courses.forEach(c => {
                    tbody.innerHTML += `<tr>
                        <td>${c.title} (${c.course_code})</td>
                        <td>Not Graded</td>
                        <td>${c.credits}</td>
                    </tr>`;
                });
            }
        }
    } catch (err) {
        console.error("Failed to fetch backend data", err);
    }
}
