/**
 * this function is an utility function to create elements with classes and text content it will help us to reduce the amount of code we need to write when creating elements and also make our code more readable.
 * @param {string} tag - The HTML tag to create (e.g., 'div', 'span', 'td')
 * @param {Array} classNames - An array of class names to add to the element (optional)
 * @param {string} textContent - The text content to set for the element (optional)
 * @returns {HTMLElement} - The created HTML element with the specified tag, classes, and text content
 */

export const createElements = (tag , classNames = [] , textContent = '' ) => {
    const element = document.createElement(tag);
    classNames.forEach(className => element.classList.add(className));
    if (textContent) element.textContent = textContent;
    return element;
}


/**
 * Creates a configured HTMLImageElement with standard fallback handlers
 * @param {string} src - The image URL source track
 * @param {string} alt - The alternative text string for structural accessibility (Required)
 * @param {Array<string>} classNames - Array of CSS classes to attach to the node layout
 * @param {string} fallbackSrc - Optional placeholder image URL if the primary link returns a 404
 * @returns {HTMLImageElement}
 */
export const createImage = (src, alt = '', classNames = [], fallbackSrc = '') => {
    const img = document.createElement('img');
    
    // Core structural properties
    img.src = src;
    img.alt = alt; // Keeps your layout compliant with UI/UX accessibility contrast standards
    img.loading = 'lazy'; // Native performance optimization out of the box for Vite
    
    // Apply styling tokens
    classNames.forEach(className => img.classList.add(className));
    
    // Broken Image Safety Fallback Engine
    if (fallbackSrc) {
        img.onerror = () => {
            img.src = fallbackSrc;
            img.onerror = null; // Prevents infinite loops if the fallback link breaks too
        };
    }
    
    return img;
};
/**
 * Debounce function in order to optimise the search functionality
 * @param {function} func - the function that the debounce will be applied on
 * @param {number} timer - the timer set for the delay
 * @returns {Function} - The debounced function
 */
export const debounce = (func , wait) => {
    let timeout ; 
    return function(...args) {
        clearTimeout(timeout) ;
        timeout = setTimeout(() => func.apply(this , args) , wait) ;
    }
}
/**
 * Validates an email address format
 * @param {string} email
 * @returns {{ valid: boolean, error: string }}
 */
export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' }
    }

    const trimmed = email.trim()

    if (trimmed.length === 0) {
        return { valid: false, error: 'Email cannot be empty' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(trimmed)) {
        return { valid: false, error: 'Please enter a valid email address' }
    }

    return { valid: true, error: '' }
}


  export const showFeedback = (element , message, type = 'error' , className) => {
        if (!element) return
        element.className = className
        element.classList.add(`${className}--${type}`)
        element.textContent = message
    }
