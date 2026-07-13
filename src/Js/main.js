import { debounce, createElements, createImage, showFeedback, showError, showLoading } from "./utils.js"
import * as Data from "./data.js"
import { initAdminAddCarBtn, initNavAuth } from "./uiChanges.js"
import * as service from "./cars/car.service.js"
import * as Render from "./cars/car.render.js"
import {ensureCachedIsLoaded} from "./discovery/discovery.service.js"
import {buildBrandDropdown} from "./discovery/discovery.render.js"
let filterState = {
    currentBrand: '',
    currentSearch: ''
}

const getAllCars = async () => {
    const carContent = document.querySelector(".car__content")
    if (!carContent) return
    
    showLoading(carContent)
    const result = await service.loadNextPage()
    if (!result.success) {
        showError(carContent ,result.error)
        return
    }
    Render.renderCars(result.data)   
}

/*
    Getting detail car functionality starts 
*/

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

const getCarDetail = async () => {
    const carContent = document.getElementById('car__content')
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) {
        window.location.href = "index.html"
        return
    }
    showLoading(carContent)
    const result = await service.getCar(id)
    if (!result.success) {
        showError(carContent , result.error)
        return
    }
    Render.renderCarDetail(result.data)
    initCart()
}

/* 
    Getting detailedCar done
*/

/*
    Filtering + Searching functionality
*/

const applyFilter = () => {
    const cars = Data.getFilteredCars(filterState)
    Render.renderCars(cars)
}

const initSearch = () => {
    const searchInput = document.getElementById("carSearchInput")
    if (!searchInput) return
    searchInput.addEventListener('input', debounce(async (e) => {
        filterState.currentSearch = e.target.value.trim()
        const result =await ensureCachedIsLoaded()
        if (!result.success) {
            Render.renderCars([])
            return
        }
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

const initBrandFilter = async () => {
    const result = await Data.getAllBrand()
    if (result.success) {
        buildBrandDropdown(result.data)
    }
}

/*
    filter + search functionality ends
*/

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
        Render.renderCars(cars, [])
        return
    }
    const favResult = await Data.getUserFavourites(user.uid)
    const favourites = favResult.success ? favResult.data : []

    Render.renderCars(cars, favourites)
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
const initCart = () => {
    const cartBtn = document.querySelector('.btn-primary__action')
    if (!cartBtn) return
    
    cartBtn.addEventListener('click', async (e) => {
        const carId = e.currentTarget.dataset.id
        if (!carId) {
            console.error('[initCart] carId missing on button')
            return
        }
        const user = Data.getCachedUser()
        if (!user) {
            window.location.href = 'authentication.html'
            return
        }

        // 🌟 Save the original text so we can restore it if things fail
        const originalText = cartBtn.textContent

        try {
            cartBtn.disabled = true
            cartBtn.textContent = 'Adding to Cart...' 

            const result = await Data.addToCart(carId, user.uid)

            if (!result.success) {
                console.error('[initCart] addToCart failed:', result.error)
                
                cartBtn.disabled = false
                cartBtn.textContent = originalText
                return
            }

            console.log('[initCart] addToCart success:', result.data)
            cartBtn.textContent = 'Added to Cart!'
            cartBtn.classList.add('btn--success') // Optional: style it green

        } catch (error) {
            console.error('[initCart] Unexpected execution error:', error)
            cartBtn.disabled = false
            cartBtn.textContent = originalText
        }
    })
}

const initIndexPage = async () => {
    const carContent = document.querySelector('.car__content')
    if (!carContent) return

    await getAllCars()
    await initBrandFilter()
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

