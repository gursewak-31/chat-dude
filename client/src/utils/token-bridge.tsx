// These are the placeholder functions that will be replaced by the actual implementation when setTokenHandlers is called
let getToken: () => string | null = () => null; // It returns null by default, indicating that there is no token available.
let updateToken: (token: string | null) => void = () => {}; // It does nothing by default, but it will be replaced by a function that updates the token in the actual implementation.

export function setTokenHandlers(
    getter: () => string | null,
    setter: (token: string | null) => void
) {
    getToken = getter;
    updateToken = setter;
}

export { getToken, updateToken };