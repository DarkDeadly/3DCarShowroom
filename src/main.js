import * as Data from "./data.js"
import { createElements , createImage } from "./utils.js"
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
            const carImage = createImage(car.image , "carImage" , ["product-card__img"])
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
            const price = createElements("span", ["product-card__price"], Number(car.price).toLocaleString() + " DT"
                + " DT ")
            const viewButton = createElements("button", ["product-card__btn-cart"], "View")
          
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

getAllCars()