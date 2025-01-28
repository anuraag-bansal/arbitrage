const mongoose = require('mongoose');

/**
 * @typedef {Object} PairModel
 * @property {string} name - The name of the pair.
 * @property {string} nameOnBinance - The name of pair on Binance.
 * @property {string} solanaAmmAddress - The address of the AMM on Solana.
 * @property {boolean} isWebSocketInitialized - The value of the websocket(initialized or not)(default is false)
 * @property {number} minProfit - The minimum profit to count as an arbitrage opportunity.
 */
const pairSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    nameOnBinance: {type: String, required: true},
    solanaAmmAddress: {type: String, required: true},
    isWebSocketInitialized: {type: Boolean, default: false},
    minProfit: {type: Number, required: true}
});

module.exports = mongoose.connection
    .useDb("arbitrage")
    .model('pair', pairSchema)

