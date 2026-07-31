let state = {
    cart: [],
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