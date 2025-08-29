// Contact page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()
      submitContactForm(contactForm)
    })
  }
})

function submitContactForm(contactForm) {
  // Get form data
  const firstName = document.getElementById("firstName").value.trim()
  const lastName = document.getElementById("lastName").value.trim()
  const email = document.getElementById("email").value.trim()
  const phone = document.getElementById("phone").value.trim()
  const subject = document.getElementById("subject").value
  const message = document.getElementById("message").value.trim()

  // Validate required fields
  if (!firstName || !lastName || !email || !subject || !message) {
    showError("Please fill in all required fields.")
    return
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address.")
    return
  }

  // Simulate form submission
  const submitBtn = contactForm.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML

  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...'

  setTimeout(() => {
    // Reset form
    contactForm.reset()

    // Reset button
    submitBtn.disabled = false
    submitBtn.innerHTML = originalText

    // Show success modal
    const successModal = document.getElementById("successModal")
    if (successModal) {
      successModal.classList.remove("hidden")
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

function closeSuccessModal() {
  const successModal = document.getElementById("successModal")
  if (successModal) {
    successModal.classList.add("hidden")
  }
}

// Make function globally available
window.closeSuccessModal = closeSuccessModal
