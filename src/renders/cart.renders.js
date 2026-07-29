import {createElements , createImage} from "../utils/uiBuilder"


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
    <a href="#" class="btn-gold" style="display:inline-block; width:auto; padding:14px 32px;">Browse the Catalog</a>
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
export const createCartItem = () => {
  // <article class="cart-item">
  const article = createElements('article', ['cart-item']);

  // <div class="item-media">
  const itemMedia = createElements('div', ['item-media']);
  const itemImg = createImage('https://picsum.photos/seed/vespergt/400/300', 'Vesper GT');
  itemMedia.appendChild(itemImg);

  // <div class="item-body">
  const itemBody = createElements('div', ['item-body']);

  // <div class="item-top">
  const itemTop = createElements('div', ['item-top']);
  const infoContainer = createElements('div');

  const itemModel = createElements('h3', ['item-model'], 'Vesper GT');
  const itemUnitPrice = createElements('span', ['item-unit-price'], '$187,500 each');

  infoContainer.append(itemId, itemModel, itemUnitPrice);

  // <button class="remove-btn">
  const removeBtn = createElements('button', ['remove-btn']);
  const removeIcon = createRemoveIcon();
  const removeText = document.createTextNode('Remove');

  removeBtn.append(removeIcon, removeText);

  itemTop.append(infoContainer, removeBtn);

  // <div class="item-bottom">
  const itemBottom = createElements('div', ['item-bottom']);
  const itemTotal = createElements('span', ['item-total'], '$187,500');

  itemBottom.appendChild(itemTotal);

  // Assemble the tree
  itemBody.append(itemTop, itemBottom);
  article.append(itemMedia, itemBody);

  return article;
};