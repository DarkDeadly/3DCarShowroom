
import {createElements, createImage} from '../utils.js'




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

const buildFavouriteCards = (carList) => {
     const favCards = carList
            .filter((result) => result.success)
            .map((result) => renderFavourites(result.data))
            return favCards
}


export {renderFavourites , buildFavouriteCards}