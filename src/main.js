import * as Data from "./data.js"
import { createElements, createImage } from "./utils.js"
/**
 * this function will initialise the functions needed
 */
const getAllCars = async () => {
    const carContent = document.querySelector(".car__content")
    if (!carContent) return

    carContent.innerHTML = `
        <div class="loading-state">
            <p>Loading cars...</p>
        </div>
    `
    const result = await Data.getCars()

    if (result.success) {
        carContent.innerHTML = ''
        if (result.cars.length === 0) {
            carContent.innerHTML = `<p>No cars found.</p>`
            return
        }
        const cars = result.cars
        const carGrid = createElements("div", ['cars__grid'])
        carContent.appendChild(carGrid)
        // to prevent the XSS we use the create+append combination
        cars.forEach((car) => {
            const carCard = createElements("article", ['car__card'])
            const imageWrapper = createElements("div", ["product-card__image-wrapper"])
            const carImage = createImage(car.image, "carImage", ["product-card__img"])
            const favourite = createElements("button", ["product-card__wishlist-btn"])
            favourite.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            `
            imageWrapper.append(carImage, favourite)
            const cardBody = createElements("div", ["product-card__body"])
            const cardHeader = createElements("div", ["product-card__header-row"])
            const carTitle = createElements("h3", ['product-card__title'], car.name)
            const carBrand = createElements("p", ["rating-value"], car.brand)
            const priceContainer = createElements("div", ["product-card__price-row"])
            const price = createElements("span", ["product-card__price"], Number(car.price).toLocaleString()+ " DT ")
            const viewButton = createElements("button", ["product-card__btn-cart"], "View")
            viewButton.dataset.id = car.id


            priceContainer.appendChild(price)
            cardHeader.append(carTitle, carBrand)
            cardBody.append(cardHeader, priceContainer, viewButton)
            carCard.append(imageWrapper, cardBody)
            carGrid.appendChild(carCard)
        })


    } else {
        carContent.innerHTML = `
            <div class="error-state">
                <p>Failed to load cars. Try again.</p>
            </div>`
    }
}


const addClickListener = () => {
    const container = document.querySelector('.car__content')
    if (!container) return
    container.addEventListener("click"  , async(e) => {
            const viewBtn = e.target.closest(".product-card__btn-cart")
            if (!viewBtn || !viewBtn.dataset.id) return
            // using the dataset.id to pass it to the newpage
            window.location.href = `car.html?id=${viewBtn.dataset.id}`

    })    
}

const getCarDetail = async() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) {window.location.href="index.html"}
    const result = await Data.getCarDetail(id)
    if (!result.success) {
        console.log(result.error) 
        return;
    }
  const carContent = document.getElementById("car__content");
  if (!carContent) return
    // Clear out any existing placeholder elements before appending fresh dynamic database contents
    carContent.innerHTML = ""; 

    const carDetailBody = createElements("div", ['detail-panel__body']);
    
    // 1. Breadcrumb Setup
    const carDetailCrumb = createElements("div", ['detail__breadcrumb']);
    const carsSlash = createElements('a', [], 'Cars');
    carsSlash.href = "index.html"; // Make the navigation functional
    const breadcrumbDivider = document.createTextNode(" / ");
    const carSlashName = createElements('span', ["current-car"], result.car.name);
    carDetailCrumb.append(carsSlash, breadcrumbDivider, carSlashName);

    // 2. Header Structural Element Block
    const detailHeader = createElements('div', ["detail__header"]);
    const brandName = createElements('span', ["rating-value"], result.car.brand);
    const detailName = createElements('h1', ['detail__title'], result.car.name);
    detailHeader.append(brandName, detailName);

    // 3. Pricing Display Tier (Fixed Class Typo: Changed from 'detail__price-tie' to 'detail__price-tier')
    const priceContainer = createElements('div', ['detail__price-tier']);
    const market = createElements('span', ['price-label'], 'Market Value');
    const priceValue = createElements('span', ['price-value'], Number(result.car.price).toLocaleString() + " DT");
    priceContainer.append(market, priceValue);

    // Dividers
    const divider1 = createElements('hr', ['detail__divider']);
    const divider2 = createElements('hr', ['detail__divider']);

    // 4. Performance Technical Specifications Grid Architecture
    const specsGrid = createElements('div', ['specs__grid']);

    // Horsepower Structural Pill Container
    const specPill1 = createElements('div', ['spec__pill']);
    const hpLabel = createElements('span', ['spec__label'], 'Performance Power');
    const performance = createElements('span', ['spec__data'], result.car.horspower);
    specPill1.append(hpLabel, performance);

    // Transmission Structural Pill Container
    const specPill2 = createElements('div', ['spec__pill']);
    const transLabel = createElements('span', ['spec__label'], 'Transmission Unit');
    const transmission = createElements('span', ['spec__data'], result.car.transmission);
    specPill2.append(transLabel, transmission);

    specsGrid.append(specPill1, specPill2);

    // 5. Call-To-Action Interaction Section (Using innerHTML to keep the raw SVG heart asset markup clean)
    const buttonContainer = createElements('div', ['detail__actions']);
    buttonContainer.innerHTML = `
        <button class="btn-primary__action">
            Proceed with Inquire / Purchase
        </button>
        <button class="btn-secondary__wishlist" aria-label="Save asset">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
        </button>
    `;

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

getAllCars()
addClickListener()
getCarDetail()