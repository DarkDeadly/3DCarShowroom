import { debounce, createElements, createImage, showFeedback, showError, showLoading } from "./utils.js"
import * as Data from "./data.js"
import { initAdminAddCarBtn, initNavAuth } from "./uiChanges.js"

let filterState = {
    currentBrand: '',
    currentSearch: ''
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
        favourite.dataset.id = car.id
        if (favCars.includes(car.id)) {
            favourite.classList.add('active')
        }
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

    showLoading(carContent)

    const carResult = await Data.getCars()

    if (!carResult.success) {
        showError(carContent)
        return
    }
    renderCars(carResult.data, [])
    Data.setCachedCars(carResult.data)
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
    const carContent = document.getElementById('car__content')
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) {
        window.location.href = "index.html"
        return
    }
    showLoading(carContent)
    const result = await Data.getCarDetail(id)
    if (!result.success) {
        console.error('[getCarDetail] failed:', result.error)
        showError(carContent)
        return;
    }
    renderCar(result.data)
}
const ensureCachedIsLoaded = async () => {
    if (Data.getCachedCars().length === 0) {
        const fetchedCars = await Data.getCars()
        if (!fetchedCars.success) {
            renderCars([])
            return
        }
        Data.setCachedCars(fetchedCars.data)
    }
}
const applyFilter =  () => {
    const cars = Data.getFilteredCars(filterState)
    renderCars(cars)
}

const initSearch = () => {
    const searchInput = document.getElementById("carSearchInput")
    if (!searchInput) return
    searchInput.addEventListener('input', debounce(async(e) => {
        filterState.currentSearch = e.target.value.trim()
        await ensureCachedIsLoaded()
        applyFilter()
    }, 300))
}

