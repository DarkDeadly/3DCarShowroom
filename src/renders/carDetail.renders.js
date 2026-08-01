import {createElements , createImage} from "../utils/uiBuilder.js"




/**
 * Creates the top identity section for a given car.
 * @param {Object} car
 * @returns {HTMLElement}
 */
export const buildIdentitySection = (car) => {
  const grid = createElements('div', ['identity-grid']);

  // --- Left Column: Info ---
  const leftCol = createElements('div');
  
  const eyebrow = createElements('span', ['eyebrow'], `${car.brand} · ${car.category} Collection`);
  
  const heading = createElements('h1', ['identity-heading'], car.model);
  heading.style.marginTop = '14px';

  // Meta row (Year · Category · Swatch + Color)
  const meta = createElements('div', ['identity-meta']);
  
  const yearSpan = createElements('span', [], String(car.year));
  const dot1 = createElements('span', ['dot'], '·');
  const categorySpan = createElements('span', [], car.category);
  const dot2 = createElements('span', ['dot'], '·');
  
  const colorSpan = createElements('span');
  const swatch = createElements('span', ['swatch']);
  swatch.style.background = '#1a1a2e'; // Custom swatch color or map dynamically
  
  colorSpan.appendChild(swatch);
  colorSpan.appendChild(document.createTextNode(car.color));

  meta.append(yearSpan, dot1, categorySpan, dot2, colorSpan);

  const description = createElements('p', ['identity-desc'], car.description);

  leftCol.append(eyebrow, heading, meta, description);

  // --- Right Column: Price Card ---
  const priceCard = createElements('div', ['price-card']);
  
  const priceBig = createElements('span', ['price-big']);
  const sup = createElements('sup', [], 'DT');
  const priceText = document.createTextNode(car.price.toLocaleString());
  priceBig.append(sup, priceText);

  const br = createElements('br');

  const availStatus = car.availability ? 'available' : 'unavailable';
  const availText = car.availability ? 'Available Now' : 'Out of Stock';
  const availSpan = createElements('span', ['avail-inline', availStatus], availText);

  const ctaRow = createElements('div', ['cta-row']);
  
  const privateViewingBtn = createElements('button', ['btn', 'btn-primary'], '3D Model Showcase');
  privateViewingBtn.type = 'button';

  const specialistLink = createElements('a', ['specialist-link'], 'Contact a Specialist →');
  specialistLink.href = '#';

  ctaRow.append(privateViewingBtn, specialistLink);
  priceCard.append(priceBig, br, availSpan, ctaRow);

  // Assemble grid and section
  grid.append(leftCol, priceCard);
  return grid

};

/**
 * Creates the bottom availability and CTA section for a given car.
 * @param {Object} car
 * @returns {HTMLElement}
 */
export const buildCTASection = (car) => {
  const container = createElements('div', ['wrap']);

  const eyebrow = createElements('span', ['eyebrow'], 'Ready When You Are');
  const heading = createElements('h2', [], `Reserve the ${car.model}`);
  
  const descText = car.availability
    ? 'Currently available on our showroom floor. Reservations are held for 72 hours pending inspection sign-off.'
    : 'Currently unavailable for immediate reservation. Contact a specialist to join the waiting list.';
    
  const desc = createElements('p', [], descText);

  const ctaActions = createElements('div', ['cta-actions']);
  
  const reserveBtn = createElements('button', ['btn', 'btn-primary'], 'Add To Cart');
  reserveBtn.type = 'button';
  reserveBtn.dataset.action = 'add-to-cart';
  if (!car.availability) reserveBtn.disabled = true;

  const specialistLink = createElements('a', ['specialist-link'], 'Contact Specialist →');
  specialistLink.href = '#';

  ctaActions.append(reserveBtn, specialistLink);
  container.append(eyebrow, heading, desc, ctaActions);
  return container
};


export const buildImageShowcase = (car) => {
    const imageWrapper = createElements("div" , ['main-frame'])
    const availabilityBadge = createElements("span" , ["badge" ,"available"] , car.availability ? "Available" : "Unavailable")
    const image = createImage(car.image , car.model , [])
    imageWrapper.append(availabilityBadge , image)
    return imageWrapper
}