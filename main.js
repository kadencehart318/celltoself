
// USE LOCAL STORAGE

// Gets value from localStorage or returns default value
function getStoredValue(key, defaultValue) {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
}

// Creates a  localStorage object
function createLocalStorageState(key, defaultValue) {
    let value = getStoredValue(key, defaultValue);

    function get() {
        return value;
    }

    function set(newValue) {
        value = newValue;
        localStorage.setItem(key, JSON.stringify(value));
    }

    return { get, set };
}

// GLOBAL VARIABLES

const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');

const largeImg = document.querySelector('.img-large');
const thumbImgBox = document.querySelector('.thumbnail-box');

const plus = document.querySelector('.plus');
const minus = document.querySelector('.minus');
const cart = document.getElementById('cart');
const cartItems = document.querySelector('.cart-qty');
const quantity = document.querySelector('.qty');

const cartButton = document.getElementById('add-cart');
const previous = document.getElementById('previous');
const next = document.getElementById('next');

const trash = document.getElementById('delete');

const aside = document.getElementById('aside');
const popup = document.querySelector('.popup');

const cartHasItems = document.getElementById('img-head');
const cartNoItems = document.getElementById('empty');
const priceUp = document.getElementById('cart-amt');

const modal = document.getElementById('myModal');

const cartState = createLocalStorageState('cartQty', 0);

let num = 1;
let slideIndex = 1;

// EVENT LISTENERS

//mobile menu toggle
if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// Increases quantity when plus icon clicked
if (plus) {
    plus.addEventListener('click', () => {
        addQty();
    });
}

// Decreases quantity when minus icon clicked
if (minus) {
    minus.addEventListener('click', () => {
        subQty();
    });
}

// Adds current quantity to cart icon and saves
if (cartButton) {
    cartButton.addEventListener('click', () => {
        cartQty();
    });
}

// Opens or closes cart popup when cart icon clicked
if (cart) {
    cart.addEventListener('click', (e) => {
        e.stopPropagation();
        cartToggle();
    });
}

