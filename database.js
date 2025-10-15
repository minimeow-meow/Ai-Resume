// Database functions for user data management
function getUserData() {
    const user = getCurrentUser();
    if (!user) return {};
    return JSON.parse(localStorage.getItem(`userData_${user.username}`) || '{}');
}

function saveUserData(data) {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem(`userData_${user.username}`, JSON.stringify(data));
}

function exportData() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userData = getUserData();
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.username}_resume_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadFormData() {
    if (!isLoggedIn()) return;
    
    const data = getUserData();
    
    // Populate form fields if they exist
    const fields = [
        'name', 'email', 'phone', 'address', 'linkedin', 
        'summary', 'skills', 'degree', 'school', 'gradYear',
        'educationDetails', 'additionalInfo'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && data[field]) {
            element.value = data[field];
        }
    });
    
    // Populate profile photo
    const profilePic = document.getElementById('profilePic');
    if (profilePic && data.photo) {
        profilePic.src = data.photo;
    }
    
    // Populate experiences
    if (data.experiences && data.experiences.length > 0) {
        const experiencesDiv = document.getElementById('experiences');
        if (experiencesDiv) {
            experiencesDiv.innerHTML = '';
            
            data.experiences.forEach(exp => {
                const expDiv = document.createElement('div');
                expDiv.className = 'experience-entry';
                expDiv.innerHTML = `
                    <input type="text" placeholder="Job Title" class="jobTitle" value="${exp.title || ''}">
                    <input type="text" placeholder="Company" class="company" value="${exp.company || ''}">
                    <input type="text" placeholder="Dates" class="dates" value="${exp.dates || ''}">
                    <textarea placeholder="Description" class="description">${exp.desc || ''}</textarea>
                    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
                `;
                experiencesDiv.appendChild(expDiv);
            });
        }
    }
}

// Debug function to see all stored data
function debugStorage() {
    console.log('=== LOCALSTORAGE DEBUG INFO ===');
    
    // Get current user
    const user = getCurrentUser();
    console.log('Current User:', user);
    
    // Show all keys in localStorage
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`Key: ${key}`);
        
        // Try to parse and display the value
        try {
            const value = JSON.parse(localStorage.getItem(key));
            console.log('Value:', value);
        } catch (e) {
            console.log('Value (not JSON):', localStorage.getItem(key));
        }
        console.log('---');
    }
    
    // Show user-specific data
    if (user) {
        console.log('=== USER SPECIFIC DATA ===');
        const userData = getUserData();
        console.log('User Resume Data:', userData);
        
        const suggestions = JSON.parse(localStorage.getItem(`suggestions_${user.username}`) || '[]');
        console.log('User Suggestions:', suggestions);
    }
    
    console.log('=== END DEBUG INFO ===');
}

// Call this function from browser console to see all data
window.debugStorage = debugStorage;