// API functionality for fetching products
class ProductAPI {
  constructor() {
    this.baseURL = "https://fakestoreapi.com"
    this.cache = new Map()
  }

  async fetchProducts(limit = 20) {
    const cacheKey = `products_${limit}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(`${this.baseURL}/products?limit=${limit}`)
      if (!response.ok) throw new Error("Failed to fetch products")

      const products = await response.json()
      this.cache.set(cacheKey, products)
      return products
    } catch (error) {
      console.error("Error fetching products:", error)
      return []
    }
  }

  async fetchProduct(id) {
    const cacheKey = `product_${id}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(`${this.baseURL}/products/${id}`)
      if (!response.ok) throw new Error("Failed to fetch product")

      const product = await response.json()
      this.cache.set(cacheKey, product)
      return product
    } catch (error) {
      console.error("Error fetching product:", error)
      return null
    }
  }

  async fetchCategories() {
    const cacheKey = "categories"
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(`${this.baseURL}/products/categories`)
      if (!response.ok) throw new Error("Failed to fetch categories")

      const categories = await response.json()
      this.cache.set(cacheKey, categories)
      return categories
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

  async fetchProductsByCategory(category, limit = 20) {
    const cacheKey = `category_${category}_${limit}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(`${this.baseURL}/products/category/${category}?limit=${limit}`)
      if (!response.ok) throw new Error("Failed to fetch products by category")

      const products = await response.json()
      this.cache.set(cacheKey, products)
      return products
    } catch (error) {
      console.error("Error fetching products by category:", error)
      return []
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  createProductCard(product) {
    return `
            <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div class="aspect-square overflow-hidden">
                    <img src="${product.image}" alt="${product.title}" 
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">${product.title}</h3>
                    <div class="flex items-center mb-2">
                        <div class="flex text-yellow-400 text-sm">
                            ${this.createStarRating(product.rating?.rate || 0)}
                        </div>
                        <span class="text-gray-500 text-sm ml-2">(${product.rating?.count || 0})</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-blue-600">${this.formatPrice(product.price)}</span>
                        <button onclick="addToCart(${product.id})" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `
  }

  createStarRating(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    let stars = ""
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>'
    }
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>'
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>'
    }

    return stars
  }
}

// Initialize API
const api = new ProductAPI()

// Export for use in other files
window.api = api
