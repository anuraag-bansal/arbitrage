const mongoose = require('mongoose');

/**
 * @typedef {Object} ArbitrageOpportunityModel
 * @property {string} pair - The name of the pair.
 * @property {number} binancePrice - The price of the pair on Binance.
 * @property {number} raydiumDexPrice - The price of the pair on Raydium DEX.
 * @property {number} profit - The profit from the arbitrage opportunity.
 * @property {number} fees - The fees for the trade
 * @property {Date} timestamp - The timestamp of the opportunity.
 */
const arbitrageOpportunitySchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    pair: { type: String, required: true },
    binancePrice: { type: Number, required: true },
    raydiumDexPrice: { type: Number, required: true },
    profit: { type: Number, required: true },
    fees: { type: Number, required: true },
});

module.exports = mongoose.connection
    .useDb("arbitrage")
    .model('arbitrage_opportunities', arbitrageOpportunitySchema)
