import * as authServices from "../services/auth.service.js"
import * as authStore from "../states/cart.store.js"
import * as cartService from "../services/cart.service.js"
import { navigateTo } from "../utils/uiBuilder.js"

// This page is only ever reached by an authenticated visitor (unauthenticated
// users are redirected to authentication.html elsewhere), so this controller
// does NOT need a guest/logged-out UI state — it just needs to paint the real
// user's name/avatar/role once auth state is known, and keep it in sync if
// the store updates later (e.g. role changes without a full reload).
const authReady = authServices.initAuthState()

/**
 * Derive 1-2 letter initials from a display name.
 * "Marcus Bennett" -> "MB", "marcus" -> "MA", falls back to "??".
 */
const initialsFor = (name) => {
    if (!name) return "??"
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "??"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Prefer the Firebase Auth displayName (set at registration, if wired up).
 * Falls back to the email's local part so the navbar never shows blank/undefined.
 */
const displayNameFor = (user) => {
    if (!user) return ""
    if (user.displayName) return user.displayName
    if (user.email) return user.email.split("@")[0]
    return "Member"
}

const roleLabelFor = (role) => {
    if (!role) return "Member"
    return role.charAt(0).toUpperCase() + role.slice(1)
}

/**
 * "Collector since <year>" — pulled from Firebase Auth's own account
 * creation metadata rather than hardcoded, so it's always accurate per user.
 */
const memberSinceYear = (user) => {
    const created = user?.metadata?.creationTime
    if (!created) return null
    const year = new Date(created).getFullYear()
    return Number.isNaN(year) ? null : year
}

class NavbarController {
    constructor() {
        this.avatarEls = document.querySelectorAll('.avatar')
        this.nameEls = document.querySelectorAll('.account-name')
        // admin.html's name element has different markup: a loose text node
        // holding the name, followed by a nested <small> sublabel ("Fleet
        // Administrator") that must be preserved, not overwritten.
        this.adminNameEls = document.querySelectorAll('.admin-name')
        this.menuHeadName = document.querySelector('#account-menu .menu-head strong')
        this.menuHeadSub = document.querySelector('#account-menu .menu-head span')
        // Hidden by default in the HTML (style="display:none") so a
        // non-admin never sees a flash of this link before role is known.
        this.adminLinks = document.querySelectorAll('.admin-link')
        // Absent on pages without a cart icon (e.g. admin.html) — the
        // forEach calls below are then simply no-ops, which is fine.
        this.cartBadgeEls = document.querySelectorAll('.cart-badge')
        this._unsubscribe = null
    }

    async mount() {
        // Wait for auth to resolve before first paint so we don't briefly
        // flash placeholder/blank values ahead of the real user data.
        await authReady

        // Gate admin.html specifically: this page has no server-side check
        // of its own visible here, so navbar.controller.js (loaded on every
        // page, auth already resolved) is the one consistent place to enforce
        // it client-side. Runs before any rendering — a non-admin should
        // never see the admin page's content paint, even briefly.
        if (this._blockIfUnauthorizedAdminPage()) return

        const state = authStore.store.get()
        this._render(state)
        this._unsubscribe = authStore.store.subscribe(({ state }) => this._render(state))

        // Real cart data lives in Firestore, so re-fetch fresh on every page
        // load rather than trusting any stale in-memory count. Routed
        // through the store (not painted directly) so _render stays the
        // single place that touches the DOM, and any other subscriber gets
        // the count too.
        await this._refreshCartCount(state.user)
    }

    async _refreshCartCount(user) {
        if (!user || this.cartBadgeEls.length === 0) return
        const result = await cartService.getCartCount(user.uid)
        authStore.store.set({ cartCount: result.success ? result.data : 0 })
    }

    /**
     * Returns true (and redirects) if the current page is admin.html and the
     * signed-in user isn't an admin. Client-side only — this is a UX guard,
     * not real security. Firestore Security Rules must enforce the same
     * check server-side for any admin-only reads/writes to actually be safe.
     */
    _blockIfUnauthorizedAdminPage() {
        const isAdminPage = window.location.pathname.endsWith("admin.html")
        if (!isAdminPage) return false

        const { isAuthenticated, role } = authStore.store.get()
        if (!isAuthenticated) {
            navigateTo("authentication.html")
            return true
        }
        if (role !== "admin") {
            navigateTo("carCatalog.html")
            return true
        }
        return false
    }

    destroy() {
        if (this._unsubscribe) this._unsubscribe()
    }

    _render(state) {
        const { user, role, cartCount } = state
        if (!user) return // shouldn't happen on this page, but guard anyway

        this.cartBadgeEls.forEach((el) => {
            el.textContent = cartCount
            // Hide the badge entirely at zero rather than showing "0" —
            // standard cart-icon convention.
            el.style.display = cartCount > 0 ? "" : "none"
        })

        const name = displayNameFor(user)
        const short = initialsFor(name)
        const roleLabel = roleLabelFor(role)
        const sinceYear = memberSinceYear(user)

        this.avatarEls.forEach((el) => { el.textContent = short })
        this.nameEls.forEach((el) => { el.textContent = name })

        this.adminNameEls.forEach((el) => {
            // Only touch the leading text node (the name itself) — leave the
            // nested <small> role sublabel structurally untouched.
            const textNode = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE)
            if (textNode) {
                textNode.nodeValue = name
            } else {
                el.insertBefore(document.createTextNode(name), el.firstChild)
            }
        })

        const isAdmin = role === "admin"
        this.adminLinks.forEach((el) => { el.style.display = isAdmin ? "" : "none" })

        if (this.menuHeadName) this.menuHeadName.textContent = name
        if (this.menuHeadSub) {
            this.menuHeadSub.textContent = sinceYear
                ? `Collector since ${sinceYear} · ${roleLabel} tier`
                : `${roleLabel} tier`
        }
    }
}

const navbarInit = async () => {
    const controller = new NavbarController()
    await controller.mount()
}

navbarInit()