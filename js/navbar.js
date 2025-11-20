// navbar.js - Handle navigation bar authentication state

// Check if user is logged in
function isUserLoggedIn() {
    const currentUser = localStorage.getItem('healwear_current_user');
    return currentUser !== null;
}

// Get current user data
function getCurrentUser() {
    const currentUser = localStorage.getItem('healwear_current_user');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Handle logout
function handleLogout() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out of your account",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#24393E',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Logout',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove current user from localStorage
            localStorage.removeItem('healwear_current_user');
            
            Swal.fire({
                icon: 'success',
                title: 'Logged out successfully!',
                text: 'You have been logged out of your account',
                confirmButtonColor: '#24393E',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Redirect to login page
                window.location.href = 'pages/login.html';
            });
        }
    });
}

// Update navigation bar based on login status
function updateNavigationBar() {
    const loginLink = document.getElementById('login');
    const logoutLink = document.getElementById('logout');
    const userIcon = document.querySelector('.fa-user');

    if (isUserLoggedIn()) {
        // User is logged in - show logout, hide login
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        
        // Update user icon to show logged in state
        if (userIcon) {
            userIcon.className = 'fa-solid fa-user-check me-4 text-white';
            const user = getCurrentUser();
            if (user) {
                loginLink.title = `Logged in as ${user.firstName}`;
            }
        }
    } else {
        // User is not logged in - show login, hide logout
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        
        // Reset user icon
        if (userIcon) {
            userIcon.className = 'fa-solid fa-user me-4 text-white';
            loginLink.title = 'Log in';
        }
    }
}

// Add event listener to logout link
function setupLogoutListener() {
    const logoutLink = document.getElementById('logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Initialize navigation bar when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateNavigationBar();
    setupLogoutListener();
    
    // Optional: Add click event to user icon when logged in
    const userIcon = document.querySelector('.fa-user-check');
    if (userIcon && isUserLoggedIn()) {
        userIcon.closest('a').addEventListener('click', function(e) {
            e.preventDefault();
            const user = getCurrentUser();
            Swal.fire({
                title: `Welcome, ${user.firstName}!`,
                html: `
                    <div style="text-align: center;">
                        <i class="fas fa-user-md" style="font-size: 48px; color: #24393E; margin-bottom: 15px;"></i>
                        <p style="color: #333; margin-bottom: 5px;"><strong>Email:</strong> ${user.email}</p>
                        <p style="color: #666; font-size: 14px;">You are currently logged in</p>
                    </div>
                `,
                confirmButtonColor: '#24393E',
                confirmButtonText: 'OK'
            });
        });
    }
});

// Export functions for use in other files (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isUserLoggedIn,
        getCurrentUser,
        handleLogout,
        updateNavigationBar
    };
}