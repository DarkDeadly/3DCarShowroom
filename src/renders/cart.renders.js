import {createElements , createImage} from "../utils/uiBuilder.js"


export const cartEmptyState = (container) => {
    return container.innerHTML = `
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="20" r="1.4"/>
        <circle cx="18" cy="20" r="1.4"/>
        <path d="M2.5 3h2.4l2.2 12.2a2 2 0 0 0 2 1.65h8.3a2 2 0 0 0 1.97-1.62L21 8H6.2"/>
      </svg>
    </div>
    <h2>Your cart is empty</h2>
    <p>You haven&rsquo;t selected any vehicles yet. Explore the collection to begin.</p>
     <a href="carCatalog.html" class="btn-gold" style="display:inline-block; width:auto; padding:14px 32px;">Browse the Catalog</a>
    `
}

/**
 * Creates the SVG element for the remove button icon.
 * @returns {SVGElement}
 */
const createRemoveIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');

  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', '18');
  line1.setAttribute('y1', '6');
  line1.setAttribute('x2', '6');
  line1.setAttribute('y2', '18');

  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', '6');
  line2.setAttribute('y1', '6');
  line2.setAttribute('x2', '18');
  line2.setAttribute('y2', '18');

  svg.append(line1, line2);
  return svg;
};

/**
 * Creates the static cart item element.
 * @returns {HTMLElement} <article class="cart-item">
 */
export const createCartItem = (car , container) => {
  // <article class="cart-item">
  const article = createElements('article', ['cart-item']);

  // <div class="item-media">
  const itemMedia = createElements('div', ['item-media']);
  const itemImg = createImage(car.image, car.model);
  itemMedia.appendChild(itemImg);

  // <div class="item-body">
  const itemBody = createElements('div', ['item-body']);

  // <div class="item-top">
  const itemTop = createElements('div', ['item-top']);
  const infoContainer = createElements('div');

  const itemModel = createElements('h3', ['item-model'], car.model);
  const itemUnitPrice = createElements('span', ['item-unit-price'], car.price.toLocaleString() + ' DT each');

  infoContainer.append( itemModel, itemUnitPrice);

  // <button class="remove-btn">
  const removeBtn = createElements('button', ['remove-btn']);
  removeBtn.dataset.carId = car.id
  const removeIcon = createRemoveIcon();
  const removeText = document.createTextNode('Remove');

  removeBtn.append(removeIcon, removeText);

  itemTop.append(infoContainer, removeBtn);

  // <div class="item-bottom">
  const itemBottom = createElements('div', ['item-bottom']);
  const itemTotal = createElements('span', ['item-total'], car.price.toLocaleString() + ' DT');

  itemBottom.appendChild(itemTotal);

  // Assemble the tree
  itemBody.append(itemTop, itemBottom);
  article.append(itemMedia, itemBody);
  container.append(article)
  return article;
};


/**
 * Creates the static order summary block.
 * @returns {HTMLElement} A wrapper containing the heading, rows, total, and actions
 */
export const createOrderSummary = (container , price) => {
  // Wrapper container (e.g., <div class="summary-card"> or DocumentFragment)

  // <h2>Order Summary</h2>
  const heading = createElements('h2', [], 'Order Summary');

  // Subtotal row
  const subtotalRow = createElements('div', ['summary-row']);
  const subtotalLabel = createElements('span', [], 'Subtotal');
  const subtotalValue = createElements('span', ['value'], price.toLocaleString() + ' DT');
  subtotalRow.append(subtotalLabel, subtotalValue);

  // Tax & fees row
  const taxRow = createElements('div', ['summary-row']);
  const taxLabel = createElements('span', [], 'Estimated tax & fees');
  const taxValue = createElements('span', ['value'], '44,912'.toLocaleString() + ' DT');
  taxRow.append(taxLabel, taxValue);

  // <div class="summary-divider"></div>
  const divider = createElements('div', ['summary-divider']);

  // Grand total section
  const totalRow = createElements('div', ['summary-total']);
  const totalLabel = createElements('span', ['label'], 'Grand Total');
  const totalValue = createElements('span', ['value'], (price + 44912).toLocaleString() + ' DT');
  totalRow.append(totalLabel, totalValue);

  // Actions
  const checkoutBtn = createElements('button', ['btn-gold'], 'Proceed to Checkout');
  checkoutBtn.type = 'button';

   const continueLink = createElements('a', ['continue-link'], 'Continue Shopping');
  continueLink.href = 'carCatalog.html';

  // Assemble everything
  container.append(
    heading,
    subtotalRow,
    taxRow,
    divider,
    totalRow,
    checkoutBtn,
    continueLink
  );

  return container;
};