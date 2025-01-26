const mongoLib = require('../lib/mongo.lib');
const binancePriceModel = require('../models/binance.price.model');
const arbitrageModel = require('../models/arbitrage.model');
const pairModel = require('../models/pair.model');

async function getLivePrice(req, res) {
    try {
        const {pair} = req.params;
        const price = await mongoLib.findOne(binancePriceModel, {pair: pair}, {sort: {timestamp: -1}});
        if (price) {
            res.json({price});
        } else {
            res.status(500).json({error: 'Failed to fetch price'});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function getArbitrageOpportunities(req, res) {
    try {
        const {skip = 0, limit = 5} = req.query;
        const opportunities = await mongoLib.findByQueryWithSkipLimit(arbitrageModel, {}, skip, limit);
        if (opportunities) {
            res.json({opportunities});
        } else {
            res.status(404).json({message: 'No opportunities found'});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function addTradingPair(req, res) {
    try {
        const {name, nameOnBinance, profitThreshold, solanaAmmAddress} = req.body;

        const pair = await mongoLib.findOneAndUpdate(pairModel, {name: name}, {
            name: name,
            nameOnBinance: nameOnBinance,
            solanaAmmAddress: solanaAmmAddress,
            isWebSocketInitialized: false
        }, {upsert: true});

        res.json({message: 'Trading pair added successfully'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

module.exports = {getLivePrice, getArbitrageOpportunities, addTradingPair};
