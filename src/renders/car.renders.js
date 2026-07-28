import {createElements , createImage} from "../utils/uiBuilder.js"

const buildCarCard = (car) => {
  // ── Root ──────────────────────────────────────────
  const card = createElements('article', ['car-card']);
 
  // ── Media ─────────────────────────────────────────
  const media = createElements('div', ['car-media']);

  const badgeAvailable = createElements('span', ['badge', 'available'], car.availability ? "Available" : "Unavailable");
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
  swatch.style.background = '#111214';          // manual style override
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
