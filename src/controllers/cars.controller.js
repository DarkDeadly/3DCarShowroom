import * as carServices from "../services/car.service.js"
import * as carRenders from "../renders/car.renders.js"
import { navigateTo } from "../utils/uiBuilder.js"

let nextCursor = null;
let hasMore = false;


const loadInitialCars = async (catalog, carGrid) => {
    const result = await carServices.getCars({ requestedLimit: 3 })
    if (!result.success) {
        carRenders.carEmptyState(catalog);
        return;
    }
    nextCursor = result.meta.nextCursor
    hasMore = result.meta.hasMore
    if (result.data.length === 0) {
        carRenders.carEmptyState(catalog)
        return
    }
    return carRenders.renderCars(result.data, carGrid)
}
const initShowMore = (gridCard) => {
    const btn = document.querySelector('.btn-load-more')
    if (!btn) return
    btn.addEventListener('click', async () => {
        if (!hasMore) {
            btn.style.display = "none";
            return
        }
        const result = await carServices.getCars({
            requestedLimit: 3,
            cursor: nextCursor,
        })
        if (!result.success) {
            return
        }
        nextCursor = result.meta.nextCursor
        hasMore = result.meta.hasMore
        carRenders.appendCars(result.data, gridCard)
        if (!hasMore) {
            btn.style.display = "none";
        }



    })
}

const initViewDetailNavigation = () => {
    const container = document.querySelector('.card-grid')
    if (!container) return
    container.addEventListener('click', async (e) => {
        const viewBtn = e.target.closest('.btn-details')
        if (!viewBtn || !viewBtn.dataset.id) return
        navigateTo(`car.html?id=${viewBtn.dataset.id}`)
    })
}



const carsInit = async () => {
    const carGrid = document.querySelector('.card-grid')
    const catalog = document.querySelector('.catalog')
    if (!carGrid || !catalog ) return
    await loadInitialCars(catalog, carGrid)
    initShowMore(carGrid)
}
const mainInit = () => {
    carsInit()
    initViewDetailNavigation()
}


mainInit()