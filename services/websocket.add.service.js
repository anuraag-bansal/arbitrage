const mongoLib = require('../lib/mongo.lib');
const binanceLib = require('../lib/binance.lib');
const solanaLib = require('../lib/solana.lib');
const pairModel = require('../models/pair.model');
const consoleLib = require("../lib/console.lib");

/**
 * Initializes WebSocket connections for trading pairs and updates their status in the database.
 *
 * - Connects to the Solana cluster and MongoDB.
 * - Continuously checks for trading pairs with uninitialized WebSocket connections.
 * - Initializes WebSocket connections for each uninitialized trading pair.
 * - Updates the database to mark the WebSocket as initialized.
 * - Waits for a specified interval before repeating the process.
 */
;(async () => {
    try {
        await solanaLib.connectToCluster()
        await mongoLib.connectToMongo();
        while (true) {
            const pairs = await mongoLib.findByQuery(pairModel, {isWebSocketInitialized: false});
            if (pairs.length === 0) {
                consoleLib.log('No new trading pairs to initialize WebSocket');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            for (const pair of pairs) {
                await binanceLib.createWebSocketConnection(pair);
                await mongoLib.findOneAndUpdate(pairModel, {nameOnBinance: pair.nameOnBinance}, {isWebSocketInitialized: true});
                consoleLib.log(`WebSocket initialized for ${pair.name}`);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (err) {
        console.error('Error initializing WebSocket:', err.message);
        process.exit(1);
    }
})()
