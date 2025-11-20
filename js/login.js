
// Check user credentials in localStorage
function validateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('healwear_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    return user;
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (email && password) {
        const user = validateUser(email, password);

        if (user) {
            // Save current user to localStorage
            localStorage.setItem('healwear_current_user', JSON.stringify(user));

            Swal.fire({
                icon: 'success',
                title: 'Welcome back to HEAL WEAR!',
                html: `
                            <div style="text-align: center;">
                                <i class="fas fa-user-md" style="font-size: 48px; color: #24393E; margin-bottom: 15px;"></i>
                                <p style="color: #333; margin-bottom: 0;">Login successful! Redirecting to your account...</p>
                            </div>
                        `,
                confirmButtonColor: '#24393E',
                confirmButtonText: 'Continue',
                timer: 2000,
                timerProgressBar: true
            }).then((result) => {
                window.location.href = '../index.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                html: `
                            <div style="text-align: center;">
                                <p style="color: #333; margin-bottom: 15px;">User not found or incorrect password.</p>
                                <p style="color: #666; font-size: 14px;">Please check your credentials or create a new account.</p>
                            </div>
                        `,
                showCancelButton: true,
                confirmButtonText: 'Create Account',
                cancelButtonText: 'Try Again',
                confirmButtonColor: '#24393E',
                cancelButtonColor: '#6c757d'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'register.html';
                }
            });
        }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: 'Please enter both email and password',
            confirmButtonColor: '#24393E'
        });
    }
});

// Interactive effects
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.querySelector('i').style.color = 'var(--medical-light)';
        this.style.borderColor = 'var(--medical-blue)';
    });

    input.addEventListener('blur', function () {
        this.parentElement.querySelector('i').style.color = 'var(--medical-blue)';
        if (!this.value) {
            this.style.borderColor = '#404040';
        }
    });
});

// Forgot password handler - redirect to forgot password page
document.querySelector('.forgot-password').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'forgot-password.html';
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = localStorage.getItem('healwear_current_user');
    if (currentUser) {
        // Optional: Auto-fill email if user exists and "Remember me" was checked
        const userData = JSON.parse(currentUser);
        document.getElementById('email').value = userData.email;
    }
});
