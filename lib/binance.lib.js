const _ = require('lodash');
const WebSocket = require('ws');
const mongoLib = require('./mongo.lib');
const binancePriceModel = require('../models/binance.price.model');
const arbitrageModel = require('../models/arbitrage.model');
const solanaLib = require('./solana.lib');
const consoleLib = require('./console.lib');
const {TRADING_AMOUNT, BINANCE_SPOT_FEE, RAYDIUM_SWAP_FEE} = require('../config');

/**
 * Creates and manages a WebSocket connection to Binance for a specific trading pair.
 * Handles real-time price updates and calculates arbitrage opportunities between Binance and Raydium.
 *
 * @async
 * @function createWebSocketConnection
 * @param {Object} pair - The trading pair configuration.
 * @param {string} pair.name - The name of the trading pair.
 * @param {string} pair.nameOnBinance - The trading pair name on Binance.
 * @param {string} pair.solanaAmmAddress - The Solana AMM address for the trading pair.
 * @param {number} pair.minProfit - The minimum profit threshold to log arbitrage data.
 * @throws {Error} If the trading pair is not provided or other errors occur.
 */
async function createWebSocketConnection(pair) {
    try {
        if (_.isNil(pair)) {
            throw new Error('Pair is empty');
        }
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.nameOnBinance}@trade`);
        ws.onopen = () => consoleLib.log('WebSocket connection established');
        let lastProcessedTimestamp = 0;

        ws.onmessage = async (event) => {
            const response = JSON.parse(event.data);
            const binanceLatestPrice = parseFloat(response.p);
            const binanceEventTimestamp = response.T;

            if (binanceEventTimestamp - lastProcessedTimestamp >= 1000) {
                lastProcessedTimestamp = binanceEventTimestamp;

                let latestPriceFromRaydium = await solanaLib.getPoolPrice(pair.solanaAmmAddress)
                latestPriceFromRaydium = latestPriceFromRaydium.price

                const profit = calculateArbitrageProfit(binanceLatestPrice, latestPriceFromRaydium);

                if (profit - pair.minProfit > 0) {
                    await mongoLib.findOneAndUpdate(arbitrageModel, {
                        pair: pair.name, timestamp: binanceEventTimestamp
                    }, {
                        pair: pair.name,
                        binancePrice: binanceLatestPrice,
                        raydiumDexPrice: latestPriceFromRaydium,
                        profit: profit,
                        timestamp: binanceEventTimestamp,
                        fees: TRADING_AMOUNT * (BINANCE_SPOT_FEE + RAYDIUM_SWAP_FEE),
                    }, {upsert: true});
                }

                //Update the Binance price in the database
                await mongoLib.findOneAndUpdate(binancePriceModel, {
                    pair: pair.nameOnBinance, timestamp: binanceEventTimestamp
                }, {
                    pair: pair.nameOnBinance, price: binanceLatestPrice, timestamp: binanceEventTimestamp
                }, {upsert: true});
                consoleLib.log(`Price Update`, {
                    pair: pair.name,
                    binancePrice: binanceLatestPrice + "usdc",
                    raydiumDexPrice: latestPriceFromRaydium + "usdc",
                    profit: profit + "usdc",
                    timestamp: binanceEventTimestamp,
                    fees: TRADING_AMOUNT * (BINANCE_SPOT_FEE + RAYDIUM_SWAP_FEE) + "usdc",
                    arbitrageDetected: profit - pair.minProfit > 0
                })
            }
        };

        ws.on('close', () => {
            consoleLib.log('WebSocket connection closed. Reconnecting...');
            setTimeout(() => createWebSocketConnection(pair), 5000);
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Calculates the potential arbitrage profit between Binance and Raydium.
 *
 * @async
 * @function calculateArbitrageProfit
 * @param {number} binancePrice - The latest price from Binance.
 * @param {number} raydiumDexPrice - The latest price from Raydium.
 * @returns {number} The calculated arbitrage profit.
 * @throws {Error} If prices are not provided or other errors occur.
 */
function calculateArbitrageProfit(binancePrice, raydiumDexPrice) {
    try {
        if (_.isNil(binancePrice) || _.isNil(raydiumDexPrice)) {
            throw new Error('Price is empty');
        }
        let profit = 0;

        if (binancePrice < raydiumDexPrice) {
            const buyCost = TRADING_AMOUNT; // Amount to buy in USDC
            const binanceFee = buyCost * BINANCE_SPOT_FEE;
            const sellPrice = (TRADING_AMOUNT / binancePrice) * raydiumDexPrice;
            const raydiumFee = sellPrice * RAYDIUM_SWAP_FEE;

            profit = sellPrice - buyCost - binanceFee - raydiumFee;
        } else if (raydiumDexPrice < binancePrice) {
            const buyCost = TRADING_AMOUNT; // Amount to buy in USDC
            const raydiumFee = buyCost * RAYDIUM_SWAP_FEE;
            const sellPrice = (TRADING_AMOUNT / raydiumDexPrice) * binancePrice;
            const binanceFee = sellPrice * BINANCE_SPOT_FEE;

            profit = sellPrice - buyCost - raydiumFee - binanceFee;
        }

        return profit;
    } catch (error) {
        throw error;
    }
}

module.exports = {createWebSocketConnection};
