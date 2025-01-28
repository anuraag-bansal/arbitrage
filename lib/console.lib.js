const _ = require("lodash")
const util = require("util")
const {getCurrentIndianTime} = require("../util/date.util")

/**
 * Logs a message with the current timestamp and the provided data.
 * If the data is an instance of Error, it is stringified using util.inspect.
 * @param message - The message to log
 * @param data - The data to log
 */
function log(message, data = {}) {
    if (_.isNil(message)) {
        throw new Error(`Message or type is empty! message: ${message}`);
    }

    const logData = {
        date: getCurrentIndianTime(), message: message, data: data,
    }

    const stringifiedData = data instanceof Error ? util.inspect(logData) : util.inspect(logData)
    console.log(stringifiedData)
}

module.exports = {
    log: log
}
