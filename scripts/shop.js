// Shop page JavaScript
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Shop page DOM loaded")

  // Wait for global objects to be available
  let attempts = 0
  while ((!window.api || !window.cart) && attempts < 50) {
    console.log("Waiting for global objects...", { api: !!window.api, cart: !!window.cart })
    await new Promise((resolve) => setTimeout(resolve, 100))
    attempts++
  }

  if (!window.api || !window.cart) {
    console.error("Global objects not available after waiting")
    return
  }

  console.log("Global objects available, initializing shop page")

  // Initialize page
  await initializeShopPage()

  // Set up event listeners
  setupEventListeners()

  // Update cart count display
  updateCartCount()
})

let allProducts = []
let filteredProducts = []
let currentPage = 1
const productsPerPage = 12

async function initializeShopPage() {
  console.log("Initializing shop page")
  const loadingSpinner = document.getElementById("loadingSpinner")
  if (loadingSpinner) loadingSpinner.classList.remove("hidden")

  try {
    console.log("Fetching products from API")
    allProducts = await window.api.fetchProducts()
    console.log("Fetched products:", allProducts.length)
    filteredProducts = [...allProducts]

    // Load categories for filter
    await loadCategoryFilter()

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const category = urlParams.get("category")
    const search = urlParams.get("search")

    if (category) {
      document.getElementById("categoryFilter").value = category
      await filterByCategory(category)
    } else if (search) {
      document.getElementById("searchInput").value = search
      filterBySearch(search)
    }

    // Display products
    displayProducts()
    console.log("Shop page initialized successfully")
  } catch (error) {
    console.error("Error initializing shop page:", error)
  } finally {
    if (loadingSpinner) loadingSpinner.classList.add("hidden")
  }
}

async function loadCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter")
  if (!categoryFilter) return

  try {
    const categories = await window.api.fetchCategories()
    console.log("Loaded categories:", categories)

    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1)
      categoryFilter.appendChild(option)
    })
  } catch (error) {
    console.error("Error loading category filter:", error)
  }
}

function setupEventListeners() {
  // Apply filters button
  const applyFiltersBtn = document.getElementById("applyFilters")
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters)
  }

  // Search input
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyFilters()
      }
    })
  }

  // Load more button
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreProducts)
  }
}

async function applyFilters() {
  const category = document.getElementById("categoryFilter").value
  const minPrice = Number.parseFloat(document.getElementById("minPrice").value) || 0
  const maxPrice = Number.parseFloat(document.getElementById("maxPrice").value) || Number.POSITIVE_INFINITY
  const sortBy = document.getElementById("sortFilter").value
  const searchQuery = document.getElementById("searchInput").value.toLowerCase()

  // Start with all products
  filteredProducts = [...allProducts]

  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter((product) => product.category === category)
  }

  // Filter by price range
  filteredProducts = filteredProducts.filter((product) => product.price >= minPrice && product.price <= maxPrice)

  // Filter by search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchQuery) ||
        (product.description && product.description.toLowerCase().includes(searchQuery)),
    )
  }

  // Sort products
  if (sortBy) {
    switch (sortBy) {
      case "price-low":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filteredProducts.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
        break
    }
  }

  // Reset pagination
  currentPage = 1

  // Display filtered products
  displayProducts()
}

async function filterByCategory(category) {
  try {
    const products = await window.api.fetchProductsByCategory(category)
    filteredProducts = products
    displayProducts()
  } catch (error) {
    console.error("Error filtering by category:", error)
  }
}

function filterBySearch(query) {
  filteredProducts = allProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(query.toLowerCase())),
  )
  displayProducts()
}

function displayProducts() {
  const productsGrid = document.getElementById("productsGrid")
  const productCount = document.getElementById("productCount")
  const loadMoreBtn = document.getElementById("loadMoreBtn")

  if (!productsGrid) return

  // Calculate products to show
  const startIndex = 0
  const endIndex = currentPage * productsPerPage
  const productsToShow = filteredProducts.slice(startIndex, endIndex)

  // Update product count
  if (productCount) {
    productCount.textContent = `Showing ${productsToShow.length} of ${filteredProducts.length} products`
  }

  const productCards = productsToShow
    .map(
      (product) => `
        <a href="product.html?id=${product.id}" class="block">
            ${window.api.createProductCard(product)}
        </a>
    `,
    )
    .join("")

  productsGrid.innerHTML = productCards

  // Show/hide load more button
  if (loadMoreBtn) {
    if (endIndex < filteredProducts.length) {
      loadMoreBtn.classList.remove("hidden")
    } else {
      loadMoreBtn.classList.add("hidden")
    }
  }
}

function loadMoreProducts() {
  currentPage++
  displayProducts()
}

window.addToCart = async (productId) => {
  try {
    const product = await window.api.fetchProduct(productId)
    if (product) {
      window.cart.addItem(product, 1)
      updateCartCount()

      // Show feedback
      const button = event.target
      const originalText = button.textContent
      button.textContent = "Added!"
      button.style.backgroundColor = "#10b981"

      setTimeout(() => {
        button.textContent = originalText
        button.style.backgroundColor = ""
      }, 1000)
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
