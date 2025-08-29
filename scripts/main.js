// Main JavaScript for index.html
document.addEventListener("DOMContentLoaded", async () => {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const mobileMenu = document.getElementById("mobileMenu")

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  // Search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = e.target.value.trim()
        if (query) {
          window.location.href = `shop.html?search=${encodeURIComponent(query)}`
        }
      }
    })
  }

  // Load categories
  await loadCategories()

  // Load featured products
  await loadFeaturedProducts()
})

async function loadCategories() {
  const categoriesGrid = document.getElementById("categoriesGrid")
  if (!categoriesGrid) return

  try {
    const categories = await window.api.fetchCategories()

    const categoryCards = categories
      .map(
        (category) => `
            <a href="shop.html?category=${encodeURIComponent(category)}" 
               class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i class="fas fa-tag text-white text-2xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900 capitalize">${category}</h3>
            </a>
        `,
      )
      .join("")

    categoriesGrid.innerHTML = categoryCards
  } catch (error) {
    console.error("Error loading categories:", error)
    categoriesGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full">Failed to load categories</p>'
  }
}

async function loadFeaturedProducts() {
  const featuredProducts = document.getElementById("featuredProducts")
  if (!featuredProducts) return

  const loadingSpinner = document.getElementById("loadingSpinner")
  if (loadingSpinner) loadingSpinner.classList.remove("hidden")

  try {
    const products = await window.api.fetchProducts(8)

    const productCards = products
      .map(
        (product) => `
            <a href="product.html?id=${product.id}" class="block">
                ${window.api.createProductCard(product)}
            </a>
        `,
      )
      .join("")

    featuredProducts.innerHTML = productCards
  } catch (error) {
    console.error("Error loading featured products:", error)
    featuredProducts.innerHTML = '<p class="text-center text-gray-500 col-span-full">Failed to load products</p>'
  } finally {
    if (loadingSpinner) loadingSpinner.classList.add("hidden")
  }
}

// Global function to add products to cart
window.addToCart = async (productId) => {
  try {
    const product = await window.api.fetchProduct(productId)
    if (product) {
      window.cart.addItem(product, 1)
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
  }
}
