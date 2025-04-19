// Global variables
        let cart = [];
        let cartCount = 0;
        let totalAmount = 0;
        
        // Open tab function
        function openTab(event, tabName) {
            // Hide all tab contents
            let tabContents = document.getElementsByClassName("tab-content");
            for (let i = 0; i < tabContents.length; i++) {
                tabContents[i].classList.remove("active");
            }
            
            // Remove active class from menu items
            let menuItems = document.getElementsByClassName("menu-item");
            for (let i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove("active");
            }
            
            // Show the current tab and add active class
            document.getElementById(tabName).classList.add("active");
            event.currentTarget.classList.add("active");
        }
        
        // Initialize the page
        function initializePage() {
            // Add event listeners to option buttons
            let optionButtons = document.querySelectorAll(".option-btn");
            optionButtons.forEach(button => {
                button.addEventListener("click", function() {
                    // Remove selected class from siblings
                    let siblings = this.parentElement.querySelectorAll(".option-btn");
                    siblings.forEach(sib => sib.classList.remove("selected"));
                    
                    // Add selected class to clicked button
                    this.classList.add("selected");
                });
            });
            
            // Add event listeners to add-to-cart buttons
            let addToCartButtons = document.querySelectorAll(".add-to-cart");
            addToCartButtons.forEach(button => {
                button.addEventListener("click", function() {
                    // Get product info
                    let productName = this.getAttribute("data-name");
                    let basePrice = parseInt(this.getAttribute("data-base-price"));
                    let productImage = this.getAttribute("data-image");
                    let productType = this.getAttribute("data-product-type");
                    
                    // Get selected size and its price
                    let productContainer = this.closest(".product");
                    let selectedSize = productContainer.querySelector(".size-options .selected").getAttribute("data-value");
                    let sizePrice = parseInt(productContainer.querySelector(".size-options .selected").getAttribute("data-price"));
                    
                    // Calculate total price
                    let totalPrice = basePrice + sizePrice;
                    
                    // Create item object
                    let item = {
                        id: Date.now().toString(),
                        name: productName,
                        basePrice: basePrice,
                        size: selectedSize,
                        sizePrice: sizePrice,
                        totalPrice: totalPrice,
                        quantity: 1,
                        image: productImage,
                        productType: productType
                    };
                    
                    // Add sugar level for milk tea
                    if (productType === "milktea") {
                        let selectedSugar = productContainer.querySelector(".sugar-options .selected").getAttribute("data-value");
                        item.sugar = selectedSugar;
                    }
                    
                    // Add to cart
                    addToCart(item);
                    
                    // Show success message
                    showToast(productName + " đã được thêm vào giỏ hàng!");
                });
            });
            
            // Make cart icon scroll with the page
            window.addEventListener("scroll", function() {
                let cartIcon = document.querySelector(".cart-icon");
                let scrollPosition = window.scrollY;
                
                // Adjust position based on scroll
                // Keep it 30px from bottom when at top, move it up as we scroll down
                let bottomPosition = Math.max(30, 30 + scrollPosition * 0.1);
                cartIcon.style.bottom = bottomPosition + "px";
            });
        }
        
        // Add item to cart
        function addToCart(item) {
            // Check if item already exists in cart
            let existingItem = cart.find(cartItem => 
                cartItem.name === item.name && 
                cartItem.size === item.size &&
                (item.productType !== "milktea" || cartItem.sugar === item.sugar)
            );
            
            if (existingItem) {
                // Increase quantity if item already exists
                existingItem.quantity += 1;
                existingItem.totalPrice = existingItem.quantity * (existingItem.basePrice + existingItem.sizePrice);
            } else {
                // Add new item
                cart.push(item);
            }
            
            // Update cart count and UI
            updateCartUI();
        }
        
        // Update cart UI
        function updateCartUI() {
            // Update cart count
            cartCount = cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelector(".cart-count").textContent = cartCount;
            
            // Update cart items
            let cartItemsContainer = document.querySelector(".cart-items");
            cartItemsContainer.innerHTML = "";
            
            // Calculate total amount
            totalAmount = 0;
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = "<p>Giỏ hàng trống</p>";
            } else {
                cart.forEach(item => {
                    totalAmount += item.totalPrice;
                    
                    let itemElement = document.createElement("div");
                    itemElement.className = "cart-item";
                    
                    let optionsText = `Size: ${item.size}`;
                    if (item.sugar) {
                        optionsText += `, Độ ngọt: ${item.sugar}`;
                    }
                    
                    itemElement.innerHTML = `
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-options">${optionsText}</div>
                        </div>
                        <div class="item-price">${formatCurrency(item.totalPrice)}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')">-</button>
                            <input type="text" class="quantity" value="${item.quantity}" readonly>
                            <button class="quantity-btn" onclick="increaseQuantity('${item.id}')">+</button>
                            <button class="remove-item" onclick="removeItem('${item.id}')">🗑️</button>
                        </div>
                    `;
                    
                    cartItemsContainer.appendChild(itemElement);
                });
            }
            
            // Update total amount
            document.querySelector(".cart-total").textContent = `Tổng tiền: ${formatCurrency(totalAmount)}`;
        }
        
        // Format currency
        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        }
        
        // Increase item quantity
        function increaseQuantity(itemId) {
            let item = cart.find(i => i.id === itemId);
            if (item) {
                item.quantity += 1;
                item.totalPrice = item.quantity * (item.basePrice + item.sizePrice);
                updateCartUI();
            }
        }
        
        // Decrease item quantity
        function decreaseQuantity(itemId) {
            let item = cart.find(i => i.id === itemId);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                item.totalPrice = item.quantity * (item.basePrice + item.sizePrice);
                updateCartUI();
            }
        }
        
        // Remove item from cart
        function removeItem(itemId) {
            cart = cart.filter(item => item.id !== itemId);
            updateCartUI();
        }
        
        // Open cart
        function openCart() {
            document.querySelector(".cart-modal").style.display = "block";
            // Reset view to cart items
            document.querySelector(".cart-items").style.display = "block";
            document.querySelector(".cart-total").style.display = "block";
            document.querySelector(".checkout-btn").style.display = "block";
            document.querySelector(".checkout-form").style.display = "none";
            document.querySelector(".success-message").style.display = "none";
        }
        
        // Close cart
        function closeCart() {
            document.querySelector(".cart-modal").style.display = "none";
        }
        
        // Show checkout form
        function showCheckoutForm() {
            if (cart.length === 0) {
                alert("Giỏ hàng của bạn đang trống!");
                return;
            }
            
            document.querySelector(".cart-items").style.display = "none";
            document.querySelector(".cart-total").style.display = "none";
            document.querySelector(".checkout-btn").style.display = "none";
            document.querySelector(".checkout-form").style.display = "block";
        }
        
        // Submit order
        let isSubmitting = false;

        function submitOrder() {
        if (isSubmitting) return;

        let customerName = document.getElementById("customer-name").value;
        let customerPhone = document.getElementById("customer-phone").value;

        if (!customerName || !customerPhone) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
         }

        const submitButton = document.querySelector(".submit-order");
        submitButton.disabled = true;
        submitButton.textContent = "Đang gửi...";
        isSubmitting = true;

        const payload = {
        customerName,
        customerPhone,
        cart
        };

    fetch("https://script.google.com/macros/s/AKfycbxl0-V9DSU8XsLz8g2TWmf5D8_4is-AT_rf7wZbORHR3Wq5TYuVAkr21y7xt3GhJ0TIkw/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        document.querySelector(".checkout-form").style.display = "none";
        document.querySelector(".success-message").style.display = "block";

        cart = [];
        updateCartUI();
    })
    .catch(err => {
        alert("Có lỗi xảy ra khi gửi đơn hàng.");
        console.error(err);
    })
    .finally(() => {
        // Cho dù thành công hay lỗi, cũng reset lại nút
        submitButton.disabled = false;
        submitButton.textContent = "Xác nhận đặt hàng";
        isSubmitting = false;
    });
}

        
        // Continue shopping
        function continueShopping() {
            closeCart();
        }
        
        
    function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    const sound = document.getElementById("addSound");
    sound.currentTime = 0;
    sound.play().catch(err => {
        console.warn("Không thể phát âm thanh:", err);
    });

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

        // Initialize page when loaded
        window.onload = initializePage;