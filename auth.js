// Authentication functions
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username] && users[username].password === password) {
        const currentUser = {
            username: username,
            email: users[username].email,
            createdAt: users[username].createdAt
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return true;
    }
    return false;
}

function register(username, email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
        return false;
    }
    
    users[username] = {
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        const user = getCurrentUser();
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        delete users[user.username];
        localStorage.setItem('users', JSON.stringify(users));
        
        // Remove user data
        localStorage.removeItem(`userData_${user.username}`);
        localStorage.removeItem(`suggestions_${user.username}`);
        
        logout();
    }
}

function setupNavigation() {
    const navLinks = document.getElementById('navLinks');
    const headerText = document.getElementById('headerText');
    
    if (!navLinks) return;
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (headerText) {
            headerText.textContent = `Welcome, ${user.username}! Create your professional resume.`;
        }
        
        navLinks.innerHTML = `
            <a href="index.html">Home</a> |
            <a href="resume.html">Preview Resume</a> |
            <a href="suggestions.html">AI Suggestions</a> |
            <a href="account.html">Account</a> |
            <a href="#" onclick="logout()">Logout</a>
        `;
    } else {
        if (headerText) {
            headerText.textContent = 'Enter your details for a professional, career-boosting resume.';
        }
        
        navLinks.innerHTML = `
            <a href="login.html">Login</a> |
            <a href="register.html">Register</a>
        `;
    }
}