//JavaScript for dynamic product loading and cart functionality
let allProducts = [];
let currentProduct = null;

// Check if user is logged in
function checkUserLogin() {
    const currentUser = localStorage.getItem('healwear_current_user');
    if (!currentUser) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required',
            text: 'Please login first to access the website',
            confirmButtonColor: '#24393E',
            confirmButtonText: 'Go to Login'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'pages/login.html';
            }
        });
        return false;
    }
    return true;
}

// Save selected product to localStorage for product details page
function saveSelectedProduct(product) {
    localStorage.setItem('healwear_selected_product', JSON.stringify(product));
}

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products in the container
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = `
            <div class="col-lg-3 col-md-4 col-sm-6 pb-1">
                <div class="product-item bg-light mb-4" data-product-id="${product.id}">
                    <div class="product-img position-relative overflow-hidden">
                        <img class="img-fluid w-100" src="${product.image}" alt="${product.name}" 
                             onerror="this.src='imges/placeholder.jpg'" style="height: 250px; object-fit: cover;">
                        <div class="product-action text-center mt-2">
                            <!-- Add to Cart Button -->
                            <a class="btn btn-medical-action btn-square add-to-cart" data-id="${product.id}">
                                <i class="fa fa-shopping-cart"></i>
                            </a>
                            <!-- View Product -->
                            <a class="btn btn-medical-action btn-square view-product" data-id="${product.id}">
                                <i class="fas fa-eye"></i>
                            </a>
                        </div>
                    </div>
                    <div class="text-center py-4">
                        <a class="h4 text-decoration-none text-truncate product-title">${product.name}</a>
                        <div class="d-flex align-items-center justify-content-center mt-2">
                            <h5 class="text-medical-blue">${product.price} EGP</h5>
                        </div>
                        <div class="d-flex align-items-center justify-content-center mb-1">
                            <small class="fa fa-star text-medical-blue mr-1"></small>
                            <small class="fa fa-star text-medical-blue mr-1"></small>
                            <small class="fa fa-star text-medical-blue mr-1"></small>
                            <small class="fa fa-star-half-alt text-medical-blue mr-1"></small>
                            <small class="fa fa-regular fa-star text-medical-blue mr-1"></small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });

    // Add event listeners for add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            showAddToCartPopup(productId);
        });
    });

    // Add event listeners for view product buttons
    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            viewProductDetails(productId);
        });
    });

    // Add click event to product items for viewing details
    document.querySelectorAll('.product-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function (e) {
            // Only trigger if not clicking on buttons
            if (!e.target.closest('.btn')) {
                const productId = this.getAttribute('data-product-id');
                viewProductDetails(productId);
            }
        });
    });
}

// View product details function
function viewProductDetails(productId) {
    if (!checkUserLogin()) return;

    const product = allProducts.find(p => p.id == productId);
    if (product) {
        // Save product to localStorage
        saveSelectedProduct(product);

        // Redirect to product details page
        window.location.href = `pages/ProductDetail.html?id=${productId}`;
    }
}

// Show add to cart popup
function showAddToCartPopup(productId) {
    if (!checkUserLogin()) return;

    const product = allProducts.find(p => p.id == productId);
    if (!product) return;

    currentProduct = product;

    // Generate sizes options
    const sizesOptions = product.availableSizes.map(size =>
        `<div class="size-option" data-size="${size}">${size}</div>`
    ).join('');

    // Generate colors options
    const colorsOptions = product.availableColors.map(color =>
        `<div class="color-option" data-color="${color.name}" data-color-value="${color.value}">
            <span class="color-preview" style="background-color: ${color.value}"></span>
            ${color.name}
        </div>`
    ).join('');

    Swal.fire({
        title: `Add to Cart `,
        html: `
            <div class="cart-popup-content">
                <div class="mb-3">
                    <strong>Product:</strong> ${product.name}<br>
                    <strong>Price:</strong> ${product.price} EGP
                </div>
                
                <div class="mb-3">
                    <strong>Size:</strong>
                    <div class="size-options">${sizesOptions}</div>
                </div>
                
                <div class="mb-3">
                    <strong>Color:</strong>
                    <div class="color-options">${colorsOptions}</div>
                </div>
                
                <div class="mb-3">
                    <strong>Quantity:</strong>
                    <div class="quantity-selector">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="10">
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                
                <div class="price-summary">
                    <strong>Price Summary:</strong><br>
                    Unit Price: ${product.price} EGP<br>
                    Quantity: <span id="quantityDisplay">1</span><br>
                    <strong>Total: <span id="totalPrice">${product.price}</span> EGP</strong>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add to Cart',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#24393E',
        cancelButtonColor: '#6c757d',
        width: '600px',
        didOpen: () => {
            // Initialize selections
            document.querySelector('.size-option').classList.add('selected');
            document.querySelector('.color-option').classList.add('selected');

            // Size selection
            document.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', function () {
                    document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });

            // Color selection
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', function () {
                    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });

            // Quantity controls
            const quantityInput = document.querySelector('.quantity-input');
            const minusBtn = document.querySelector('.quantity-btn.minus');
            const plusBtn = document.querySelector('.quantity-btn.plus');
            const quantityDisplay = document.getElementById('quantityDisplay');
            const totalPrice = document.getElementById('totalPrice');

            function updateQuantity() {
                const quantity = parseInt(quantityInput.value);
                quantityDisplay.textContent = quantity;
                totalPrice.textContent = (product.price * quantity).toFixed(0);
            }

            minusBtn.addEventListener('click', () => {
                if (quantityInput.value > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                    updateQuantity();
                }
            });

            plusBtn.addEventListener('click', () => {
                if (quantityInput.value < 10) {
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                    updateQuantity();
                }
            });

            quantityInput.addEventListener('change', updateQuantity);
            updateQuantity();
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addToCart(product);
        }
    });
}

