const _ = require('lodash');
const WebSocket = require('ws');
const mongoLib = require('./mongo.lib');
const binancePriceModel = require('../models/binance.price.model');
const arbitrageModel = require('../models/arbitrage.model');
const solanaLib = require('./solana.lib');
const TRADING_AMOUNT = 10000;
const BINANCE_SPOT_FEE = 0.001;
const RAYDIUM_SWAP_FEE = 0.0025;

async function createWebSocketConnection(pair) {
    try {
        if (_.isEmpty(pair)) {
            console.log('Pair is empty');
            throw new Error('Pair is empty');
        }
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.nameOnBinance}@trade`);
        ws.onopen = () => console.log('WebSocket connection established');

        ws.onmessage = async (event) => {
            console.log('Received message from WebSocket');
            const response = JSON.parse(event.data);
            const binanceLatestPrice = parseFloat(response.p);
            const timestamp = response.T;

            //fetch solana pair prices
            //const raydiumLatestPrice = await solanaLib.getPoolPrice(pair.solanaAmmAddress);
            const jupiterLatestPrice = await solanaLib.getPriceFromJupiter(pair.tokenAddress);

            //calculate arbitrage
            const profit = await calculateArbitrageProfit(binanceLatestPrice, jupiterLatestPrice);

            console.log(`Arbitrage profit: ${profit}`);
            if (profit - pair.minProfit > 0) {
                await mongoLib.findOneAndUpdate(arbitrageModel, {pair: pair.name, timestamp: timestamp}, {
                    pair: pair.name,
                    binancePrice: binanceLatestPrice,
                    //raydiumPrice: raydiumLatestPrice,
                    solanaDexPrice: jupiterLatestPrice,
                    profit: profit,
                    timestamp: timestamp,
                    fees: TRADING_AMOUNT * (BINANCE_SPOT_FEE + RAYDIUM_SWAP_FEE)
                }, {upsert: true})
            }

            await mongoLib.findOneAndUpdate(binancePriceModel, {pair: pair.nameOnBinance, timestamp: timestamp}, {
                pair: pair.nameOnBinance, price: binanceLatestPrice, timestamp: timestamp
            }, {upsert: true});
            console.log('Price updated in MongoDB');
        }

        ws.on('close', () => {
            console.log('WebSocket connection closed Reconnecting...');
            setTimeout(() => createWebSocketConnection(pair), 5000);
        });
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

async function calculateArbitrageProfit(binancePrice, raydiumPrice) {
    try {
        if (_.isEmpty(binancePrice) || _.isEmpty(raydiumPrice)) {
            console.log('Price is empty');
            throw new Error('Price is empty');
        }
        let profit = 0;

        if (binancePrice < raydiumPrice) {
            // Buy from Binance, Sell on Solana
            const buyCost = TRADING_AMOUNT; // Amount to buy in USDC
            const binanceFee = buyCost * BINANCE_SPOT_FEE;
            const sellPrice = TRADING_AMOUNT / binancePrice * raydiumPrice;
            const raydiumFee = sellPrice * RAYDIUM_SWAP_FEE;

            profit = sellPrice - buyCost - binanceFee - raydiumFee;
        } else if (raydiumPrice < binancePrice) {
            // Buy from Solana, Sell on Binance
            const buyCost = TRADING_AMOUNT; // Amount to buy in USDC
            const raydiumFee = buyCost * RAYDIUM_SWAP_FEE;
            const sellPrice = TRADING_AMOUNT / raydiumPrice * binancePrice;
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

//weth token address = 7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs
//wbtc token address = 3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh

//curl -X 'GET' 'https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112&showExtraInfo=true'
