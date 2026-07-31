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
export const getCartCars = async (userId) => {
    const cartResult = await cartRepo.getCartItems(userId)
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