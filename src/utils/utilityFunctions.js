/**
 * Trailing-edge debounce: collapses a burst of calls (keystrokes) into one
 * invocation, fired `ms` after the LAST call. clearTimeout is the whole trick.
 */
export const debounce = (fn, ms) => {
    let timer = null
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), ms)
    }
}