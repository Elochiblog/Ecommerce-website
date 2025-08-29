// Cart page JavaScript
console.log("Cart page loading...")

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, checking cart availability...")

  // Wait for cart.js to load and initialize
  if (typeof window.cart === "undefined") {
    console.log("Cart not available yet, waiting...")
    setTimeout(() => {
      displayCart()
      updateCartCount()
    }, 100)
  } else {
    console.log("Cart available, displaying cart...")
    displayCart()
    updateCartCount()
  }
})

function displayCart() {
  console.log("Displaying cart...")
  const cartContent = document.getElementById("cartContent")
  const emptyCart = document.getElementById("emptyCart")

  if (!window.cart) {
    console.log("Cart not available")
    return
  }

  const cartItems = window.cart.getItems()
  console.log("Cart items:", cartItems)

  if (cartItems.length === 0) {
    cartContent.classList.add("hidden")
    emptyCart.classList.remove("hidden")
    return
  }

  cartContent.classList.remove("hidden")
  emptyCart.classList.add("hidden")

  const cartHTML = `
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
            ${cartItems.map((item) => createCartItemHTML(item)).join("")}
        </div>
        
        <!-- Cart Summary -->
        <div class="bg-white p-6 rounded-lg shadow-sm h-fit sticky top-8">
            <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
            <div class="space-y-3 mb-6">
                <div class="flex justify-between">
                    <span>Subtotal (${window.cart.getItemCount()} items):</span>
                    <span>${formatPrice(window.cart.getTotal())}</span>
                </div>
                <div class="flex justify-between">
                    <span>Shipping:</span>
                    <span>${window.cart.getTotal() >= 50 ? "Free" : formatPrice(9.99)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Tax:</span>
                    <span>${formatPrice(window.cart.getTotal() * 0.08)}</span>
                </div>
                <div class="border-t pt-3">
                    <div class="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>${formatPrice(calculateTotal())}</span>
                    </div>
                </div>
            </div>
            
            ${
              window.cart.getTotal() < 50
                ? `
                <div class="bg-blue-50 p-3 rounded-lg mb-4">
                    <p class="text-sm text-blue-700">
                        <i class="fas fa-info-circle mr-1"></i>
                        Add ${formatPrice(50 - window.cart.getTotal())} more for free shipping!
                    </p>
                </div>
            `
                : `
                <div class="bg-green-50 p-3 rounded-lg mb-4">
                    <p class="text-sm text-green-700">
                        <i class="fas fa-check-circle mr-1"></i>
                        You qualify for free shipping!
                    </p>
                </div>
            `
            }
            
            <div class="space-y-3">
                <a href="checkout.html" 
                   class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-center block">
                    Proceed to Checkout
                </a>
                <a href="shop.html" 
                   class="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-center block">
                    Continue Shopping
                </a>
            </div>
        </div>
    `

  cartContent.innerHTML = cartHTML
}

function createCartItemHTML(item) {
  return `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 truncate">${item.title}</h3>
                    <p class="text-gray-600 text-sm mt-1">${formatPrice(item.price)} each</p>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="flex items-center border border-gray-300 rounded-lg">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" 
                                class="px-3 py-1 hover:bg-gray-100 ${item.quantity <= 1 ? "opacity-50 cursor-not-allowed" : ""}">
                            -
                        </button>
                        <span class="px-3 py-1 min-w-[3rem] text-center">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" 
                                class="px-3 py-1 hover:bg-gray-100">
                            +
                        </button>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold">${formatPrice(item.price * item.quantity)}</div>
                        <button onclick="removeItem(${item.id})" 
                                class="text-red-600 hover:text-red-800 text-sm">
                            <i class="fas fa-trash mr-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
}

function calculateTotal() {
  const subtotal = window.cart.getTotal()
  const shipping = subtotal >= 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  return subtotal + shipping + tax
}

function formatPrice(price) {
  return `$${price.toFixed(2)}`
}

function updateCartCount() {
  const cartCountElement = document.getElementById("cartCount")
  if (cartCountElement && window.cart) {
    cartCountElement.textContent = window.cart.getItemCount()
  }
}

window.updateQuantity = (productId, newQuantity) => {
  console.log("Updating quantity for product:", productId, "to:", newQuantity)
  if (window.cart) {
    window.cart.updateQuantity(productId, newQuantity)
    displayCart()
    updateCartCount()
  }
}

window.removeItem = (productId) => {
  console.log("Removing item:", productId)
  if (window.cart) {
    window.cart.removeItem(productId)
    displayCart()
    updateCartCount()
  }
}
