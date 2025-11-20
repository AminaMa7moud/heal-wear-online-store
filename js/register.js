// Save user to localStorage
function saveUserToLocalStorage(userData) {
    // Get existing users or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem('healwear_users')) || [];

    // Check if email already exists
    const emailExists = existingUsers.some(user => user.email === userData.email);
    if (emailExists) {
        return { success: false, message: 'Email already exists' };
    }

    // Add new user
    existingUsers.push(userData);
    localStorage.setItem('healwear_users', JSON.stringify(existingUsers));
    return { success: true, message: 'User registered successfully' };
}

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validation
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Password Mismatch',
            text: 'Passwords do not match. Please try again.',
            confirmButtonColor: '#24393E'
        });
        return;
    }

    if (!agreeTerms) {
        Swal.fire({
            icon: 'error',
            title: 'Terms Required',
            text: 'Please agree to the Terms & Conditions.',
            confirmButtonColor: '#24393E'
        });
        return;
    }

    // Create user object
    const userData = {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password, // In real app, this should be hashed
        createdAt: new Date().toISOString(),
        cart: [] // Initialize empty cart for the user
    };

    // Save user to localStorage
    const result = saveUserToLocalStorage(userData);

    if (result.success) {
        // Also save current logged in user
        localStorage.setItem('healwear_current_user', JSON.stringify(userData));

        Swal.fire({
            icon: 'success',
            title: 'Welcome to HEAL WEAR!',
            html: `
                        <div style="text-align: center;">
                            <i class="fas fa-check-circle" style="font-size: 48px; color: #28a745; margin-bottom: 15px;"></i>
                            <p style="color: #333; margin-bottom: 10px;">Account created successfully!</p>
                            <p style="color: #666; font-size: 14px; margin-bottom: 0;">Welcome to our medical community, ${firstName}!</p>
                        </div>
                    `,
            confirmButtonColor: '#24393E',
            confirmButtonText: 'Continue Shopping'
        }).then((result) => {
            window.location.href = '../index.html';
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: result.message,
            confirmButtonColor: '#24393E'
        });
    }
});

// Password strength indicator
document.getElementById('password').addEventListener('input', function () {
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

// Phone number formatting
document.getElementById('phone').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^\d+]/g, '');
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

// Terms link handler
document.querySelectorAll('.terms-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        Swal.fire({
            title: 'Terms & Conditions',
            html: `
                        <div style="text-align: left; max-height: 300px; overflow-y: auto;">
                            <h6>Welcome to HEAL WEAR!</h6>
                            <p>By creating an account, you agree to our terms and conditions regarding:</p>
                            <ul>
                                <li>Privacy and data protection</li>
                                <li>Order processing and delivery</li>
                                <li>Returns and refunds policy</li>
                                <li>Account security</li>
                            </ul>
                            <p>For full details, please contact our support team.</p>
                        </div>
                    `,
            confirmButtonColor: '#24393E',
            confirmButtonText: 'I Understand'
        });
    });
});

// Confirm password validation
document.getElementById('confirmPassword').addEventListener('blur', function () {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#dc3545';
    } else if (confirmPassword) {
        this.style.borderColor = '#28a745';
    }
});