// Add to cart function
function addToCart(product) {
    const selectedSize = document.querySelector('.size-option.selected').dataset.size;
    const selectedColor = document.querySelector('.color-option.selected').dataset.color;
    const selectedColorValue = document.querySelector('.color-option.selected').dataset.colorValue;
    const quantity = parseInt(document.querySelector('.quantity-input').value);
    const totalPrice = product.price * quantity;

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));

    if (!currentUser) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required',
            text: 'Please login first to add items to cart',
            confirmButtonColor: '#24393E',
            confirmButtonText: 'Go to Login'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'pages/login.html';
            }
        });
        return;
    }

    // Check if product already exists in cart
    if (isProductInCart(product.id, selectedSize, selectedColor)) {
        Swal.fire({
            icon: 'info',
            title: 'Product Already in Cart',
            html: `
                <div style="text-align: center;">
                    <p><strong>${product.name}</strong> is already in your cart</p>
                    <p>Size: ${selectedSize} | Color: ${selectedColor}</p>
                    <p class="text-muted">You can update the quantity from your cart</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'View Cart',
            cancelButtonText: 'Continue Shopping',
            confirmButtonColor: '#24393E',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'pages/ShoppingCart.html';
            }
        });
        return;
    }

    // Create cart item
    const cartItem = {
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        color: selectedColor,
        colorValue: selectedColorValue,
        quantity: quantity,
        totalPrice: totalPrice,
        image: product.image,
        addedAt: new Date().toISOString()
    };

    // Add to user's cart
    if (!currentUser.cart) {
        currentUser.cart = [];
    }

    currentUser.cart.push(cartItem);

    // Update user in localStorage
    const allUsers = JSON.parse(localStorage.getItem('healwear_users')) || [];
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        localStorage.setItem('healwear_users', JSON.stringify(allUsers));
        localStorage.setItem('healwear_current_user', JSON.stringify(currentUser));
    }

    Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        html: `
            <div style="text-align: center;">
                <p><strong>${product.name}</strong> has been added to your cart</p>
                <p>Size: ${selectedSize} | Color: ${selectedColor}</p>
                <p>Quantity: ${quantity} | Total: ${totalPrice} EGP</p>
            </div>
        `,
        confirmButtonColor: '#24393E',
        confirmButtonText: 'Continue Shopping'
    });
}

// Check if product already exists in cart
function isProductInCart(productId, size, color) {
    const currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));
    if (!currentUser || !currentUser.cart) return false;

    return currentUser.cart.some(item => 
        item.productId === productId && 
        item.size === size && 
        item.color === color
    );
}

// Setup Best Seller section interactions
function setupBestSellerInteractions() {
    // Add event listeners for best seller view buttons
    document.querySelectorAll('.outfit-card .view-product').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            viewProductDetails(productId);
        });
    });

    // Add event listeners for best seller add to cart buttons
    document.querySelectorAll('.outfit-card .add-to-cart').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            showAddToCartPopup(productId);
        });
    });

    // Add click event to best seller cards for viewing details
    document.querySelectorAll('.outfit-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            // Only trigger if not clicking on buttons
            if (!e.target.closest('.btn')) {
                const productId = this.getAttribute('data-product-id');
                viewProductDetails(productId);
            }
        });
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (!checkUserLogin()) {
        return;
    }

    loadProducts();
    setupBestSellerInteractions();

    // Offer Text Animation
    var offerTexts = [
        "Premium Medical Scrubs Collection",
        "Comfort Meets Professional Style",
        "Designed for Healthcare Heroes",
        "Free Shipping on Orders Over 500 EGP",
        "Trusted by Medical Professionals"
    ];

    var currentTextIndex = 0;
    var speed = 50;

    function typeWriter(elementSelector, text, index) {
        var element = document.querySelector(elementSelector);

        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(function () {
                typeWriter(elementSelector, text, index);
            }, speed);
        } else {
            setTimeout(function () {
                element.textContent = "";
                currentTextIndex = (currentTextIndex + 1) % offerTexts.length;
                typeWriter(elementSelector, offerTexts[currentTextIndex], 0);
            }, 2000);
        }
    }

    typeWriter("#offerText", offerTexts[currentTextIndex], 0);

    // Hover effect for best seller section
    document.querySelectorAll(".main-image").forEach(function (img) {
        img.dataset.originalSrc = img.getAttribute("src");
    });

    document.querySelectorAll(".small-images img").forEach(function (smallImg) {
        smallImg.addEventListener("mouseenter", function () {
            const src = this.getAttribute("src");
            this.closest(".outfit-card").querySelector(".main-image").setAttribute("src", src);
        });
    });

    document.querySelectorAll(".main-image").forEach(function (mainImg) {
        mainImg.addEventListener("mouseleave", function () {
            this.setAttribute("src", this.dataset.originalSrc);
        });
    });
});