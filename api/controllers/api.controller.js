const mongoLib = require('../../lib/mongo.lib');
const binancePriceModel = require('../../models/binance.price.model');
const arbitrageModel = require('../../models/arbitrage.model');
const pairModel = require('../../models/pair.model');

async function getLivePrice(req, res) {
    try {
        const {nameOnBinance} = req.params;
        const price = await mongoLib.findOneByQueryWithSelectWithSort(binancePriceModel, {pair: nameOnBinance}, {
            price: 1, _id: 0
        }, {timestamp: -1});
        if (price) {
            res.json({price: price.price});
        } else {
            res.status(404).json({error: 'Failed to fetch price. Give binance pair name for price'});
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
        const {
            name, nameOnBinance, solanaAmmAddress, minProfit
        } = req.body;

       const updatedDoc =  await mongoLib.findOneAndUpdate(pairModel, {name: name}, {
            name: name,
            nameOnBinance: nameOnBinance,
            solanaAmmAddress: solanaAmmAddress,
            minProfit: minProfit,
            isWebSocketInitialized: false
        }, {upsert: true,returnDocument: 'after'});

        res.json({
            message: 'Trading pair added successfully', pair: updatedDoc._doc.name
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

module.exports = {getLivePrice, getArbitrageOpportunities, addTradingPair};
