// forgot-password.js

// Function to reset user password
function resetUserPassword(email, newPassword) {
    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem('healwear_users')) || [];
    
    // Find user by email
    const userIndex = existingUsers.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
        return { success: false, message: 'Email not found' };
    }
    
    // Update user's password
    existingUsers[userIndex].password = newPassword;
    existingUsers[userIndex].updatedAt = new Date().toISOString();
    
    // Save updated users back to localStorage
    localStorage.setItem('healwear_users', JSON.stringify(existingUsers));
    
    return { 
        success: true, 
        message: 'Password reset successfully',
        user: existingUsers[userIndex]
    };
}

document.getElementById('resetPasswordForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validation
    if (newPassword !== confirmNewPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Password Mismatch',
            text: 'New passwords do not match. Please try again.',
            confirmButtonColor: '#24393E'
        });
        return;
    }

    if (newPassword.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Weak Password',
            text: 'Password must be at least 6 characters long.',
            confirmButtonColor: '#24393E'
        });
        return;
    }

    // Show confirmation dialog
    Swal.fire({
        title: 'Confirm Password Reset',
        html: `
            <div style="text-align: center;">
                <i class="fas fa-key" style="font-size: 48px; color: #24393E; margin-bottom: 15px;"></i>
                <p style="color: #333; margin-bottom: 10px;">Are you sure you want to reset your password?</p>
                <p style="color: #666; font-size: 14px;">This action cannot be undone.</p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Yes, Reset Password',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#24393E',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            // Reset password in localStorage
            const resetResult = resetUserPassword(email, newPassword);

            if (resetResult.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Reset Successful!',
                    html: `
                        <div style="text-align: center;">
                            <i class="fas fa-check-circle" style="font-size: 48px; color: #28a745; margin-bottom: 15px;"></i>
                            <p style="color: #333; margin-bottom: 10px;">Your password has been reset successfully!</p>
                            <p style="color: #666; font-size: 14px;">You can now login with your new password.</p>
                        </div>
                    `,
                    confirmButtonColor: '#24393E',
                    confirmButtonText: 'Go to Login'
                }).then((result) => {
                    // Redirect to login page
                    window.location.href = 'login.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Reset Failed',
                    text: resetResult.message,
                    confirmButtonColor: '#24393E',
                    confirmButtonText: 'Try Again'
                });
            }
        }
    });
});

// Password strength indicator
document.getElementById('newPassword').addEventListener('input', function () {
    const password = this.value;
    const strengthBar = document.getElementById('passwordStrength');

    if (password.length === 0) {
        strengthBar.className = 'password-strength-bar';
        strengthBar.style.width = '0%';
    } else if (password.length < 6) {
        strengthBar.className = 'password-strength-bar strength-weak';
    } else if (password.length < 8) {
        strengthBar.className = 'password-strength-bar strength-medium';
    } else {
        // Check for strong password (mix of characters)
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) {
            strengthBar.className = 'password-strength-bar strength-strong';
        } else {
            strengthBar.className = 'password-strength-bar strength-medium';
        }
    }
});

// Confirm password validation
document.getElementById('confirmNewPassword').addEventListener('blur', function () {
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = this.value;

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
        this.style.borderColor = '#dc3545';
    } else if (confirmNewPassword) {
        this.style.borderColor = '#28a745';
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

// Check if user is logged in and pre-fill email
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = localStorage.getItem('healwear_current_user');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        document.getElementById('email').value = userData.email;
    }
});