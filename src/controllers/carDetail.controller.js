
import * as carDetailRender from "../renders/carDetail.renders.js"
import * as carServices from "../services/car.service.js"
import * as cartService from "../services/cart.service.js"
import * as authStore from "../states/cart.store.js"
import * as authService from "../services/auth.service.js"

await authService.initAuthState()


const carDetailInit = async () => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) return
    const identitySection = document.querySelector('.identity-section')
    const ctaSection = document.querySelector('.cta-section')
    const imageWrapper = document.querySelector('.gallery-section')
    if (!identitySection || !ctaSection || !imageWrapper) return;
    const result = await carServices.getCarById(id)
    if (!result.success) return
    identitySection.innerHTML = "";
    ctaSection.innerHTML = "";
    imageWrapper.innerHTML = "";
    imageWrapper.append(
        carDetailRender.buildImageShowcase(result.data)
    )
    identitySection.append(
        carDetailRender.buildIdentitySection(result.data)
    )
    ctaSection.append(
        carDetailRender.buildCTASection(result.data)
    )
}

const addToCart = async () => {
    const cartBtn = document.querySelector('[data-action="add-to-cart"]');
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (!id || !cartBtn) return;
    
    // Check initial state (is this car already in cart?)
    const user = authStore.store.get('user');
    if (user) {
        const inCart = await cartService.isInCart(user.uid, id);
        if (inCart.success && inCart.data) {
            cartBtn.disabled = true;
            cartBtn.textContent = "Added to Cart";
            return; // Don't attach listener if already in cart
        }
    }
    
    cartBtn.addEventListener('click', async () => {
        const user = authStore.store.get('user');  // Fresh read
        if (!user) {
            navigateTo('authentication.html');
            return;
        }
        
        const result = await cartService.addToCart(id, user.uid);
        if (!result.success) {
            console.error("Failed to add to cart:", result.error);
            return;
        }
        
        cartBtn.textContent = "Added to Cart";
        cartBtn.disabled = true;
    });
};


await carDetailInit()
await addToCart()

