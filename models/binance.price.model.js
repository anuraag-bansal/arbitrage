const mongoose = require('mongoose');

/**
 * @typedef {Object} BinancePriceModel
 * @property {number} price - The price of the pair.
 * @property {string} pair - The name of the pair.
 * @property {Date} timestamp - The timestamp of the price.
 */
const binancePriceSchema = new mongoose.Schema({
    timestamp: {type: Date, default: Date.now},
    pair: {type: String, required: true},
    price: {type: Number, required: true},
});

//timestamp decreasing order index with unique pair
binancePriceSchema.index({timestamp: -1, pair: 1}, {unique: true});

module.exports = mongoose.connection
.useDb("arbitrage")
.model('binance_price', binancePriceSchema)
