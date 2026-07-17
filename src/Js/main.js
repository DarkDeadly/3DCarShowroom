import {navigateTo, navigateToWithDelay, convertNumber, debounce, createElements, createImage, showFeedback, showError, showLoading } from "./utils.js"
import * as Data from "./data.js"
import { initAdminAddCarBtn, initNavAuth } from "./uiChanges.js"
import * as service from "./cars/car.service.js"
import * as Render from "./cars/car.render.js"
import { ensureCachedIsLoaded } from "./discovery/discovery.service.js"
import { buildBrandDropdown } from "./discovery/discovery.render.js"
import { renderFavourites, buildFavouriteCards } from './favourites/favourite.render.js'
import { getCurrentUser, toggleFavourite, getFavouriteCars } from './favourites/favourite.services.js'
import { toggleModal, setLoadingState } from "./addCar/addCar.render.js"
import { addCar , refreshCache } from "./addCar/addCar.service.js"
let filterState = {
    currentBrand: '',
    currentSearch: ''
}
const getFormData = () => {
    const carNameInput = document.getElementById('car-name')
    const carBrandInput = document.getElementById('car-brand')
    const carHorsePowerInput = document.getElementById('car-hp')
    const carTransmissionInput = document.getElementById('car-transmission')
    const carPriceInput = document.getElementById('car-price')
    const carImageInput = document.getElementById('car-image')
    if (!carNameInput || !carBrandInput || !carHorsePowerInput ||
        !carTransmissionInput || !carPriceInput || !carImageInput) {
        console.error('[handleForm] form inputs missing')
        return { success: false, error: 'Form inputs missing' }
    }
    const carInfo = {
        name: carNameInput.value.trim() || 'unknown car',
        brand: carBrandInput.value.trim() || 'unknown brand',
        horsepower: carHorsePowerInput.value.trim() || '0hp',
        transmission: carTransmissionInput.value.trim() || '',
        price: convertNumber(carPriceInput.value)
    }
    const carImage = carImageInput.files[0]

    if (!carImage) {
        return { success: false, error: 'Please select an image' }
    }

    return { success: true, carInfo, carImage }

}
const getAllCars = async () => {
    const carContent = document.querySelector(".car__content")
    if (!carContent) return

    showLoading(carContent)
    const result = await service.loadNextPage()
    if (!result.success) {
        showError(carContent, result.error)
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
        navigateTo(`car.html?id=${viewBtn.dataset.id}`)

    })
}
const getCarDetail = async () => {
    const carContent = document.getElementById('car__content')
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) {
        navigateTo("index.html")
        return
    }
    showLoading(carContent)
    const result = await service.getCar(id)
    if (!result.success) {
        showError(carContent, result.error)
        return
    }
    Render.renderCarDetail(result.data)
    initCart()
}
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
        const result = await ensureCachedIsLoaded()
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
        toggleModal('open', modal)
    })
    closeButton.addEventListener('click', () => toggleModal('close', modal));
    cancelButton.addEventListener('click', () => toggleModal('close', modal));
}
const handleForm = () => {
    const form = document.getElementById('addVehicleForm')
    const modal = document.getElementById('addCarModal')
    if (!form) return
    const feedbackArea = document.getElementById('auth-feedback')
    const addBtn = document.querySelector('.btn-modal-primary')
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const { success, carInfo, carImage, error } = getFormData()
        if (!success) {
            showFeedback(feedbackArea, error, 'error', 'auth-feedback')
            return
        }
        try {
            setLoadingState(true, addBtn)
            const result = await addCar(carInfo, carImage)
            if (!result.success) {
                showFeedback(feedbackArea, result.error, 'error', 'auth-feedback')
                return
            } 

            const cacheResult = refreshCache(result.data)
            Render.renderCars(cacheResult.data)
            showFeedback(feedbackArea, 'Car added successfully', 'success', 'auth-feedback')
            form.reset()
            handleModal('close',modal)
        } finally {
            setLoadingState(false, addBtn)
        }
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

        const authResult = getCurrentUser()
        if (!authResult.success) {
            navigateTo('authentication.html')
            return
        }


        const carId = favBtn.dataset.id
        const result = await toggleFavourite(carId, authResult.data.uid)

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
const showFavourite = async (userId) => {
    const container = document.querySelector('.fav-grid')
    if (!container) {
        console.error('[showFavourite] .fav-grid not found')
        return
    }

    try {
        const favouriteList = await getFavouriteCars(userId)
        if (!favouriteList.success) {
            console.error('[showFavourite] failed to get favourites:', favouriteList.error)
            container.innerHTML = '<p>Failed to load favourites.</p>'
            return
        }

        if (favouriteList.data.length === 0) {
            container.innerHTML = '<p>No favourites yet.</p>'
            return
        }
        const favCards = buildFavouriteCards(favouriteList.data)

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
            navigateTo('authentication.html')
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

