import * as authStore from "../states/cart.store.js"
import * as cartRender from "../renders/cart.renders.js"
import * as cartService from "../services/cart.service.js"
import { navigateTo } from "../utils/uiBuilder.js"
import {initAuthState} from "../services/auth.service.js"





export class CartController {
    constructor({ container, emptyStateContainer, orderSummaryContainer }) {
        this.container = container;
        this.emptyStateContainer = emptyStateContainer;
        this.orderSummaryContainer = orderSummaryContainer;
        this.items = [];
        this.isLoading = false;
        this._listeners = [];
    }

    async mount() {
        await this._loadCart();
        await this._loadOrderHistory();
        this._bindEvents();
    }

    destroy() {
        this._listeners.forEach(({ element, type, fn }) => {
            element.removeEventListener(type, fn);
        });
        this._listeners = [];
        this.items = [];
        this.container = null;
        this.emptyStateContainer = null;
    }

    async _loadCart() {
        const user = authStore.store.get('user');
        if (!user) {
            cartRender.cartEmptyState(this.emptyStateContainer);
            navigateTo("authentication.html");
            return;
        }
        try {
            this.isLoading = true;
            const result = await cartService.getCartCars(user.uid);
            if (!result.success) {
                cartRender.cartEmptyState(this.emptyStateContainer);
                return;
            }
            
            this.items = result.data;
            authStore.store.set({ cartCount: this.items.length });

            this._renderItems();
        } finally {
            this.isLoading = false;
        }
    }

    async _loadOrderHistory() {
        const user = authStore.store.get('user');
        if (!user) {
            cartRender.cartEmptyState(this.emptyStateContainer);
            navigateTo("authentication.html");
            return;
        }
        try {
            this.isLoading = true;
            const result = await cartService.getCartCars(user.uid);
            if (!result.success) {
                cartRender.cartEmptyState(this.emptyStateContainer);
                return;
            }
            const totalPrice = result.data.reduce((acc, car) => acc + car.price, 0);
            console.log("Total Price:", totalPrice);
            cartRender.createOrderSummary(this.orderSummaryContainer, totalPrice);
        } finally {
           this.isLoading = false; 
        }
    }

    async _handleRemove(carId) {
        const user = authStore.store.get('user');
        if (!user) return;

        this.items = this.items.filter(item => item.id !== carId);
        this._renderItems();
        authStore.store.set({ cartCount: this.items.length });

        if (this.items.length === 0) {
            cartRender.cartEmptyState(this.emptyStateContainer);
        }

        const result = await cartService.removeToCart(carId,user.uid);
        if (!result.success) {
            await this._loadCart();
        }
    }

    _renderItems() {
        this.container.innerHTML = "";
        if (this.items.length === 0) {
            cartRender.cartEmptyState(this.emptyStateContainer);
            return;
        }
        this.items.forEach(car => {
            cartRender.createCartItem(car, this.container);
        });
    }

    _bindEvents() {
        // One delegated listener on the container. That's it.
        this._on(this.container, "click", (e) => {
            const btn = e.target.closest(".remove-btn");
            if (!btn?.dataset.carId) return;
            this._handleRemove(btn.dataset.carId);
        });
    }

    _on(element, type, fn) {
        element.addEventListener(type, fn);
        this._listeners.push({ element, type, fn });
    }
}

const cartInit = async() => {
    await initAuthState()
    const container = document.querySelector(".cart-items")
    const emptyStateContainer = document.querySelector(".cart-layout")
    const orderSummaryContainer = document.querySelector(".summary-card")
    if (!container || !emptyStateContainer || !orderSummaryContainer) return
    const cartController = new CartController({ container , emptyStateContainer, orderSummaryContainer})
    cartController.mount()
}



cartInit()