/**
 * Get the current Indian time
 * @returns {string}
 */
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
    getCurrentIndianTime: getCurrentIndianTime,
}
