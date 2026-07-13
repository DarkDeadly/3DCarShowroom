import { createElements, createImage } from "../utils.js"

const carElements = new Map()



const updateCars = (cardElement, car, favCars) => {
    //Updating the Price if changed 
    const priceEl = cardElement.querySelector('.product-card__price')
    const newPrice = Number(car.price).toLocaleString() + " DT"
    if (priceEl.textContent !== newPrice) {
        priceEl.textContent = newPrice
    }
    // Update favourite button state
    const favBtn = cardElement.querySelector('.product-card__wishlist-btn')
    const isFav = favCars.includes(car.id)
    const currentlyActive = favBtn.classList.contains('active')

    if (isFav && !currentlyActive) {
        favBtn.classList.add('active')
    } else if (!isFav && currentlyActive) {
        favBtn.classList.remove('active')
    }
}

/**
 * Builds a complete car card DOM element from scratch
 * @param {Object} car - The car data
 * @param {Array} favCars - Array of favourited car IDs
 * @returns {HTMLElement} - The fully assembled card
 */
const buildCarCards = (car, favCars = []) => {
    // ─── IMAGE SECTION ───
    const imageWrapper = createElements("div", ["product-card__image-wrapper"])
    const carImage = createImage(car.image, "carImage", ["product-card__img"])

    const favouriteBtn = createElements("button", ["product-card__wishlist-btn"])
    favouriteBtn.dataset.id = car.id
    if (favCars.includes(car.id)) {
        favouriteBtn.classList.add('active')
    }
    favouriteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`

    imageWrapper.append(carImage, favouriteBtn)

    // ─── BODY SECTION ───
    const cardBody = createElements("div", ["product-card__body"])
    const cardHeader = createElements("div", ["product-card__header-row"])
    const carTitle = createElements("h3", ['product-card__title'], car.name)
    const carBrand = createElements("p", ["rating-value"], car.brand)

    const priceContainer = createElements("div", ["product-card__price-row"])
    const price = createElements("span", ["product-card__price"], Number(car.price).toLocaleString() + " DT")
    const viewButton = createElements("button", ["product-card__btn-cart"], "View")
    viewButton.dataset.id = car.id

    // ─── ASSEMBLY ───
    priceContainer.appendChild(price)
    cardHeader.append(carTitle, carBrand)
    cardBody.append(cardHeader, priceContainer, viewButton)

    const carCard = createElements("article", ['car__card'])
    carCard.append(imageWrapper, cardBody)

    // 🎯 CRITICAL: Store the ID on the element itself for keyed reconciliation
    carCard.dataset.carId = car.id

    return carCard
}


/**
 * Renders the car grid into `.car__content`.
 * Each card reflects its favourite-state via the `active` class on the wishlist button.
 * @param {Array} carList  - cars to render
 * @param {Array} favCars  - array of car IDs that are favourited
 */
const renderCars = (carList, favCars = []) => {
    if (!Array.isArray(carList)) {
        console.error('[renderCars] expected array, got:', typeof carList)
        return
    }
    const carContent = document.querySelector('.car__content')
    if (!carContent) return

    if (carList.length === 0) {
        carContent.innerHTML = `<p>No cars found.</p>`
        return
    }

    let carGrid = carContent.querySelector('.cars__grid')
    if (!carGrid) {
        // If it's the very first page load, create it once
        carContent.innerHTML = '' // Clear loading states/error text
        carGrid = createElements("div", ['cars__grid'])
        carContent.appendChild(carGrid)
    }
    carElements.forEach((el) => {
        el.dataset.stale = 'true'
    })

    carList.forEach(car => {
        if (carElements.has(car.id)) {
            const existantCar = carElements.get(car.id)
            delete existantCar.dataset.stale 
            updateCars(existantCar , car , favCars)
        }else {
            const newCard = buildCarCards(car , favCars)
            carGrid.appendChild(newCard)
            carElements.set(car.id, newCard)
        }
    })
    carElements.forEach((el, id) => {
        if (el.dataset.stale) {
            el.remove()           
            carElements.delete(id)
        }
    })
}

const renderCarDetail = (car) => {
    if (!car || typeof car !== 'object' || Array.isArray(car)) {
        console.error('[renderCar] expected a car object, got:', car)
        return
    }
    const carContent = document.getElementById('car__content')
    if (!carContent) return
    carContent.innerHTML = '';
    const data = {
        name: car.name || 'Unnamed Vehicle',
        brand: car.brand || 'Unknown Brand',
        price: Number(car.price || 0).toLocaleString() + ' DT',
        horsepower: car.horsepower || 'N/A',  // fixed typo
        transmission: car.transmission || 'N/A'
    }

    const carDetailBody = createElements("div", ['detail-panel__body']);

    // 1. Breadcrumb Setup
    const carDetailCrumb = createElements("div", ['detail__breadcrumb']);
    const carsSlash = createElements('a', [], 'Cars');
    carsSlash.href = "index.html"; // Make the navigation functional
    const breadcrumbDivider = document.createTextNode(" / ");
    const carSlashName = createElements('span', ["current-car"], data.name);
    carDetailCrumb.append(carsSlash, breadcrumbDivider, carSlashName);

    // 2. Header Structural Element Block
    const detailHeader = createElements('div', ["detail__header"]);
    const brandName = createElements('span', ["rating-value"], data.brand);
    const detailName = createElements('h1', ['detail__title'], data.name);
    detailHeader.append(brandName, detailName);

    // 3. Pricing Display Tier (Fixed Class Typo: Changed from 'detail__price-tie' to 'detail__price-tier')
    const priceContainer = createElements('div', ['detail__price-tier']);
    const market = createElements('span', ['price-label'], 'Market Value');
    const priceValue = createElements('span', ['price-value'], data.price);
    priceContainer.append(market, priceValue);

    // Dividers
    const divider1 = createElements('hr', ['detail__divider']);
    const divider2 = createElements('hr', ['detail__divider']);

    // 4. Performance Technical Specifications Grid Architecture
    const specsGrid = createElements('div', ['specs__grid']);

    // Horsepower Structural Pill Container
    const specPill1 = createElements('div', ['spec__pill']);
    const hpLabel = createElements('span', ['spec__label'], 'Performance Power');
    const performance = createElements('span', ['spec__data'], data.horsepower);
    specPill1.append(hpLabel, performance);

    // Transmission Structural Pill Container
    const specPill2 = createElements('div', ['spec__pill']);
    const transLabel = createElements('span', ['spec__label'], 'Transmission Unit');
    const transmission = createElements('span', ['spec__data'], data.transmission);
    specPill2.append(transLabel, transmission);

    specsGrid.append(specPill1, specPill2);

    // 5. Call-To-Action Interaction Section (Using innerHTML to keep the raw SVG heart asset markup clean)
    const buttonContainer = createElements('div', ['detail__actions']);
    // 1. Create the Primary Action Button using native DOM elements
    const inquireBtn = createElements('button', ['btn-primary__action'], 'Proceed with Inquire / Purchase');
    inquireBtn.dataset.id = car.id;

    // 2. Create the Wishlist Button shell natively
    const wishlistBtn = createElements('button', ['btn-secondary__wishlist']);
    wishlistBtn.setAttribute('aria-label', 'Save asset');
    wishlistBtn.dataset.id = car.id;

    // 3. Use innerHTML ONLY for the inner SVG string graphic
    // This avoids dealing with complex document.createElementNS namespaces
    wishlistBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
    `;

    // 4. Clean assembly chain
    buttonContainer.append(inquireBtn, wishlistBtn);

    // 6. Master Layout Render Assembly Chain
    carDetailBody.append(
        carDetailCrumb,
        detailHeader,
        priceContainer,
        divider1,
        specsGrid,
        divider2,
        buttonContainer
    );

    carContent.appendChild(carDetailBody);
}


export { buildCarCards, updateCars, renderCars , renderCarDetail}