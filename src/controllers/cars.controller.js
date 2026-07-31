import * as carServices from "../services/car.service.js"
import * as carRenders from "../renders/car.renders.js"
import { navigateTo } from "../utils/uiBuilder.js"
import * as authService from "../services/auth.service.js"
import * as authStore from "../states/cart.store.js"


authService.initAuthState()


class CarCatalogController {
    constructor({ grid, catalog, showMoreBtn }) {
        this.grid = grid;
        this.catalog = catalog;
        this.showMoreBtn = showMoreBtn;
        this.cursor = null;
        this.hasMore = false;
        this.isLoading = false;
        this._listeners = [];
    }

    // ── Public API ─────────────────────────────

    async mount() {
        await this._loadInitial();
        this._bindEvents();
    }

    destroy() {
        this._listeners.forEach(({ element, type, fn }) => element.removeEventListener(type, fn))


        this._listeners = [];
        this.cursor = null;
        this.hasMore = false;
        this.isLoading = false;
        this.grid = null;
        this.catalog = null;
        this.showMoreBtn = null;
    }

    // ── Private Methods (prefix with _) ────────

    async _loadInitial() {

        const result = await carServices.getCars({ requestedLimit: 3 })
        if (!result.success) {
            carRenders.carEmptyState(this.catalog);
            return;
        }
        this.cursor = result.meta.nextCursor
        this.hasMore = result.meta.hasMore

        if (result.data.length === 0) {
            carRenders.carEmptyState(this.catalog)
            return
        }
        carRenders.renderCars(result.data, this.grid)
    }

    _bindEvents() {

        if (this.showMoreBtn) {
            this._on(this.showMoreBtn, 'click', () => this._handleLoadMore())
        }
        // 3. Attach delegated click to this.grid for .btn-details → navigate
        this._on(this.grid, 'click', (e) => {
            const viewBtn = e.target.closest('.btn-details')
            if (!viewBtn || !viewBtn.dataset.id) return
            navigateTo(`car.html?id=${viewBtn.dataset.id}`)
        })
    }

    async _handleLoadMore() {
        if (!this.hasMore || this.isLoading) return

        this.isLoading = true
        this.showMoreBtn.disabled = true;
        try {
            const result = await carServices.getCars({
                requestedLimit: 3,
                cursor: this.cursor,
            })
            if (!result.success) return

            this.cursor = result.meta.nextCursor
            this.hasMore = result.meta.hasMore
            carRenders.appendCars(result.data, this.grid)
            if (!this.hasMore) {
                this.showMoreBtn.style.display = "none";
            }
        } finally {
            this.isLoading = false
            this.showMoreBtn.disabled = false;
        }
    }


    _on(element, type, fn) {
        element.addEventListener(type, fn)
        this._listeners.push({ element, type, fn })
    }
}


const carsInit = async () => {
    const grid = document.querySelector('.card-grid');
    const catalog = document.querySelector('.catalog');
    const showMoreBtn = document.querySelector('.btn-load-more');
    if (!grid || !catalog) return
    const controller = new CarCatalogController({ grid, catalog, showMoreBtn });
    await controller.mount()
}

const logoutInit = () => {
    const logoutBtn = document.querySelector(".btn-logout")
    if (!logoutBtn) return
    logoutBtn.addEventListener("click", async () => {
        const result = await authService.logoutService()
        if (!result.success) {
            navigateTo("authentication.html")
            return
        }
        authStore.store.set({
            user: null,
            isAuthenticated: false,
            role: null
        })
        navigateTo("authentication.html")
    })
}

const mainInit = () => {
    carsInit()
    logoutInit()
}


mainInit()
