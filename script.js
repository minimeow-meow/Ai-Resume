// Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation
    setupNavigation();
    
    // Check if we're on the home page and user is logged in
    if (window.location.pathname.endsWith('index.html') || 
        (window.location.pathname.endsWith('/') && document.getElementById('resumeForm'))) {
        
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        
        setupHomePage();
    }
});

function setupHomePage() {
    // Load existing data if available
    loadFormData();
    
    // Photo upload functionality - CORRECTED VERSION
    const uploadBtn = document.getElementById('uploadBtn');
    const photoUpload = document.getElementById('photoUpload');
    const profilePic = document.getElementById('profilePic');
    
    if (uploadBtn && photoUpload && profilePic) {
        uploadBtn.addEventListener('click', function() {
            const file = photoUpload.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    return;
                }
                
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Please select an image smaller than 2MB.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePic.src = e.target.result;
                    // Save to user data
                    const userData = getUserData();
                    userData.photo = e.target.result;
                    saveUserData(userData);
                    alert('Profile photo uploaded successfully!');
                };
                reader.onerror = function() {
                    alert('Error reading the file. Please try again.');
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select a photo to upload.');
            }
        });
    }
    
    // Dynamic experience fields
    const addExpBtn = document.getElementById('addExperience');
    const experiencesDiv = document.getElementById('experiences');
    
    if (addExpBtn && experiencesDiv) {
        addExpBtn.addEventListener('click', function() {
            const expDiv = document.createElement('div');
            expDiv.className = 'experience-entry';
            expDiv.innerHTML = `
                <input type="text" placeholder="Job Title" class="jobTitle">
                <input type="text" placeholder="Company" class="company">
                <input type="text" placeholder="Dates (e.g., Jan 2020 - Present)" class="dates">
                <textarea placeholder="Description (include achievements)" class="description"></textarea>
                <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
            experiencesDiv.appendChild(expDiv);
        });
    }
    
    // Form submission
    const form = document.getElementById('resumeForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveFormData();
            
            // Generate suggestions
            const userData = getUserData();
            const suggestions = generateSuggestions(userData);
            const user = getCurrentUser();
            localStorage.setItem(`suggestions_${user.username}`, JSON.stringify(suggestions));
            
            // Redirect to resume page
            window.location.href = 'resume.html';
        });
    }
}

function saveFormData() {
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        linkedin: document.getElementById('linkedin').value,
        summary: document.getElementById('summary').value,
        skills: document.getElementById('skills').value,
        degree: document.getElementById('degree').value,
        school: document.getElementById('school').value,
        gradYear: document.getElementById('gradYear').value,
        educationDetails: document.getElementById('educationDetails').value,
        additionalInfo: document.getElementById('additionalInfo').value,
        photo: document.getElementById('profilePic').src,
        experiences: []
    };

    // Collect experiences
    document.querySelectorAll('.experience-entry').forEach(entry => {
        const title = entry.querySelector('.jobTitle') ? entry.querySelector('.jobTitle').value : '';
        const company = entry.querySelector('.company') ? entry.querySelector('.company').value : '';
        const dates = entry.querySelector('.dates') ? entry.querySelector('.dates').value : '';
        const desc = entry.querySelector('.description') ? entry.querySelector('.description').value : '';
        
        if (title || company || dates || desc) {
            data.experiences.push({
                title: title,
                company: company,
                dates: dates,
                desc: desc
            });
        }
    });

    // Validate required fields
    if (!data.name || !data.skills) {
        alert('Please fill name and skills.');
        return;
    }

    // Save data
    saveUserData(data);
}

// AI Resume Generator Function
function generateResume(data) {
    let html = `
        <div class="two-column">
            <div class="column">
                <div class="photo-upload">
                    <img src="${data.photo || 'https://via.placeholder.com/150'}" alt="Profile Picture" class="profile-pic">
                </div>
                
                <h1>${data.name || 'Your Name'}</h1>
                <p>${data.email || 'your.email@example.com'}</p>
                ${data.phone ? `<p>Phone: ${data.phone}</p>` : ''}
                ${data.address ? `<p>Address: ${data.address}</p>` : ''}
                ${data.linkedin ? `<p>LinkedIn: ${data.linkedin}</p>` : ''}
                
                <h2>Summary</h2>
                <p>${data.summary || 'Professional summary goes here.'}</p>
                
                <h2>Skills</h2>
                <ul>${data.skills ? data.skills.split(',').map(skill => `<li>${skill.trim()}</li>`).join('') : '<li>No skills added</li>'}</ul>
            </div>
            
            <div class="column">
                <h2>Education</h2>
                <p><strong>${data.degree || 'Degree'}</strong></p>
                <p>${data.school || 'Institution'}, ${data.gradYear || 'Year'}</p>
                ${data.educationDetails ? `<p>${data.educationDetails}</p>` : ''}
                
                <h2>Experience</h2>
    `;

    if (data.experiences && data.experiences.length > 0) {
        data.experiences.forEach(exp => {
            if (exp.title || exp.company || exp.desc) {
                html += `
                    <div class="exp">
                        <h3>${exp.title || 'Title'} at ${exp.company || 'Company'}</h3>
                        ${exp.dates ? `<p><em>${exp.dates}</em></p>` : ''}
                        <p>${exp.desc || 'Description'}</p>
                    </div>
                `;
            }
        });
    } else {
        html += '<p>No experiences added yet.</p>';
    }
    
    html += `
                <h2>Additional Information</h2>
                <p>${data.additionalInfo || 'Certifications, awards, volunteer work, etc.'}</p>
            </div>
        </div>
    `;

    return html;
}

// AI Suggestions Generator (Rule-based "AI")
function generateSuggestions(data) {
    const suggestions = [];
    if (!data.summary) suggestions.push({ title: 'Summary', text: 'Add a professional summary to highlight your key qualifications.' });
    if (!data.degree || !data.school) suggestions.push({ title: 'Education', text: 'Add your highest degree and school for credibility.' });
    if (data.experiences.length === 0) suggestions.push({ title: 'Experience', text: 'Include at least one role to showcase your career path.' });
    if (data.experiences.some(exp => exp.desc && !exp.desc.toLowerCase().includes('achieved') && !exp.desc.toLowerCase().includes('increased') && !exp.desc.toLowerCase().includes('%') && !exp.desc.toLowerCase().includes('led'))) {
        suggestions.push({ title: 'Achievements', text: 'Use quantifiable metrics (e.g., "Led team to increase sales by 20%") to make experiences impactful.' });
    }
    if (data.skills && data.skills.split(',').filter(s => s.trim()).length < 5) suggestions.push({ title: 'Skills', text: 'Aim for 5-10 skills; tailor to job descriptions.' });
    if (!data.photo || data.photo.includes('placeholder')) suggestions.push({ title: 'Photo', text: 'Add a professional profile photo to make your resume more personal.' });
    if (!data.linkedin) suggestions.push({ title: 'LinkedIn', text: 'Add your LinkedIn profile to provide more professional background.' });
    if (suggestions.length === 0) suggestions.push({ title: 'Overall', text: 'Great start! Consider adding certifications or projects for extra edge.' });
    return suggestions;
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