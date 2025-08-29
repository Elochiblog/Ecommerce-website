// Cart functionality
class Cart {
  constructor() {
    this.items = this.loadCart()
    this.updateCartCount()
  }

  loadCart() {
    const cart = localStorage.getItem("sleekshop_cart")
    return cart ? JSON.parse(cart) : []
  }

  saveCart() {
    localStorage.setItem("sleekshop_cart", JSON.stringify(this.items))
    this.updateCartCount()
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity,
      })
    }

    this.saveCart()
    this.showNotification(`${product.title} added to cart!`)
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId)
    this.saveCart()
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId)
      } else {
        item.quantity = quantity
        this.saveCart()
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  }

  getItems() {
    return this.items
  }

  updateCartCount() {
    const cartCountElements = document.querySelectorAll("#cartCount")
    const count = this.getItemCount()
    cartCountElements.forEach((element) => {
      element.textContent = count
      element.style.display = count > 0 ? "flex" : "none"
    })
  }

  clearCart() {
    this.items = []
    this.saveCart()
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement("div")
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300"
    notification.textContent = message

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.classList.remove("translate-x-full")
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("translate-x-full")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }
}

// Initialize cart
const cart = new Cart()

// Export for use in other files
window.cart = cart
