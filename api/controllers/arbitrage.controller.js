const _ = require('lodash');
const {PublicKey} = require('@solana/web3.js');
const mongoLib = require('../../lib/mongo.lib');

const arbitrageModel = require('../../models/arbitrage.model');
const binancePriceModel = require('../../models/binance.price.model');

const pairModel = require('../../models/pair.model');

/**
 * Get live price for a given Binance trading pair
 * @param {Object} req - The request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.nameOnBinance - Binance pair name (e.g., solusdc)
 * @param {Object} res - The response object
 * @returns {Promise<{ price: number } | { error: string }>}
 */
async function getLivePrice(req, res) {
    try {
        const {nameOnBinance} = req.params;
        if (_.isEmpty(nameOnBinance)) {
            res.status(400).json({error: 'Binance pair name is required'});
        }
        const price = await mongoLib.findOneByQueryWithSelectWithSort(binancePriceModel, {pair: nameOnBinance}, {
            price: 1, _id: 0
        }, {timestamp: -1});
        if (price) {
            return res.json({price: price.price});
        } else {
            return res.status(404).json({error: 'Failed to fetch price. Give binance pair name for price'});
        }
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}

/**
 * Get arbitrage opportunities
 * @param req - The request object
 * @param req.query - The query parameters
 * @param {number} req.query.skip - The number of documents to skip
 * @param {number} req.query.limit - The maximum number of documents to return
 * @param res - The response object
 * @returns {Promise<{ opportunities: Array<Object> } | { error: string } | { message: string }>}
 */
async function getArbitrageOpportunities(req, res) {
    try {
        const {skip = 0, limit = 5} = req.query;
        if (skip < 0 || limit < 0) {
            return res.status(400).json({error: 'Skip and limit should be greater than 0'});
        }
        const opportunities = await mongoLib.findByQueryWithSkipLimit(arbitrageModel, {}, skip, limit);
        if (opportunities) {
            return res.json({opportunities});
        } else {
            return res.status(404).json({message: 'No opportunities found'});
        }
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}

/**
 * Add trading pair
 * @param req - The request object
 * @param req.body - The request body
 * @param {string} req.body.name - The name of the trading pair
 * @param {string} req.body.nameOnBinance - The name of the trading pair on Binance
 * @param {string} req.body.solanaAmmAddress - The address of the AMM on Solana
 * @param {number} req.body.minProfit - The minimum profit to count as an arbitrage opportunity
 * @param res - The response object
 * @returns {Promise<{ message: string, pair: string } | { error: string }>}
 */
async function addTradingPair(req, res) {
    try {
        const {
            name, nameOnBinance, solanaAmmAddress, minProfit
        } = req.body;

        if (_.isEmpty(name) || _.isEmpty(nameOnBinance) || _.isEmpty(solanaAmmAddress) || _.isNil(minProfit)) {
            return res.status(400).json({error: `name: ${name}, nameOnBinance: ${nameOnBinance}, solanaAmmAddress: ${solanaAmmAddress}, minProfit: ${minProfit} are required`});
        }
        if (!isValidSolanaAddress(solanaAmmAddress)) {
            return res.status(400).json({error: 'Invalid Solana AMM address'});
        }

        const updatedDoc = await mongoLib.findOneAndUpdate(pairModel, {name: name}, {
            name: name,
            nameOnBinance: nameOnBinance,
            solanaAmmAddress: solanaAmmAddress,
            minProfit: minProfit,
            isWebSocketInitialized: false
        }, {upsert: true, returnDocument: 'after'});

        return res.json({
            message: 'Trading pair added successfully', pair: updatedDoc._doc.name
        });
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}

/**
 * Validates a Solana public address.
 * @param {string} address - The Solana AMM address to validate.
 * @returns {boolean} - Returns true if the address is valid, otherwise false.
 */
function isValidSolanaAddress(address) {
    try {
        new PublicKey(address); // Will throw an error if the address is invalid.
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {getLivePrice, getArbitrageOpportunities, addTradingPair};
