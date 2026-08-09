export const carSchema = {
    brand: { type: "string", required: true },
    model: { type: "string", required: true },
    year: { type: "number", required: true },
    price: { type: "number", required: true },
    category: { type: "string", required: true },
    color: { type: "string", required: true },
    description: { type: "string", required: true },
    image: { type: "string", required: true },

    model3D: { type: "string", required: false },
    hasModel: { type: "boolean" , required: false} , 
    searchName : { type: "string", required: false },
    availability: { type: "boolean", required: true },
};