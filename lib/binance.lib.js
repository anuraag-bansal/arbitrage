const _ = require('lodash');
const WebSocket = require('ws');
const mongoLib = require('./mongo.lib');
const binancePriceModel = require('../models/binance.price.model');
const arbitrageModel = require('../models/arbitrage.model');
const solanaLib = require('./solana.lib');
const consoleLib = require('./console.lib');
const {TRADING_AMOUNT, BINANCE_SPOT_FEE, RAYDIUM_SWAP_FEE} = require('../config');


async function createWebSocketConnection(pair) {
    try {
        if (_.isNil(pair)) {
            throw new Error('Pair is empty');
        }
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.nameOnBinance}@trade`);
        ws.onopen = () => console.log('WebSocket connection established');
        let lastProcessedTimestamp = 0;

        ws.onmessage = async (event) => {
            const response = JSON.parse(event.data);
            const binanceLatestPrice = parseFloat(response.p);
            const binanceEventTimestamp = response.T;

            if (binanceEventTimestamp - lastProcessedTimestamp >= 1000) {
                lastProcessedTimestamp = binanceEventTimestamp;

                let latestPriceFromRaydium = await solanaLib.getPoolPrice(pair.solanaAmmAddress)
                latestPriceFromRaydium = latestPriceFromRaydium.price

                const profit = await calculateArbitrageProfit(binanceLatestPrice, latestPriceFromRaydium);

                if (profit - pair.minProfit > 0) {
                    await mongoLib.findOneAndUpdate(arbitrageModel, {
                        pair: pair.name,
                        timestamp: binanceEventTimestamp
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
                    pair: pair.nameOnBinance,
                    timestamp: binanceEventTimestamp
                }, {
                    pair: pair.nameOnBinance,
                    price: binanceLatestPrice,
                    timestamp: binanceEventTimestamp
                }, {upsert: true});
                consoleLib.logWithColor(`Price Update`, "INFO", {
                    pair: pair.name,
                    binancePrice: binanceLatestPrice + "usdc",
                    raydiumDexPrice: latestPriceFromRaydium + "usdc",
                    profit: profit + "usdc",
                    timestamp: binanceEventTimestamp,
                    fees: TRADING_AMOUNT * (BINANCE_SPOT_FEE + RAYDIUM_SWAP_FEE) + "usdc",
                })
            }
        };

        ws.on('close', () => {
            console.log('WebSocket connection closed. Reconnecting...');
            setTimeout(() => createWebSocketConnection(pair), 5000);
        });
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

async function calculateArbitrageProfit(binancePrice, raydiumDexPrice) {
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
        console.log(error.message);
        throw error;
    }
}

module.exports = {createWebSocketConnection};