const initFilter = () => {
    const filterContainer = document.getElementById("brandSortSelect")
    if (!filterContainer) return
    filterContainer.addEventListener('change', (e) => {
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

const initModal = () => {
    const addBtn = document.getElementById('openAddModalBtn')
    if (!addBtn) return
    const modal = document.getElementById('addCarModal')
    const closeButton = document.getElementById('closeAddModalBtn');
    const cancelButton = document.getElementById('cancelAddModalBtn');
    if (!modal || !closeButton || !cancelButton) {
        console.error('[initModal] critical modal elements missing')
        return
    }
    addBtn.addEventListener('click', (e) => {
        e.preventDefault()
        modal.showModal()
    })
    // Close Native Modal Window Procedures
    const closeModal = () => modal.close();

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
}

const handleForm = () => {
    const form = document.getElementById('addVehicleForm')
    if (!form) return
    const feedbackArea = document.getElementById('auth-feedback')
    const carNameInput = document.getElementById('car-name')
    const carBrandInput = document.getElementById('car-brand')
    const carHorsePowerInput = document.getElementById('car-hp')
    const carTransmissionInput = document.getElementById('car-transmission')
    const carPriceInput = document.getElementById('car-price')
    const carImageInput = document.getElementById('car-image')
    const addBtn = document.querySelector('.btn-modal-primary')
    if (!carNameInput || !carBrandInput || !carHorsePowerInput ||
        !carTransmissionInput || !carPriceInput || !carImageInput) {
        console.error('[handleForm] form inputs missing')
        return
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const carInfo = {
            name: carNameInput.value.trim() || 'unknown car',
            brand: carBrandInput.value.trim() || 'unknown brand',
            horsepower: carHorsePowerInput.value.trim() || '0hp',
            transmission: carTransmissionInput.value.trim() || '',
            price: Number(carPriceInput.value) || 0
        }

        const carImage = carImageInput.files[0]

        if (!carImage) {
            showFeedback(feedbackArea, 'Please select an image', 'error', 'auth-feedback')
            return
        }
        addBtn.disabled = true
        addBtn.textContent = 'Uploading...'
        const result = await Data.addCars(carInfo, carImage)
        addBtn.disabled = false
        addBtn.textContent = 'Publish Vehicle Listing'
        if (!result.success) {
            showFeedback(feedbackArea, result.error, 'error', 'auth-feedback')
            return
        }
        showFeedback(feedbackArea, 'Car added successfully', 'success', 'auth-feedback')
        form.reset()
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1500)
    })
}
const showFavouriteCars = async (user) => {
    const cars = Data.getCachedCars()

    if (!user) {
        renderCars(cars, [])
        return
    }
    const favResult = await Data.getUserFavourites(user.uid)
    const favourites = favResult.success ? favResult.data : []

    renderCars(cars, favourites)
}


const handleFavourite = () => {
    const carContent = document.querySelector('.car__content')
    if (!carContent) return

    carContent.addEventListener('click', async (e) => {
        const favBtn = e.target.closest('.product-card__wishlist-btn')
        if (!favBtn || !favBtn.dataset.id) return

        // Read user at click time — always fresh
        const user = Data.getCachedUser()
        if (!user) {
            window.location.href = 'authentication.html'
            return
        }

        const carId = favBtn.dataset.id
        const result = await Data.toggleFavourite(carId, user.uid)

        if (!result.success) {
            console.error('[handleFavourite] toggle failed:', result.error)
            return
        }

        // Toggle active class on the button
        if (result.data.isFavourite) {
            favBtn.classList.add('active')
        } else {
            favBtn.classList.remove('active')
        }
    })
}
const renderFavourites = (carData) => {
    // 1. Root Element Box Container Setup
    const favCard = createElements("div", ["fav-card"]);
    favCard.dataset.carId = carData.id || "car_01";

    // 2. Upper Media Image Pane Wrapper Layer
    const imagePane = createElements("div", ["fav-card__image-pane"]);

    // Using your custom createImage function with asset lazy loading built-in
    const thumbnail = createImage(
        carData.image || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600",
        "Vehicle preview",
        ["car-thumbnail"],
        "/src/assets/placeholder-car.png" // Optional local fallback file safety path
    );

    // Glassmorphism Spec Overlay Pills
    const glassSpecs = createElements("div", ["fav-card__glass-specs"]);
    const hpPill = createElements("span", ["glass-pill"], `${carData.horsepower || '503'} HP`);
    const transPill = createElements("span", ["glass-pill"], carData.transmission || 'Automatic');
    glassSpecs.append(hpPill, transPill);

    // Remove Action Button with raw nested SVG markup
    const removeBtn = createElements("button", ["btn-remove-fav"]);
    removeBtn.setAttribute("aria-label", "Remove from favorites");
    removeBtn.setAttribute("title", "Remove listing");
    removeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
    `;

    // Assembly point for the image pane component layers
    imagePane.append(thumbnail, glassSpecs, removeBtn);

    // 3. Lower Content Compartment Details Row
    const cardDetails = createElements("div", ["fav-card__details"]);

    // Brand and Model Text Node Meta
    const carMeta = createElements("div", ["car-meta"]);
    const carBrand = createElements("span", ["car-brand"], carData.brand || "BMW");
    const carName = createElements("h3", ["car-name"], carData.name || "M4 Competition");
    carMeta.append(carBrand, carName);

    // Pricing Split Row
    const carPricingTier = createElements("div", ["car-pricing-tier"]);

    const priceStack = createElements("div", ["price-stack"]);
    const priceLabel = createElements("span", ["price-label"], "Market Value");

    // Format the price beautifully to match your localization preferences
    const formattedPrice = Number(carData.price || 85000).toLocaleString() + " DT";
    const priceAmount = createElements("span", ["price-amount"], formattedPrice);
    priceStack.append(priceLabel, priceAmount);

    // Redirect Arrow/Viewport Execution Button
    const viewAssetBtn = createElements("button", ["btn-view-asset"]);
    viewAssetBtn.setAttribute("title", "Open 3D Viewport");
    viewAssetBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
    `;

    // Final Assembly Steps
    carPricingTier.append(priceStack, viewAssetBtn);
    cardDetails.append(carMeta, carPricingTier);
    favCard.append(imagePane, cardDetails);

    return favCard;
}

const showFavourite = async (userId) => {
    const container = document.querySelector('.fav-grid')
    if (!container) {
        console.error('[showFavourite] .fav-grid not found')
        return
    }

    try {
        const favouriteList = await Data.getUserFavourites(userId)
        if (!favouriteList.success) {
            console.error('[showFavourite] failed to get favourites:', favouriteList.error)
            container.innerHTML = '<p>Failed to load favourites.</p>'
            return
        }

        if (favouriteList.data.length === 0) {
            container.innerHTML = '<p>No favourites yet.</p>'
            return
        }

        const carRequests = favouriteList.data.map((carId) => Data.getCarDetail(carId))
        const carResults = await Promise.all(carRequests)

        const favCards = carResults
            .filter((result) => result.success)
            .map((result) => renderFavourites(result.data))
        if (favCards.length === 0) {
            container.innerHTML = '<p>No favourites found.</p>'
            return
        }

        container.innerHTML = ''
        container.append(...favCards)

    } catch (error) {
        console.error('[showFavourite] failed:', error)
        container.innerHTML = '<p>Something went wrong.</p>'
    }
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
    initModal()
    handleForm()
    handleFavourite()
    Data.onAuthStateCheck((user) => {
        showFavouriteCars(user)
    })

}

const initFavouritePage = () => {
    const favContent = document.querySelector('.fav-grid')
    if (!favContent) return
    Data.onAuthStateCheck((user) => {

        if (!user) {
            window.location.href = 'authentication.html'
            return
        }
        showFavourite(user.uid)
    })

}




const initCarPage = () => {
    const carDetailContainer = document.getElementById('car__content')
    if (!carDetailContainer) return
    getCarDetail()
}
initIndexPage()
initCarPage()
initFavouritePage()
initNavAuth({ isAuthPage: false })

