let allProducts = [];

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        allProducts = data.products;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load cart from localStorage
async function loadCart() {
    await loadProducts(); // Ensure products are loaded first
    const currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));
    const cartContent = document.getElementById('cartContent');

    if (!currentUser || !currentUser.cart || currentUser.cart.length === 0) {
        showEmptyCart();
        return;
    }

    displayCartItems(currentUser.cart);
    updateCartSummary(currentUser.cart);
}

// Show empty cart message
function showEmptyCart() {
    const cartContent = document.getElementById('cartContent');
    cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p class="mb-4">Add some medical scrubs to get started!</p>
                    <a href="../index.html#products" class="btn btn-medical-action">
                        <i class="fas fa-shopping-bag me-2"></i>Start Shopping
                    </a>
                </div>
            `;
}

// Display cart items
function displayCartItems(cartItems) {
    const cartContent = document.getElementById('cartContent');
    let cartHTML = `
                <div class="table-responsive">
                    <table class="table cart-table">
                        <thead>
                            <tr>
                                <th scope="col" class="text-white">Product</th>
                                <th scope="col" class="text-white">Product Size</th>
                                <th scope="col" class="text-white">Product Color</th>
                                <th scope="col" class="text-white">Quantity</th>
                                <th scope="col" class="text-white">Total</th>
                                <th scope="col" class="text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

    cartItems.forEach(item => {
        const product = allProducts.find(p => p.id == item.productId);
        const availableSizes = product ? product.availableSizes : ['S', 'M', 'L', 'XL'];
        const availableColors = product ? product.availableColors : [
            { name: 'Navy Blue', value: '#2E5B8D' },
            { name: 'Sky Blue', value: '#4A7BB6' },
            { name: 'White', value: '#FFFFFF' }
        ];

        // Generate size options
        const sizeOptions = availableSizes.map(size =>
            `<option value="${size}" ${size === item.size ? 'selected' : ''}>${size}</option>`
        ).join('');

        // Generate color options
        const colorOptions = availableColors.map(color =>
            `<option value="${color.name}" data-color-value="${color.value}" ${color.name === item.color ? 'selected' : ''}>
                        ${color.name}
                    </option>`
        ).join('');

        cartHTML += `
                    <tr data-cart-id="${item.id}">
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="../${item.image}" alt="${item.name}" class="me-3"
                                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                                    onerror="this.src='../imges/placeholder.jpg'">
                                <div>
                                    <h6 class="mb-0 text-white">${item.name}</h6>
                                    <small class="text-muted">${item.price} EGP each</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <select class="form-select size-select" data-cart-id="${item.id}">
                                ${sizeOptions}
                            </select>
                        </td>
                        <td>
                            <select class="form-select color-select" data-cart-id="${item.id}">
                                ${colorOptions}
                            </select>
                        </td>
                        <td>
                            <div class="quantity-control">
                                <input type="number" class="form-control quantity" value="${item.quantity}" min="1" max="10"
                                    data-price="${item.price}" data-cart-id="${item.id}">
                            </div>
                        </td>
                        <td class="product-total text-white">${item.totalPrice} EGP</td>
                        <td>
                            <button class="btn btn-danger btn-sm remove-product" data-cart-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
    });

    cartHTML += `
                        </tbody>
                    </table>
                </div>
            `;

    cartContent.innerHTML = cartHTML;

    // Show summary and actions
    document.getElementById('cartSummary').style.display = 'block';
    document.getElementById('cartActions').style.display = 'block';

    // Add event listeners
    addCartEventListeners();
}

// Update cart summary
function updateCartSummary(cartItems) {
    let total = 0;
    cartItems.forEach(item => {
        total += item.totalPrice;
    });

    document.getElementById('total').textContent = total + ' EGP';
}

// Add event listeners to cart elements
function addCartEventListeners() {
    // Quantity change
    document.querySelectorAll('.quantity').forEach(input => {
        input.addEventListener('change', function () {
            updateCartItemQuantity(this);
        });
    });

    // Size change
    document.querySelectorAll('.size-select').forEach(select => {
        select.addEventListener('change', function () {
            updateCartItemSize(this);
        });
    });

    // Color change
    document.querySelectorAll('.color-select').forEach(select => {
        select.addEventListener('change', function () {
            updateCartItemColor(this);
        });
    });

    // Remove product
    document.querySelectorAll('.remove-product').forEach(button => {
        button.addEventListener('click', function () {
            removeCartItem(this);
        });
    });
}

// Update cart item quantity
function updateCartItemQuantity(input) {
    const cartId = input.getAttribute('data-cart-id');
    const newQuantity = parseInt(input.value);
    const price = parseFloat(input.getAttribute('data-price'));
    const totalPrice = price * newQuantity;

    // Update in localStorage
    const currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));
    const cartItem = currentUser.cart.find(item => item.id == cartId);

    if (cartItem) {
        cartItem.quantity = newQuantity;
        cartItem.totalPrice = totalPrice;

        // Update UI
        const totalCell = input.closest('tr').querySelector('.product-total');
        totalCell.textContent = totalPrice + ' EGP';

        // Save changes
        saveUserCart(currentUser);
        updateCartSummary(currentUser.cart);
    }
}

// Update cart item size
function updateCartItemSize(select) {
    const cartId = select.getAttribute('data-cart-id');
    const newSize = select.value;

    // Update in localStorage
    const currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));
    const cartItem = currentUser.cart.find(item => item.id == cartId);

    if (cartItem) {
        cartItem.size = newSize;

        // Save changes
        saveUserCart(currentUser);

        // Show success message
        showUpdateMessage('Size updated successfully');
    }
}

// Update cart item color
function updateCartItemColor(select) {
    const cartId = select.getAttribute('data-cart-id');
    const newColor = select.value;
    const newColorValue = select.options[select.selectedIndex].getAttribute('data-color-value');

    // Update in localStorage
    const currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));
    const cartItem = currentUser.cart.find(item => item.id == cartId);

    if (cartItem) {
        cartItem.color = newColor;
        cartItem.colorValue = newColorValue;

        // Save changes
        saveUserCart(currentUser);

        // Show success message
        showUpdateMessage('Color updated successfully');
    }
}

// Remove cart item
function removeCartItem(button) {
    const cartId = button.getAttribute('data-cart-id');
    const currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));

    // Remove from cart
    currentUser.cart = currentUser.cart.filter(item => item.id != cartId);

    // Save changes
    saveUserCart(currentUser);

    // Update UI
    const row = button.closest('tr');
    row.style.transition = 'all 0.3s ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(-100px)';

    setTimeout(() => {
        if (currentUser.cart.length === 0) {
            showEmptyCart();
            document.getElementById('cartSummary').style.display = 'none';
            document.getElementById('cartActions').style.display = 'none';
        } else {
            row.remove();
            updateCartSummary(currentUser.cart);
        }
    }, 300);
}

// Show update message
function showUpdateMessage(message) {
    Swal.fire({
        icon: 'success',
        title: message,
        confirmButtonColor: '#24393E',
        timer: 1500,
        showConfirmButton: false
    });
}

// Save user cart to localStorage
function saveUserCart(user) {
    const allUsers = JSON.parse(localStorage.getItem('healwear_users')) || [];
    const userIndex = allUsers.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
        allUsers[userIndex] = user;
        localStorage.setItem('healwear_users', JSON.stringify(allUsers));
        localStorage.setItem('healwear_current_user', JSON.stringify(user));
    }
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadCart();
});
