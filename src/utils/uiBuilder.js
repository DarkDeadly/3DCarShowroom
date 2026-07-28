/**
 * this function is an utility function to create elements with classes and text content it will help us to reduce the amount of code we need to write when creating elements and also make our code more readable.
 * @param {string} tag - The HTML tag to create (e.g., 'div', 'span', 'td')
 * @param {Array} classNames - An array of class names to add to the element (optional)
 * @param {string} textContent - The text content to set for the element (optional)
 * @returns {HTMLElement} - The created HTML element with the specified tag, classes, and text content
 */

export const createElements = (tag, classNames = [], textContent = '') => {
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

export const navigateTo = (url) => {
    window.location.href = url;
}