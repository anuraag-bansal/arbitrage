const _ = require('lodash')

function setGlobalKey(key, value) {
    try {
        if(_.isEmpty(key) || _.isEmpty(value)) {
            throw new Error("key and value are required")
        }
        global[key] = value
    } catch (error) {
        throw error
    }
}

function getGlobalKey(key) {
    try {
        if(_.isEmpty(key)) {
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
