// Checkout page JavaScript

function waitForGlobals() {
  return new Promise((resolve) => {
    const checkGlobals = () => {
      if (window.cart && window.api) {
        console.log("Global cart and api objects are available")
        resolve()
      } else {
        console.log("Waiting for global objects...")
        setTimeout(checkGlobals, 100)
      }
    }
    checkGlobals()
  })
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Checkout page DOM loaded")

  // Wait for global objects
  await waitForGlobals()

  // Check if cart is empty
  const cartItems = window.cart.getItems()
  console.log("Cart items:", cartItems)

  if (!cartItems || cartItems.length === 0) {
    console.log("Cart is empty, redirecting to cart page")
    alert("Your cart is empty. Please add items before checkout.")
    window.location.href = "cart.html"
    return
  }

  displayOrderSummary()
  setupEventListeners()
})

function setupEventListeners() {
  // Same as billing checkbox
  const sameAsBillingCheckbox = document.getElementById("sameAsBilling")
  const shippingFields = document.getElementById("shippingFields")

  if (sameAsBillingCheckbox && shippingFields) {
    sameAsBillingCheckbox.addEventListener("change", function () {
      if (this.checked) {
        shippingFields.classList.add("hidden")
      } else {
        shippingFields.classList.remove("hidden")
      }
    })
  }

  // Payment method change
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]')
  const creditCardFields = document.getElementById("creditCardFields")

  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      if (this.value === "credit") {
        creditCardFields.style.display = "block"
      } else {
        creditCardFields.style.display = "none"
      }
    })
  })

  // Form submission
  const placeOrderBtn = document.getElementById("placeOrderBtn")

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", (e) => {
      e.preventDefault()
      processOrder()
    })
  }

  // Card number formatting
  const cardNumberInput = document.getElementById("cardNumber")
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
      const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
      e.target.value = formattedValue
    })
  }

  // Expiry date formatting
  const expiryDateInput = document.getElementById("expiryDate")
  if (expiryDateInput) {
    expiryDateInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4)
      }
      e.target.value = value
    })
  }
}

function displayOrderSummary() {
  console.log("Displaying order summary")
  const orderItems = document.getElementById("orderItems")
  const subtotal = document.getElementById("subtotal")
  const shipping = document.getElementById("shipping")
  const tax = document.getElementById("tax")
  const total = document.getElementById("total")

  if (!orderItems) {
    console.log("Order items container not found")
    return
  }

  const cartItems = window.cart.getItems()
  console.log("Cart items for order summary:", cartItems)

  // Display order items
  const itemsHTML = cartItems
    .map(
      (item) => `
        <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">${item.title}</p>
                <p class="text-sm text-gray-500">Qty: ${item.quantity}</p>
            </div>
            <div class="text-sm font-medium text-gray-900">
                ${window.api.formatPrice(item.price * item.quantity)}
            </div>
        </div>
    `,
    )
    .join("")

  orderItems.innerHTML = itemsHTML

  const subtotalAmount = window.cart.getTotal()
  const shippingAmount = subtotalAmount >= 50 ? 0 : 9.99
  const taxAmount = subtotalAmount * 0.08
  const totalAmount = subtotalAmount + shippingAmount + taxAmount

  console.log("Order totals:", { subtotalAmount, shippingAmount, taxAmount, totalAmount })

  // Update totals
  if (subtotal) subtotal.textContent = window.api.formatPrice(subtotalAmount)
  if (shipping) shipping.textContent = shippingAmount === 0 ? "Free" : window.api.formatPrice(shippingAmount)
  if (tax) tax.textContent = window.api.formatPrice(taxAmount)
  if (total) total.textContent = window.api.formatPrice(totalAmount)
}

function validateForm() {
  const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "zipCode"]

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value

  if (paymentMethod === "credit") {
    requiredFields.push("cardNumber", "expiryDate", "cvv", "cardholderName")
  }

  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId)
    if (!field || !field.value.trim()) {
      field?.focus()
      showError(`Please fill in the ${fieldId.replace(/([A-Z])/g, " $1").toLowerCase()} field.`)
      return false
    }
  }

  // Validate email
  const email = document.getElementById("email").value
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    document.getElementById("email").focus()
    showError("Please enter a valid email address.")
    return false
  }

  // Validate card number if credit card is selected
  if (paymentMethod === "credit") {
    const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "")
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      document.getElementById("cardNumber").focus()
      showError("Please enter a valid card number.")
      return false
    }

    const expiryDate = document.getElementById("expiryDate").value
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      document.getElementById("expiryDate").focus()
      showError("Please enter a valid expiry date (MM/YY).")
      return false
    }

    const cvv = document.getElementById("cvv").value
    if (cvv.length < 3 || cvv.length > 4) {
      document.getElementById("cvv").focus()
      showError("Please enter a valid CVV.")
      return false
    }
  }

  return true
}

function processOrder() {
  console.log("Processing order")
  if (!validateForm()) {
    return
  }

  const placeOrderBtn = document.getElementById("placeOrderBtn")
  if (placeOrderBtn) {
    placeOrderBtn.disabled = true
    placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...'
  }

  // Simulate order processing
  setTimeout(() => {
    console.log("Order processed successfully")

    window.cart.clearCart()

    // Show success modal
    const successModal = document.getElementById("successModal")
    if (successModal) {
      successModal.classList.remove("hidden")
    }

    // Reset button
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false
      placeOrderBtn.innerHTML = "Place Order"
    }
  }, 2000)
}

function showError(message) {
  // Create error notification
  const notification = document.createElement("div")
  notification.className =
    "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300"
  notification.textContent = message

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.classList.remove("translate-x-full")
  }, 100)

  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.add("translate-x-full")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 5000)
}
