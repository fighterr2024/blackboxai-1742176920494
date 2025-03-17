// Auth state
let isSignIn = true;

// API endpoints
const API_URL = 'http://localhost:5000/api';
const AUTH_ENDPOINTS = {
    signup: `${API_URL}/auth/signup`,
    login: `${API_URL}/auth/login`,
    verify: `${API_URL}/auth/verify`
};

// Toggle password visibility
function togglePassword(button) {
    const input = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Open auth modal
function openAuthModal(mode) {
    const modal = document.getElementById('authModal');
    const nameField = document.getElementById('nameField');
    const modalTitle = document.getElementById('modalTitle');
    const authButtonText = document.getElementById('authButtonText');
    const switchText = document.getElementById('switchText');
    const switchButton = document.getElementById('switchButton');

    isSignIn = mode === 'signin';
    
    if (isSignIn) {
        nameField.classList.add('hidden');
        modalTitle.textContent = 'Sign In';
        authButtonText.textContent = 'Sign In';
        switchText.textContent = "Don't have an account?";
        switchButton.textContent = 'Sign Up';
    } else {
        nameField.classList.remove('hidden');
        modalTitle.textContent = 'Sign Up';
        authButtonText.textContent = 'Sign Up';
        switchText.textContent = 'Already have an account?';
        switchButton.textContent = 'Sign In';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Add z-index to ensure modal appears on top
    modal.style.zIndex = '50';
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// Toggle between sign in and sign up
function toggleAuthMode() {
    openAuthModal(isSignIn ? 'signup' : 'signin');
}

// Handle authentication
async function handleAuth(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const endpoint = isSignIn ? AUTH_ENDPOINTS.login : AUTH_ENDPOINTS.signup;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.errors?.[0]?.msg || 'Authentication failed');
        }

        // Store token
        localStorage.setItem('token', result.token);

        // Show success message
        showToast(
            isSignIn 
                ? 'Signed in successfully!' 
                : 'Account created successfully!',
            'success'
        );

        // Close modal
        closeAuthModal();

        // If signing in successfully, update UI
        if (isSignIn && result.user) {
            updateUIForAuthenticatedUser(result.user);
        }
    } catch (error) {
        console.error('Auth error:', error);
        showToast(error.message, 'error');
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center gap-3';
    userInfo.innerHTML = `
        <span class="text-sky-200">${user.name}</span>
        <button onclick="handleLogout()" class="px-4 py-2 glass-button rounded-lg text-sky-200 text-sm font-medium">
            Log out
        </button>
    `;
    authButtons.replaceWith(userInfo);
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    window.location.reload();
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token and get user info
        fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.user) {
                updateUIForAuthenticatedUser(result.user);
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
        });
    }
});

// Close modal when clicking outside
document.addEventListener('click', (event) => {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
});
