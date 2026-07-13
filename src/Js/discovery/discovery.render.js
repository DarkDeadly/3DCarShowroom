const buildBrandDropdown = (brands) => {
    const selector = document.getElementById('brandSortSelect')
    if (!selector) return 
    selector.innerHTML = '<option value="">All brands</option>'
    brands.sort().forEach(brand => {
        const option = document.createElement('option')
        option.value = option.textContent = brand
        selector.appendChild(option)
    })
}


export {buildBrandDropdown}