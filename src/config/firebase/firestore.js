import app from "./firebase.config.js"
import {getFirestore} from "firebase/firestore"


export const db  = getFirestore(app)
