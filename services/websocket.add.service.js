const mongoLib = require('../lib/mongo.lib');
const binanceLib = require('../lib/binance.lib');
const pairModel = require('../models/pair.model');

;(async () => {

    await mongoLib.connectToMongo();
    while (true) {
        const pairs = await mongoLib.findByQuery(pairModel, {isWebSocketInitialized: false});
        if (pairs.length === 0) {
            console.log('No new trading pairs to initialize WebSocket');
            await new Promise(resolve => setTimeout(resolve, 5000));

        }

        for (const pair of pairs) {
            await binanceLib.createWebSocketConnection(pair);
            await mongoLib.findOneAndUpdate(pairModel, {nameOnBinance: pair.nameOnBinance}, {isWebSocketInitialized: true});

            console.log(`WebSocket initialized for ${pair.name}`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
})()
