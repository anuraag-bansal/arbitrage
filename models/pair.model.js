const mongoose = require('mongoose');

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

//amm address of wbtc/usdc = 4nfbdt7dexatvarzfr3wqalgjnogmjqe9vf2h6c1wxbr
//amm address of weth/usdc = 4yrhms7ekgtbgjg77zj33tswrraqhscxdtuszqusughb
//amm address of wsol/usdc = 58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2

