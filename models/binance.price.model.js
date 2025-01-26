const mongoose = require('mongoose');

const binancePriceSchema = new mongoose.Schema({
    timestamp: {type: Date, default: Date.now},
    pair: {type: String, required: true},
    price: {type: Number, required: true},
});

//timstamp decreasong order index with unique pair
binancePriceSchema.index({timestamp: -1, pair: 1}, {unique: true});

module.exports = mongoose.connection
.useDb("arbitrage")
.model('binance_price', binancePriceSchema)
