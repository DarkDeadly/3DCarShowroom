

const toggleModal = (mode , element) => {
     mode === "close" ? element.close() : element.showModal()
}
const setLoadingState = (isLoading , element ) => {
        element.disabled = isLoading
        isLoading ? element.textContent = 'Uploading...' : element.textContent = 'Publish Vehicle Listing'

}



export {toggleModal , setLoadingState}