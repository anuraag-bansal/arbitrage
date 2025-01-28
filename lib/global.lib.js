const _ = require('lodash')

/**
 * Set a global key with a value.
 *
 * @param {string} key - The key to set in the global object.
 * @param {*} value - The value to associate with the key.
 * @throws {Error} If the key or value is empty.
 */
function setGlobalKey(key, value) {
    try {
        if (_.isEmpty(key) || _.isEmpty(value)) {
            throw new Error("key and value are required")
        }
        global[key] = value
    } catch (error) {
        throw error
    }
}

/**
 * Get a value from the global object using the key.
 *
 * @param {string} key - The key to retrieve from the global object.
 * @returns {*} The value associated with the key.
 * @throws {Error} If the key is empty.
 */
function getGlobalKey(key) {
    try {
        if (_.isEmpty(key)) {
            throw new Error("key is required")
        }
        return global[key]
    } catch (error) {
        throw error
    }
}

module.exports = {
    setGlobalKey: setGlobalKey,
    getGlobalKey: getGlobalKey,
}
