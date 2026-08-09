import * as carRepo from "../data/car.repository.js"
import * as cartRepo from "../data/cart.repository.js"
import * as returnContract from "../utils/responseContract.js"

export const addToCart = async(carId , userId) => {
    return await cartRepo.addToCart(carId , userId)
}
export const removeToCart = async (carId , userId) => {
    return await cartRepo.removeToCart(carId , userId)
}
export const isInCart = async (userId , carId) => {
    return await cartRepo.isInCart(userId , carId)
}

/**
 * Lightweight count for badges/UI chrome — reads only the cart subcollection,
 * skipping the per-item car lookups that getCartCars does. Use this anywhere
 * you just need "how many," not the enriched car objects.
 */
export const getCartCount = async (userId) => {
    const result = await cartRepo.getCartItems(userId)
    if (!result.success) return result
    return returnContract.success(result.data.length)
}

export const getCartCars = async (userId) => {
    const cartResult = await cartRepo.getCartItems(userId)
    console.log("Cart items retrieved:", cartResult);

    if (!cartResult.success) return cartResult;
    const cartItems = cartResult.data;
    const carPromises = cartItems.map(item => carRepo.getCarById(item.carId))
    const carResults = await Promise.all(carPromises);
      const enrichedCart = cartItems.map((item, index) => {
        const carResult = carResults[index];
        if (!carResult.success) {
            // Car was deleted from catalog but still in cart — skip or mark as unavailable
            return null;
        }
        const car = carResult.data;
        return {
            ...car,                          // model, price, image, year, etc.
            addedAt: item.addedAt,           // from cart subcollection
            inCart: true                     // useful flag for UI
        };
    }).filter(item => item !== null); // Remove deleted cars
    
    return returnContract.success(enrichedCart);

}