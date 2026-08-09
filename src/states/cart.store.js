let state = {
    // Not persistence — the real cart lives in Firestore under
    // users/{uid}/cart. This is just an in-page signal so any controller
    // that mutates the cart can broadcast the new count and the navbar
    // badge (or anything else subscribed) updates without a reload.
    cartCount: 0,
    user: null,
    isAuthenticated: false,
    role: null
}

const subscribers  = []

export const store = {

    get(key) {
        return key ? state[key] : { ...state }
    },
    set(updates) {
        const prev = { ...state }
        state = {...state, ...updates}
        subscribers.forEach(cb => cb({ state, prev, updates }));
    },
    subscribe(callback) {
        subscribers.push(callback);
        return () => {
            const i = subscribers.indexOf(callback);
            if (i > -1) subscribers.splice(i, 1);
        };
    }
}