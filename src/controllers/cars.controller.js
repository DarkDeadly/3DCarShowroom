import * as carServices from "../services/car.service.js"
import * as carRenders from "../renders/car.renders.js"
import { navigateTo } from "../utils/uiBuilder.js"
import * as authService from "../services/auth.service.js"
import * as authStore from "../states/cart.store.js"
import * as utilityFunctions from "../utils/utilityFunctions.js"

authService.initAuthState()

const PAGE_SIZE = 3
const DEBOUNCE_MS = 250

/**
 * Trailing-edge debounce: collapses a burst of calls (keystrokes) into one
 * invocation, fired `ms` after the LAST call. clearTimeout is the whole trick.
 */
const debounce = (fn, ms) => {
    let timer = null
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), ms)
    }
}

class CarCatalogController {
    constructor({ grid, catalog, showMoreBtn, searchInputs = [], chipInputs = [], countLabel = null, allShownNote = null }) {
        this.grid = grid;
        this.catalog = catalog;
        this.showMoreBtn = showMoreBtn;
        this.searchInputs = searchInputs;      // navbar + filter-bar fields, kept in sync
        this.chipInputs = chipInputs;          // radio inputs[name="category"]
        this.countLabel = countLabel;          // .count-indicator .shown
        this.allShownNote = allShownNote;      // .all-shown-note
        this.cursor = null;
        this.hasMore = false;
        this.isLoading = false;
        this.loaded = 0;                       // cards currently in the grid
        this.state = { category: "all", search: "" };
        this._queued = false;                  // race coalescing flag (see _runQuery)
        this._listeners = [];
    }

    // ── Public API ─────────────────────────────

    async mount() {
        this.state = this._readUrlState();   // shared links restore the view
        this._syncControls();
        await this._runQuery({ append: false });
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
        this.searchInputs = [];
        this.chipInputs = [];
        this.countLabel = null;
        this.allShownNote = null;
    }

    // ── Private Methods (prefix with _) ────────

    /**
     * ONE code path for every fetch: initial load, load-more, filter change.
     * Query params always come from this.state, so pagination can never drift
     * out of sync with the active filters.
     *
     * Race coalescing: while a fetch is in flight, further requests are NOT
     * dropped — the newest one waits (this._queued) and re-runs when the
     * current fetch settles. Dropping it would leave stale results on screen.
     */
    async _runQuery({ append = false } = {}) {
        if (this.isLoading) {
            this._queued = true
            return
        }
        this.isLoading = true
        if (this.showMoreBtn) this.showMoreBtn.disabled = true
        if (!append) {
            this.cursor = null
            // Emptying the grid activates the CSS skeleton (:not(:has(> *)))
            this.grid.innerHTML = ""
        }
        try {
            const result = await carServices.getCars({
                ...this.state,
                requestedLimit: PAGE_SIZE,
                cursor: append ? this.cursor : null,
            })
            if (!result.success) {
                console.error("[catalog] query failed:", result.error)
                if (!append) carRenders.renderNoResults(this.grid, { filtered: this._isFiltered() })
                return
            }
            this.cursor = result.meta.nextCursor
            this.hasMore = result.meta.hasMore

            if (append) {
                carRenders.appendCars(result.data, this.grid)
            } else if (result.data.length === 0) {
                carRenders.renderNoResults(this.grid, { filtered: this._isFiltered() })
            } else {
                carRenders.renderCars(result.data, this.grid)
            }
            this._syncCounts(result.data.length, append)
            this._syncLoadMoreUI()
        } finally {
            this.isLoading = false
            if (this.showMoreBtn) this.showMoreBtn.disabled = false
            if (this._queued) {
                this._queued = false
                this._runQuery({ append: false })
            }
        }
    }

    _isFiltered() {
        return this.state.search.trim() !== "" || this.state.category !== "all"
    }

    _bindEvents() {

        if (this.showMoreBtn) {
            this._on(this.showMoreBtn, 'click', () => this._runQuery({ append: true }))
        }
        // Delegated grid clicks: card navigation + filter reset (both survive re-renders)
        this._on(this.grid, 'click', (e) => {
            const resetBtn = e.target.closest('.btn-reset-filters')
            if (resetBtn) {
                this._resetFilters()
                return
            }
            const viewBtn = e.target.closest('.btn-details')
            if (!viewBtn || !viewBtn.dataset.id) return
            navigateTo(`car.html?id=${viewBtn.dataset.id}`)
        })

        // Search fields — debounced, both inputs mirror each other
        const onSearch = utilityFunctions.debounce((value) => {
            if (value === this.state.search) return
            this.state.search = value
            this._writeUrlState()
            this._runQuery({ append: false })
        }, DEBOUNCE_MS)
        this.searchInputs.forEach((input) => {
            this._on(input, 'input', () => {
                const value = input.value
                this.searchInputs.forEach((other) => {
                    if (other !== input) other.value = value
                })
                onSearch(value)
            })
        })

        // Category chips — radios fire `change` only when newly selected
        this.chipInputs.forEach((chip) => {
            this._on(chip, 'change', () => {
                if (!chip.checked) return
                this.state.category = chip.value
                this._writeUrlState()
                this._runQuery({ append: false })
            })
        })
    }

    _resetFilters() {
        this.state = { category: "all", search: "" }
        this._syncControls()
        this._writeUrlState()
        this._runQuery({ append: false })
    }

    // ── URL sync — the address bar as shareable state ──

    _readUrlState() {
        const params = new URLSearchParams(window.location.search)
        return {
            category: params.get("category") ?? "all",
            search: params.get("q") ?? "",
        }
    }

    _writeUrlState() {
        const params = new URLSearchParams()
        if (this.state.category !== "all") params.set("category", this.state.category)
        const term = this.state.search.trim()
        if (term) params.set("q", term)
        const qs = params.toString()
        // replaceState (not pushState): filtering is ephemeral UI state —
        // it should NOT pile entries onto the back button
        history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
    }

    // Reflect this.state into the DOM controls (used on mount from URL, and on reset)
    _syncControls() {
        this.searchInputs.forEach((input) => { input.value = this.state.search })
        let matched = false
        this.chipInputs.forEach((chip) => {
            chip.checked = chip.value === this.state.category
            if (chip.checked) matched = true
        })
        if (!matched) {
            // URL had an unknown category → fall back to "all"
            this.state.category = "all"
            this.chipInputs.forEach((chip) => { chip.checked = chip.value === "all" })
        }
    }

    // ── Load-more + count chrome ───────────────

    _syncCounts(fetchedCount, append) {
        this.loaded = append ? this.loaded + fetchedCount : fetchedCount
        if (!this.countLabel) return
        this.countLabel.textContent = this._isFiltered()
            ? `${this.loaded} match${this.loaded === 1 ? "" : "es"}`
            : `${this.loaded} vehicle${this.loaded === 1 ? "" : "s"} on the floor`
    }

    _syncLoadMoreUI() {
        if (this.showMoreBtn) {
            this.showMoreBtn.style.display = this.hasMore ? "" : "none"
        }
        if (this.allShownNote) {
            this.allShownNote.style.display = (!this.hasMore && this.loaded > 0) ? "block" : "none"
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
    const controller = new CarCatalogController({
        grid,
        catalog,
        showMoreBtn,
        searchInputs: [...document.querySelectorAll('#catalog-search, #nav-search')],
        chipInputs: [...document.querySelectorAll('input[name="category"]')],
        countLabel: document.querySelector('.count-indicator .shown'),
        allShownNote: catalog.querySelector('.all-shown-note'),
    });
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