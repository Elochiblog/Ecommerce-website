// Product page JavaScript
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Product page loading...")
  console.log("window.api available:", !!window.api)
  console.log("window.cart available:", !!window.cart)

  // Wait for global objects to be available
  let attempts = 0
  while ((!window.api || !window.cart) && attempts < 50) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    attempts++
  }

  if (!window.api || !window.cart) {
    console.error("Global api or cart objects not available")
    document.getElementById("loadingSpinner")?.classList.add("hidden")
    return
  }

  const urlParams = new URLSearchParams(window.location.search)
  const productId = urlParams.get("id")

  console.log("Product ID from URL:", productId)

  if (productId) {
    await loadProduct(productId)
    await loadRelatedProducts()
  } else {
    console.log("No product ID, redirecting to shop")
    window.location.href = "shop.html"
  }
})

let currentProduct = null

async function loadProduct(productId) {
  const loadingSpinner = document.getElementById("loadingSpinner")
  const productDetails = document.getElementById("productDetails")
  const breadcrumbProduct = document.getElementById("breadcrumbProduct")

  console.log("Loading product:", productId)

  if (loadingSpinner) loadingSpinner.classList.remove("hidden")

  try {
    currentProduct = await window.api.fetchProduct(productId)
    console.log("Product loaded:", currentProduct)

    if (!currentProduct) {
      throw new Error("Product not found")
    }

    // Update page title and breadcrumb
    document.title = `${currentProduct.title} - SleekShop`
    if (breadcrumbProduct) {
      breadcrumbProduct.textContent = currentProduct.title
    }

    // Create product HTML
    const productHTML = `
            <!-- Product Images -->
            <div class="space-y-4">
                <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img id="mainImage" src="${currentProduct.image}" alt="${currentProduct.title}" 
                         class="w-full h-full object-cover">
                </div>
                <div class="grid grid-cols-4 gap-2">
                    <button onclick="changeMainImage('${currentProduct.image}')" 
                            class="aspect-square overflow-hidden rounded-lg border-2 border-blue-500">
                        <img src="${currentProduct.image}" alt="${currentProduct.title}" 
                             class="w-full h-full object-cover">
                    </button>
                    <button onclick="changeMainImage('${currentProduct.image}')" 
                            class="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500">
                        <img src="${currentProduct.image}" alt="${currentProduct.title}" 
                             class="w-full h-full object-cover">
                    </button>
                    <button onclick="changeMainImage('${currentProduct.image}')" 
                            class="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500">
                        <img src="${currentProduct.image}" alt="${currentProduct.title}" 
                             class="w-full h-full object-cover">
                    </button>
                    <button onclick="changeMainImage('${currentProduct.image}')" 
                            class="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500">
                        <img src="${currentProduct.image}" alt="${currentProduct.title}" 
                             class="w-full h-full object-cover">
                    </button>
                </div>
            </div>

            <!-- Product Info -->
            <div class="space-y-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">${currentProduct.title}</h1>
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="flex items-center">
                            <div class="flex text-yellow-400 mr-2">
                                ${window.api.createStarRating(currentProduct.rating?.rate || 0)}
                            </div>
                            <span class="text-gray-600">(${currentProduct.rating?.count || 0} reviews)</span>
                        </div>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-600 capitalize">${currentProduct.category}</span>
                    </div>
                    <div class="text-3xl font-bold text-blue-600 mb-6">${window.api.formatPrice(currentProduct.price)}</div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold mb-3">Description</h3>
                    <p class="text-gray-600 leading-relaxed">${currentProduct.description}</p>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Quantity:</label>
                        <div class="flex items-center border border-gray-300 rounded-lg">
                            <button onclick="decreaseQuantity()" class="px-3 py-2 hover:bg-gray-100">-</button>
                            <input type="number" id="quantity" value="1" min="1" max="10" 
                                   class="w-16 text-center border-0 focus:ring-0">
                            <button onclick="increaseQuantity()" class="px-3 py-2 hover:bg-gray-100">+</button>
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button onclick="addToCart()" 
                                class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                            <i class="fas fa-shopping-cart mr-2"></i>
                            Add to Cart
                        </button>
                        <button onclick="buyNow()" 
                                class="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-300">
                            Buy Now
                        </button>
                    </div>
                </div>

                <div class="border-t pt-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div class="flex items-center">
                            <i class="fas fa-truck text-blue-600 mr-2"></i>
                            <span>Free shipping on orders over $50</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-undo text-blue-600 mr-2"></i>
                            <span>30-day return policy</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-shield-alt text-blue-600 mr-2"></i>
                            <span>2-year warranty</span>
                        </div>
                    </div>
                </div>
            </div>
        `

    productDetails.innerHTML = productHTML
    console.log("Product HTML rendered")
  } catch (error) {
    console.error("Error loading product:", error)
    productDetails.innerHTML = `
            <div class="col-span-2 text-center py-16">
                <i class="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
                <h2 class="text-2xl font-semibold text-gray-600 mb-4">Product Not Found</h2>
                <p class="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
                <a href="shop.html" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">
                    Continue Shopping
                </a>
            </div>
        `
  } finally {
    if (loadingSpinner) loadingSpinner.classList.add("hidden")
    console.log("Loading spinner hidden")
  }
}

async function loadRelatedProducts() {
  const relatedProducts = document.getElementById("relatedProducts")
  if (!relatedProducts || !currentProduct) return

  try {
    const products = await window.api.fetchProductsByCategory(currentProduct.category, 8)
    const filteredProducts = products.filter((p) => p.id !== currentProduct.id).slice(0, 4)

    const productCards = filteredProducts
      .map(
        (product) => `
            <a href="product.html?id=${product.id}" class="block">
                ${window.api.createProductCard(product)}
            </a>
        `,
      )
      .join("")

    relatedProducts.innerHTML = productCards
    console.log("Related products loaded")
  } catch (error) {
    console.error("Error loading related products:", error)
  }
}

// Product page functions
window.changeMainImage = (imageSrc) => {
  const mainImage = document.getElementById("mainImage")
  if (mainImage) {
    mainImage.src = imageSrc
  }
}

window.increaseQuantity = () => {
  const quantityInput = document.getElementById("quantity")
  if (quantityInput) {
    const currentValue = Number.parseInt(quantityInput.value)
    if (currentValue < 10) {
      quantityInput.value = currentValue + 1
    }
  }
}

window.decreaseQuantity = () => {
  const quantityInput = document.getElementById("quantity")
  if (quantityInput) {
    const currentValue = Number.parseInt(quantityInput.value)
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1
    }
  }
}

window.addToCart = () => {
  if (!currentProduct) return

  const quantityInput = document.getElementById("quantity")
  const quantity = quantityInput ? Number.parseInt(quantityInput.value) : 1

  window.cart.addItem(currentProduct, quantity)
  console.log("Added to cart:", currentProduct.title, "quantity:", quantity)

  // Update cart count display
  updateCartCount()
}

window.buyNow = () => {
  if (!currentProduct) return

  const quantityInput = document.getElementById("quantity")
  const quantity = quantityInput ? Number.parseInt(quantityInput.value) : 1

  window.cart.addItem(currentProduct, quantity)
  window.location.href = "checkout.html"
}

// Global function for related products
window.addToCartFromRelated = async (productId) => {
  try {
    const product = await window.api.fetchProduct(productId)
    if (product) {
      window.cart.addItem(product, 1)
      updateCartCount()
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
  }
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount")
  if (cartCount && window.cart) {
    const items = window.cart.getItems()
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
  }
}
