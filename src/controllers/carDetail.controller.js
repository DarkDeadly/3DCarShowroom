
import * as carDetailRender from "../renders/carDetail.renders.js"
import * as carServices from "../services/car.service.js"


const carDetailInit = async () => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) return
    const identitySection = document.querySelector('.identity-section')
    const ctaSection = document.querySelector('.cta-section')
    const imageWrapper = document.querySelector('.gallery-section')
    if (!identitySection || !ctaSection || !imageWrapper) return;
    const result = await carServices.getCarById(id)
    if (!result.success) return
    identitySection.innerHTML = "";
    ctaSection.innerHTML = "";
    imageWrapper.innerHTML = "";
    imageWrapper.append(
        carDetailRender.buildImageShowcase(result.data)
    )
    identitySection.append(
        carDetailRender.buildIdentitySection(result.data)
    )
    ctaSection.append(
        carDetailRender.buildCTASection(result.data)
    )
}


carDetailInit()