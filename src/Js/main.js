import { debounce , createElements, createImage} from "./utils.js"
import * as Data from "./data.js"
import { initAdminAddCarBtn, initNavAuth } from "./uiChanges.js"

let filterState = {
     currentBrand : '' ,
     currentSearch : ''
}



/**
 * this function will only render all cars
 * @param {Array} carList
 */
const renderCars = (carList) => {
    if (!Array.isArray(carList)) {
        console.error('[renderCars] expected array, got:', typeof carList)
        return   
    }
    const carContent = document.querySelector('.car__content')
    if (!carContent) return
     carContent.innerHTML = ''

    if (carList.length === 0) {
        carContent.innerHTML = `<p>No cars found.</p>`
        return
    }

    const carGrid = createElements("div", ['cars__grid'])
    carContent.appendChild(carGrid)

    carList.forEach((car) => {
        const carCard = createElements("article", ['car__card'])
        const imageWrapper = createElements("div", ["product-card__image-wrapper"])
        const carImage = createImage(car.image, "carImage", ["product-card__img"])
        const favourite = createElements("button", ["product-card__wishlist-btn"])
        favourite.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`

        imageWrapper.append(carImage, favourite)
        const cardBody = createElements("div", ["product-card__body"])
        const cardHeader = createElements("div", ["product-card__header-row"])
        const carTitle = createElements("h3", ['product-card__title'], car.name)
        const carBrand = createElements("p", ["rating-value"], car.brand)
        const priceContainer = createElements("div", ["product-card__price-row"])
        const price = createElements("span", ["product-card__price"], Number(car.price).toLocaleString() + " DT")
        const viewButton = createElements("button", ["product-card__btn-cart"], "View")
        viewButton.dataset.id = car.id

        priceContainer.appendChild(price)
        cardHeader.append(carTitle, carBrand)
        cardBody.append(cardHeader, priceContainer, viewButton)
        carCard.append(imageWrapper, cardBody)
        carGrid.appendChild(carCard)
    })
}

const getAllCars = async () => {
    const carContent = document.querySelector(".car__content")
    if (!carContent) return
    carContent.innerHTML = `<div class="loading-state"><p>Loading...</p></div>`
    const result = await Data.getCars()
    if (!result.success) {
        carContent.innerHTML = `<div class="error-state"><p>Failed to load cars. Try again.</p></div>`
        return  
    }
    renderCars(result.data)
}



const addClickListener = () => {
    const container = document.querySelector('.car__content')
    if (!container) return
    container.addEventListener("click", async (e) => {
        const viewBtn = e.target.closest(".product-card__btn-cart")
        if (!viewBtn || !viewBtn.dataset.id) return
        // using the dataset.id to pass it to the newpage
        window.location.href = `car.html?id=${viewBtn.dataset.id}`

    })
}


/**
 * this function only render Car Details
 * @param {object} car - car object
 */

const renderCar = (car) => {
    if (!car || typeof car !== 'object' || Array.isArray(car)) {
        console.error('[renderCar] expected a car object, got:', car)
        return
    }
    const carContent = document.getElementById('car__content')
    if (!carContent) return 
    carContent.innerHTML= '';
    const data = {
        name: car.name || 'Unnamed Vehicle',
        brand: car.brand || 'Unknown Brand',
        price: Number(car.price || 0).toLocaleString() + ' DT',
        horsepower: car.horspower || 'N/A',  // fixed typo
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

const getCarDetail = async () => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id ) { 
        window.location.href = "index.html" 
        return
    }
    const result = await Data.getCarDetail(id)
    if (!result.success) {
        console.error('[getCarDetail] failed:', result.error)
        return;
    }
    renderCar(result.data) 
}

const applyFilter = async() => {
    if (Data.getCachedCars().length===0) {
        const fetchedCars = await Data.getCars()
        if (!fetchedCars.success) {
            renderCars([])
            return
        }
    }
    const cars = Data.getFilteredCars(filterState)
    renderCars(cars)   
}
const initSearch = () => {
    const searchInput = document.getElementById("carSearchInput")
    if (!searchInput) return
    searchInput.addEventListener('input', debounce( (e) => {
        filterState.currentSearch = e.target.value.trim()
        applyFilter()        
    }, 300))
}

const initFilter = () => {
    const filterContainer  = document.getElementById("brandSortSelect")
    if (!filterContainer) return
    filterContainer.addEventListener('change' , (e) => {
        filterState.currentBrand = e.target.value.trim()
        applyFilter()
    })
}

const addManufacturer = async () => {
    const manifactureSelector = document.getElementById('brandSortSelect')
    if (!manifactureSelector) return

    let manifactorList = Data.getCachedCars()

    if (manifactorList.length === 0) {
        const result = await Data.getCars()
        if (!result.success) return
        manifactorList = result.data
    }

    // get unique brands only
    const uniqueBrands = [...new Set(manifactorList.map(car => car.brand))]

    // reset and add default option
    manifactureSelector.innerHTML = '<option value="">All brands</option>'

    // render one option per unique brand
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option')
        option.value = brand
        option.textContent = brand  // ← this is what shows in the dropdown
        manifactureSelector.appendChild(option)
    })
}

const initIndexPage = async () => {
    const carContent = document.querySelector('.car__content')
    if (!carContent) return

    await getAllCars()
    await addManufacturer()
    addClickListener()
    initSearch()
    initFilter()
    initAdminAddCarBtn()

}

const initCarPage = () => {
    const carDetailContainer = document.getElementById('car__content')
    if (!carDetailContainer) return
    getCarDetail()
}

initIndexPage()
initCarPage()
initNavAuth({isAuthPage : false})

