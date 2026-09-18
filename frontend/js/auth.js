window.API_BASE = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '';

/**
 * auth.js
 * Mock Authentication module for University Management System
 */

const Auth = {
    // Perform real login against Flask API
    login: async function(role, username, password) {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            
            if (res.ok) {
                // Ensure the user role matches the requested portal role
                if (result.user.role !== role) {
                    alert(`Access Denied: You are not authorized for the ${role} portal.`);
                    return false;
                }
                
                // Set session with database user ID
                sessionStorage.setItem('ums_session', JSON.stringify({
                    userId: result.user.id,
                    username: result.user.username,
                    role: result.user.role,
                    loginTime: new Date().toISOString()
                }));
                return true;
            } else {
                console.error(result.error);
                return false;
            }
        } catch (err) {
            console.error("Login API failed:", err);
            alert("Network error. Please ensure the backend server is running.");
            return false;
        }
    },

    updateProfile: async function(userId, newUsername, newPassword) {
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, new_username: newUsername, new_password: newPassword })
            });
            const result = await res.json();
            
            if (res.ok) {
                // Update session
                const session = JSON.parse(sessionStorage.getItem('ums_session'));
                session.username = result.user.username;
                sessionStorage.setItem('ums_session', JSON.stringify(session));
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    },

    logout: function() {
        sessionStorage.removeItem('ums_session');
        window.location.href = 'home.html';
    },

    checkSession: function(requiredRole) {
        const sessionData = sessionStorage.getItem('ums_session');
        if (!sessionData) {
            window.location.href = 'home.html';
            return null;
        }

        const session = JSON.parse(sessionData);
        
        if (requiredRole && session.role !== requiredRole) {
            alert('Unauthorized access. Redirecting to home.');
            window.location.href = 'home.html';
            return null;
        }

        return session;
    }
};
