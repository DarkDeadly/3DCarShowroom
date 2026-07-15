import * as Data from '../data.js'


const authenticate = async({mode , ...credentials}) => {
     return mode === 'login'
        ? await Data.loginWithEmailAndPassword(credentials)
        : await Data.emailPasswordAuthentication(credentials)
}

export {authenticate}