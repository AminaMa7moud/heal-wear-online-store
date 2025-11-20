const GOOGLE_SCRIPT_URL ="https://script.google.com/macros/s/AKfycbx90uB4OhO1LV9SpgpjAGOhilyy2NFuO6kD6q1-Pg-fKoF1j-J0Y-9i6rvutArOs_ku/exec";

let cartItems = [];
let currentUser = null;

function loadCart() {
    currentUser = JSON.parse(localStorage.getItem('healwear_current_user'));
    if (!currentUser || !currentUser.cart || currentUser.cart.length === 0) {
        showEmptyCart();
        return;
    }
    cartItems = currentUser.cart;
    displayCheckoutContent();
}

function showEmptyCart() {
    const checkoutContent = document.getElementById('checkoutContent');
    checkoutContent.innerHTML = `
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

function displayCheckoutContent() {
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const checkoutContent = document.getElementById('checkoutContent');
    checkoutContent.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h3 class="section-title"><i class="fas fa-receipt me-2"></i>Order Summary</h3>
                <div class="order-summary">
                    ${cartItems.map(item => `
                        <div class="order-item">
                            <div class="item-info">
                                <h6 class="mb-1 text-white">${item.name}</h6>
                                <small class="text-muted">Size: ${item.size} | Qty: ${item.quantity} | Color: ${item.color}</small>
                            </div>
                            <div class="item-price">
                                <strong class="text-white">${item.totalPrice} EGP</strong>
                            </div>
                        </div>
                    `).join('')}
                    <div class="order-item order-total">
                        <div class="text-white">Total Amount:</div>
                        <div class="text-white">${total} EGP</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <h3 class="section-title"><i class="fas fa-shipping-fast me-2"></i>Shipping Information</h3>
                <form id="checkoutForm" class="checkout-form">
                    <div class="row mb-3">
                        <div class="col-12">
                            <label for="fullName" class="form-label">Full Name *</label>
                            <input type="text" class="form-control" id="fullName" placeholder="Enter your full name" required value="${currentUser ? currentUser.firstName + ' ' + currentUser.lastName : ''}">
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-12">
                            <label for="email" class="form-label">Email Address *</label>
                            <input type="email" class="form-control" id="email" placeholder="Enter your email address" required value="${currentUser ? currentUser.email : ''}">
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-12">
                            <label for="address" class="form-label">Full Address *</label>
                            <textarea class="form-control" id="address" rows="3" placeholder="Enter your complete address" required></textarea>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6 mb-3">
                            <label for="phone1" class="form-label">Primary Phone *</label>
                            <input type="tel" class="form-control" id="phone1" placeholder="+20 123 456 7890" required value="${currentUser ? currentUser.phone : ''}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="phone2" class="form-label">Secondary Phone *</label>
                            <input type="tel" class="form-control" id="phone2" placeholder="+20 987 654 3210" required>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-12">
                            <label class="form-label">Payment Method</label>
                            <div class="payment-methods">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="paymentMethod" id="cashOnDelivery" checked>
                                    <label class="form-check-label text-white" for="cashOnDelivery">
                                        <i class="fas fa-money-bill-wave me-2"></i>Cash on Delivery
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12 text-center">
                            <button type="submit" class="btn btn-confirm w-100">
                                <i class="fas fa-lock me-2"></i>Complete Order
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    document.getElementById('phone1').addEventListener('input', formatPhone);
    document.getElementById('phone2').addEventListener('input', formatPhone);
}

function formatPhone(e) {
    this.value = this.value.replace(/[^\d+]/g, '');
}

async function handleCheckout(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const phone1 = document.getElementById('phone1').value;
    const phone2 = document.getElementById('phone2').value;

    if (!fullName || !email || !address || !phone1 || !phone2) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Information',
            text: 'Please fill in all required fields',
            confirmButtonColor: '#24393E'
        });
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const order = {
        orderId: Date.now(),
        customerName: fullName,
        customerEmail: email,
        customerPhone1: phone1,
        customerPhone2: phone2,
        customerAddress: address,
        total: total,
        items: formatOrderItems(cartItems),
        orderDate: new Date().toISOString()
    };

    try {
        Swal.fire({
            title: 'Processing Order...',
            text: 'Please wait while we save your order',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // إرسال البيانات للجوجل شيت
        await sendToGoogleSheet(order);
        
        // حفظ محلي
        saveOrder(order);
        clearUserCart();
        
        // رسالة نجاح
        showSuccessMessage(order);

    } catch (error) {
        console.error('Order processing error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Order Failed',
            text: 'There was an error processing your order. Please try again.',
            confirmButtonColor: '#24393E'
        });
    }
}

function formatOrderItems(items) {
    return items.map(item =>
        `${item.name} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity} | Price: ${item.totalPrice} EGP`
    ).join(' || ');
}

// إرسال البيانات للجوجل شيت باستخدام XMLHttpRequest
async function sendToGoogleSheet(order) {
    return new Promise((resolve) => {
        // حولي البيانات لـ رابط
        const url = GOOGLE_SCRIPT_URL + 
            '?orderId=' + encodeURIComponent(order.orderId) +
            '&customerName=' + encodeURIComponent(order.customerName) +
            '&customerEmail=' + encodeURIComponent(order.customerEmail) +
            '&customerPhone1=' + encodeURIComponent(order.customerPhone1) +
            '&customerPhone2=' + encodeURIComponent(order.customerPhone2) +
            '&customerAddress=' + encodeURIComponent(order.customerAddress) +
            '&total=' + encodeURIComponent(order.total) +
            '&items=' + encodeURIComponent(order.items);
        
        console.log('🔗 Sending to:', url);
        
        // إرسال بسيط
        const img = new Image();
        img.src = url;
        
        resolve(true);
        
        // بعد 2 ثانية نعتبرها نجحت
        setTimeout(() => resolve(true), 2000);
    });
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('healwear_orders')) || [];
    orders.push(order);
    localStorage.setItem('healwear_orders', JSON.stringify(orders));
}

function clearUserCart() {
    if (currentUser) {
        currentUser.cart = [];
        const allUsers = JSON.parse(localStorage.getItem('healwear_users')) || [];
        const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            allUsers[userIndex] = currentUser;
            localStorage.setItem('healwear_users', JSON.stringify(allUsers));
            localStorage.setItem('healwear_current_user', JSON.stringify(currentUser));
        }
    }
}

function showSuccessMessage(order) {
    Swal.fire({
        icon: 'success',
        title: 'Order Confirmed!',
        html: `
            <div class="text-start">
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Phone:</strong> ${order.customerPhone1}</p>
                <p><strong>Address:</strong> ${order.customerAddress}</p>
                <p><strong>Total Amount:</strong> ${order.total} EGP</p>
                <p class="mt-3 text-success">✅ تم تأكيد طلبك بنجاح!</p>
                <p class="text-muted">سيتم توجيهك إلى الصفحة الرئيسية...</p>
            </div>
        `,
        confirmButtonColor: '#24393E',
        timer: 2000, 
        timerProgressBar: true,
        showConfirmButton: false
    }).then((result) => {
        window.location.href = '../index.html';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadCart();
});