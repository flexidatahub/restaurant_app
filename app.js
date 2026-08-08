// --- 1. NAVBAR TOGGLE LOGIC ---
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Close menu when any link inside it is clicked (mobile view)
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });
}

// --- 2. GLOBAL CART LOAD & ADD TO CART ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  // A. Add to Cart Handler (index.html / menu pages)
  const buttons = document.querySelectorAll('.add-to-cart-btn');

  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      const name = targetBtn.getAttribute('data-name');
      const price = parseFloat(targetBtn.getAttribute('data-price'));

      let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = currentCart.find(item => item.name === name);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        currentCart.push({ name: name, price: price, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(currentCart));
      window.location.href = 'checkout.html';
    });
  });

  // B. Render Checkout Page (If on checkout.html)
  renderCheckoutSummary();

  // C. Checkout Form / Button Listeners
  const checkoutForm = document.querySelector('.checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleWhatsAppCheckout);
  }
});

// --- 3. RENDER CHECKOUT SUMMARY WITH 'X' AND ADD MORE BUTTONS ---
function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('cart-items');
  const totalContainer = document.getElementById('cart-total');

  if (!summaryContainer || !totalContainer) return;

  if (cart.length === 0) {
    summaryContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    totalContainer.innerText = 'GHS 0.00';
    return;
  }

  summaryContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemRow = document.createElement('div');
    itemRow.className = 'summary-item';
    itemRow.innerHTML = `
      <div>
        <span class="qty-badge">${item.quantity}x</span>
        <span>${item.name}</span>
      </div>
      <div>
        <span>GHS ${itemTotal.toFixed(2)}</span>
        <button class="remove-btn" data-index="${index}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    summaryContainer.appendChild(itemRow);
  });

  // + ADD MORE ITEMS BUTTON
  const addMoreRow = document.createElement('div');
  addMoreRow.style.marginTop = '15px';
  addMoreRow.style.textAlign = 'center';
  addMoreRow.innerHTML = `
    <a href="index.html" style="display: inline-block; padding: 8px 16px; background-color: rgb(228, 198, 101); color: #000; text-decoration: none; border-radius: 4px; font-weight: bold; font-family: 'oswald', sans-serif;">
      + Add More Items
    </a>
  `;
  summaryContainer.appendChild(addMoreRow);

  totalContainer.innerText = `GHS ${total.toFixed(2)}`;

  // Attach event listeners to the new 'X' remove buttons
  const removeButtons = document.querySelectorAll('.remove-btn');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.remove-btn');
      const itemIndex = targetBtn.getAttribute('data-index');
      
      // Remove item from cart and update local storage
      cart.splice(itemIndex, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Re-render the cart
      renderCheckoutSummary();
    });
  });
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// --- 4. WHATSAPP CHECKOUT REDIRECT ---
function handleWhatsAppCheckout(e) {
  if (e) e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const nameInput = document.getElementById('c-name');
  const emailInput = document.getElementById('c-email');
  const phoneInput = document.getElementById('c-phone');
  const addressInput = document.getElementById('c-address');

  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerEmail = emailInput ? emailInput.value.trim() : '';
  const customerPhone = phoneInput ? phoneInput.value.trim() : '';
  const customerAddress = addressInput ? addressInput.value.trim() : '';

  const totalAmount = calculateTotal();
  const itemsSummary = cart.map(item => `${item.quantity}x ${item.name} (GHS ${(item.price * item.quantity).toFixed(2)})`).join('\n');

  // Format the WhatsApp message
  const message = `Hello, I want to place an order!\n\n` +
                  `*Customer Details:*\n` +
                  `- Name: ${customerName}\n` +
                  `- Phone: ${customerPhone}\n` +
                  `- Delivery Address: ${customerAddress}\n\n` +
                  `*Order Summary:*\n${itemsSummary}\n\n` +
                  `*Total Amount:* GHS ${totalAmount.toFixed(2)}`;

  // Replace with your business WhatsApp phone number (in international format, e.g., 233539183773)
  const whatsappNumber = "233539183773"; 
  const encodedMessage = encodeURIComponent(message);
  
  // Clear cart and redirect to WhatsApp
  localStorage.removeItem('cart');
  window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}