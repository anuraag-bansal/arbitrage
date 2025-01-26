const mongoLib = require('./mongo.lib');
const binancePriceModel = require('../models/binance.price.model');

async function getLatestPriceFromBinance(pair) {
    try {
        return await mongoLib.findOne(binancePriceModel, {pair: pair}, {sort: {timestamp: -1}});
    } catch (err) {
        console.error('Error fetching Binance price:', err.message);
        return null;
    }
}

module.exports = {getLatestPriceFromBinance};
