


export const authSuccessMessage = (message, mode) => {
    const signInMessageContainer = document.querySelector(".si-success");
    const registerMessageContainer = document.querySelector(".ra-success");
    if (mode === "register") {
        const messageContent = registerMessageContainer.querySelector("span");
        messageContent.textContent = message;
        registerMessageContainer.removeAttribute("hidden");
    } else {
        const messageContent = signInMessageContainer.querySelector("span");
        messageContent.textContent = message;
        signInMessageContainer.removeAttribute("hidden");

    }


};


export const authErrorMessage = (message, mode) => {
    const signInMessageContainer = document.querySelector(".si-error");
    const registerMessageContainer = document.querySelector(".ra-error");
    if (mode === "register") {
        const messageContent = registerMessageContainer.querySelector("span");
        messageContent.textContent = message;
        registerMessageContainer.removeAttribute("hidden");
    } else {
        const messageContent = signInMessageContainer.querySelector("span");
        messageContent.textContent = message;
        signInMessageContainer.removeAttribute("hidden");

    }

}

export const setLoadingState = (isLoading, mode, element) => {
    element.disabled = isLoading;
    element.textContent = mode === "register"
        ? (isLoading ? 'Creating Account...' : 'Register')
        : (isLoading ? 'Verifying...' : 'Sign In');
};

export const clearMessages = (mode) => {
    const signInMessageContainer = document.querySelector(".si-success");
    const registerMessageContainer = document.querySelector(".ra-success");
    const signInErrorContainer = document.querySelector(".si-error");
    const registerErrorContainer = document.querySelector(".ra-error");

    if (mode === "register") {
        registerMessageContainer?.setAttribute("hidden", "");
        registerErrorContainer?.setAttribute("hidden", "");
    } else {
        signInMessageContainer?.setAttribute("hidden", "");
        signInErrorContainer?.setAttribute("hidden", "");

    }
}