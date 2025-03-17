// Toast notification system
const toastTypes = {
    success: {
        icon: 'fa-check-circle',
        bgColor: 'bg-green-500'
    },
    error: {
        icon: 'fa-exclamation-circle',
        bgColor: 'bg-red-500'
    },
    info: {
        icon: 'fa-info-circle',
        bgColor: 'bg-blue-500'
    }
};

function showToast(message, type = 'success', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    const typeConfig = toastTypes[type];
    
    toast.className = `${typeConfig.bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform translate-x-full transition-transform duration-300`;
    toast.innerHTML = `
        <i class="fas ${typeConfig.icon}"></i>
        <span>${message}</span>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Remove toast after duration
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, duration);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check URL for verification token
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get('token');

    if (verificationToken) {
        // Verify email
        fetch(`${API_URL}/auth/verify?token=${verificationToken}`)
            .then(response => response.json())
            .then(result => {
                if (result.message) {
                    showToast(result.message, 'success');
                }
            })
            .catch(error => {
                console.error('Verification error:', error);
                showToast('Email verification failed', 'error');
            });
    }
});

// Export functions for global use
window.showToast = showToast;
