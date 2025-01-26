const mongoose = require('mongoose');

const arbitrageOpportunitySchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    pair: { type: String, required: true },
    binancePrice: { type: Number, required: true },
    solanaDexPrice: { type: Number, required: true },
    profit: { type: Number, required: true },
    fees: { type: Number, required: true },
});

module.exports = mongoose.connection
    .useDb("arbitrage")
    .model('arbitrage_opportunities', arbitrageOpportunitySchema)
