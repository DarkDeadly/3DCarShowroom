import * as Data from '../data.js'

export const isAuthenticated = (authenticated) => {
    if (!authenticated) {
        return {success : false , data : 'index.html'}
    }
    return {success : true , data : null}
}

export const handleLogout = async() => {
    const result = await Data.logoutUser()
    if (result.success) {
        return {success : true , data : 'index.html'}
    }
    return {success : false , data : null}
}

