import {createElements , createImage} from "../utils/uiBuilder.js"

const buildCarCard = (car) => {
  // ── Root ──────────────────────────────────────────
  const card = createElements('article', ['car-card']);
 
  // ── Media ─────────────────────────────────────────
  const media = createElements('div', ['car-media']);

  const badgeAvailable = createElements(
    'span',
    car.availability ? ['badge', 'available'] : ['badge', 'sold'],
    car.availability ? "Available" : "Unavailable"
  );
  const img            = createImage(
    car.image,
    car.model,
    []
  );

  media.append(badgeAvailable, img);

  // ── Body ──────────────────────────────────────────
  const body = createElements('div', ['car-body']);

  // Title row
  const titleRow = createElements('div', ['car-title-row']);
  const title    = createElements('h3', ['car-title'], car.model);
  const year     = createElements('span', ['car-year'], car.year);
  titleRow.append(title, year);

  const category = createElements('span', ['car-category'], car.category);
  const desc     = createElements('p', ['car-desc'],
    car.description
  );

  // Meta
  const meta = createElements('div', ['car-meta']);

  const swatchRow  = createElements('div', ['swatch-row']);
  const swatch     = createElements('span', ['swatch']);
  swatch.style.background = car.color;          // manual style override
  const swatchLabel = createElements('span', ['swatch-label'], car.color);
  swatchRow.append(swatch, swatchLabel);

  // Price plate with nested <sup>
  const pricePlate = createElements('span', ['price-plate']);
  const sup        = createElements('sup', [], 'DT');
  pricePlate.append(sup, car.price);

  meta.append(swatchRow, pricePlate);

  // Button
  const btn = createElements('button', ['btn-details'], 'View Detail');
  btn.type = 'button';                          // manual attribute override
  btn.dataset.id = car.id;
  // Assemble body
  body.append(titleRow, category, desc, meta, btn);

  // Assemble card
  card.append(media, body);

  return card;
};
export const appendCars = (cars , container) => {
     cars.forEach(car => {
        container.appendChild(
            buildCarCard(car)
        );
    });
}
export const renderCars = (cars, container) => {
    container.innerHTML = "";
    appendCars(cars , container)
}

/**
 * Zero-result state rendered INSIDE the grid (keeps load-more + chrome intact,
 * unlike carEmptyState which replaces the whole catalog section).
 * filtered=true means the user caused it (search/category) → offer a reset.
 */
export const renderNoResults = (container, { filtered = false } = {}) => {
  container.innerHTML = `
    <div class="empty-state grid-empty">
      <div class="empty-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C9A24B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8.5" y1="8.5" x2="13.5" y2="13.5"/>
          <line x1="13.5" y1="8.5" x2="8.5" y2="13.5"/>
        </svg>
      </div>
      ${filtered
        ? `<h3>Nothing on the floor matches</h3>
           <p>No vehicle fits this combination of search and category. Loosen a filter — or reset the view to see the whole floor again.</p>
           <div class="empty-actions">
             <button type="button" class="btn-gold btn-reset-filters">Reset filters</button>
           </div>`
        : `<h3>The floor is momentarily empty</h3>
           <p>Our inventory is being rotated right now. New arrivals land weekly — check back a little later.</p>`}
    </div>
  `
}

export const carEmptyState = (container) => {
 return container.innerHTML = `
  <section class="catalog wrap">

  <div class="empty-state">
    <div class="empty-icon">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C9A24B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3.5a1 1 0 0 1 .3-.7l2.4-2.4A2 2 0 0 1 7.1 7.6h9.8a2 2 0 0 1 1.4.6l2.4 2.4a1 1 0 0 1 .3.7V15a2 2 0 0 1-2 2M5 17a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2M17 17a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2M9 17h6"/>
        <circle cx="7.5" cy="14" r="0.5" fill="#C9A24B"/>
        <circle cx="16.5" cy="14" r="0.5" fill="#C9A24B"/>
      </svg>
    </div>
    <h3>No cars are on the floor right now</h3>
    <p>Our current inventory is being rotated. Nothing matches this view at the moment — try a different category, or check back a little later.</p>
    <div class="empty-actions">
      <span class="btn-primary">Notify Me When Stock Arrives</span>
      <span class="btn-ghost">Reset Filters</span>
    </div>
  </div>

</section>
  ` 
}