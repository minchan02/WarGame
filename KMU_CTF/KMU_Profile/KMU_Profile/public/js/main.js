// Common utility functions

function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `message-${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/index.html';
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Check authentication status
function checkAuth() {
    fetch('/api/users')
        .then(response => {
            if (!response.ok) {
                window.location.href = '/index.html';
            }
        })
        .catch(() => {
            window.location.href = '/index.html';
        });
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}