// Prevents clicks inside the popup from closing it
if (aside) {
    aside.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Closes cart popup when clicking anywhere outside it
document.addEventListener('click', (e) => {
    if (popup && aside && !popup.contains(e.target)) {
        aside.classList.add('empty');
    }
});

// Changes large image when a thumbnail clicked
if (thumbImgBox && largeImg) {
    thumbImgBox.addEventListener('click', (e) => {
        if (e.target.matches('.img-thumb')) {
            const newImage = e.target.dataset.largeimage;
            largeImg.setAttribute('src', newImage);

            const match = newImage.match(/book-(\d)\.png$/);
            if (match) {
                num = Number(match[1]);
                slideIndex = num;
            }

            updateMainThumbnailState();
        }
    });
}

// Shows previous image in main gallery
if (previous && largeImg) {
    previous.addEventListener('click', () => {
        if (num > 1) {
            num--;
            largeImg.setAttribute('src', `./assets/images/book-${num}.png`);
            slideIndex = num;
            updateMainThumbnailState();
        }
    });
}

// Shows next image in main gallery
if (next && largeImg) {
    next.addEventListener('click', () => {
        if (num < 4) {
            num++;
            largeImg.setAttribute('src', `./assets/images/book-${num}.png`);
            slideIndex = num;
            updateMainThumbnailState();
        }
    });
}

// Empties cart when trash icon is clicked
if (trash) {
    trash.addEventListener('click', () => {
        emptyCart();
    });
}

// Opens lightbox when large image is clicked
if (largeImg) {
    largeImg.addEventListener('click', () => {
        openModal();
        showSlides(slideIndex);
    });
}

// Closes modal
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// CART FUNCTIONS

// Restores cart from localStorage when page loads
function initCart() {
    if (!cartItems || !quantity) return;

    const storedQty = cartState.get();
    quantity.value = storedQty;

    if (storedQty > 0) {
        cartItems.style.display = 'flex';
        cartItems.innerHTML = storedQty;
    } else {
        cartItems.style.display = 'none';
        cartItems.innerHTML = '';
    }

    cartPopup();
}

// Increases the quantity input by 1
function addQty() {
    if (!quantity) return;
    quantity.value = Number(quantity.value) + 1;
}

// Decreases the quantity input by 1 and prevents it from going below 0
function subQty() {
    if (!quantity) return;
    quantity.value = Number(quantity.value) > 0 ? Number(quantity.value) - 1 : 0;
}

// Updates the cart badge and saves the quantity to localStorage
function cartQty() {
    if (!quantity || !cartItems) return;

    const qty = Number(quantity.value);
    cartState.set(qty);

    if (qty > 0) {
        cartItems.style.display = 'flex';
        cartItems.innerHTML = qty;
    } else {
        cartItems.style.display = 'none';
        cartItems.innerHTML = '';
    }

    cartPopup();
}

// Controls whether the cart shows filled or empty message
function cartPopup() {
    if (!cartHasItems || !cartNoItems || !priceUp) return;

    const qty = Number(cartState.get());

    if (qty > 0) {
        cartHasItems.classList.remove('empty');
        cartNoItems.classList.add('empty');
        priceUp.innerHTML = `$20.00 x ${qty}: $${qty * 20}.00`;
    } else {
        cartNoItems.classList.remove('empty');
        cartHasItems.classList.add('empty');
        priceUp.innerHTML = '';
    }
}

// Toggles the cart popup open and closed
function cartToggle() {
    if (!aside) return;

    if (aside.classList.contains('empty')) {
        aside.classList.remove('empty');
    } else {
        aside.classList.add('empty');
    }

    cartPopup();
}

// Empties the cart completely, resets quantity, and clears localStorage state
function emptyCart() {
    cartState.set(0);

    if (cartNoItems) {
        cartNoItems.classList.remove('empty');
    }

    if (cartHasItems) {
        cartHasItems.classList.add('empty');
    }

    if (quantity) {
        quantity.value = 0;
    }

    if (cartItems) {
        cartItems.style.display = 'none';
        cartItems.innerHTML = '';
    }

    if (priceUp) {
        priceUp.innerHTML = '';
    }
}

// MAIN GALLERY FUNCTIONS

// Highlight active thumbnail in gallery
function updateMainThumbnailState() {
    const thumbs = document.querySelectorAll('.img-thumb');

    thumbs.forEach((thumb) => {
        thumb.classList.remove('img-active');

        const match = thumb.dataset.largeimage?.match(/book-(\d)\.png$/);
        if (match && Number(match[1]) === num) {
            thumb.classList.add('img-active');
        }
    });
}

// LIGHTBOX FUNCTIONS

// Opens lightbox modal
function openModal() {
    if (!modal) return;
    modal.style.display = 'block';
}

// Closes lightbox modal
function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
}

// Moves through lightbox slides
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Opens slide based on thumbnail clicked
function currentSlide(n) {
    showSlides(slideIndex = n);
}

// Displays active slide and highlights thumbnail
function showSlides(n) {
    const slides = document.getElementsByClassName('mySlides');
    const dots = document.getElementsByClassName('demo');

    if (!slides.length) return;

    if (n > slides.length) {
        slideIndex = 1;
    }

    if (n < 1) {
        slideIndex = slides.length;
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(' active', '');
    }

    slides[slideIndex - 1].style.display = 'block';

    if (dots.length) {
        dots[slideIndex - 1].className += ' active';
    }

    num = slideIndex;

    if (largeImg) {
        largeImg.setAttribute('src', `./assets/images/book-${slideIndex}.png`);
    }

    updateMainThumbnailState();
}

// =========================
// INITIALIZE PAGE
// =========================

initCart();
updateMainThumbnailState();

if (document.getElementsByClassName('mySlides').length) {
    showSlides(slideIndex);
}


console.log("test")
