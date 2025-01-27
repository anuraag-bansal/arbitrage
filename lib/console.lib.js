const _ = require("lodash")
const chalk = require("chalk")

const chalkColorEnum = require("../enum/color.enum")
const util = require("util")

function logWithColor(message, type, data = {}) {
    if (_.isNil(message) || _.isNil(type)) {
        throw new Error(`Message or type is empty! message: ${message} , type: ${type}`);
    }

    const logData = {
        date: getCurrentIndianTime(),
        message: message,
        data: data,
    }

    const stringifiedData =
        data instanceof Error ? util.inspect(logData) : util.inspect(logData)
    console.log(chalk[chalkColorEnum[type]](stringifiedData))
}

function getCurrentIndianTime() {
    const date = new Date()
    const localTime = date.getTime()
    const localOffset = date.getTimezoneOffset() * 60000
    const utc = localTime + localOffset
    const indianOffset = 5.5
    const india = utc + 3600000 * indianOffset
    return new Date(india).toLocaleString()
}

module.exports = {
    logWithColor: logWithColor,
    getCurrentIndianTime: getCurrentIndianTime,
}
