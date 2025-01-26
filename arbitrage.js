const express = require('express');
const {connectToMongo} = require('./lib/mongo.lib');
const apiRoutes = require('./routes/api.route');
//const {monitorPrices} = require('./services/arbitrage.service');

const app = express();
const PORT = 3000;


;(async () => {
    try {
        await connectToMongo();
        app.use(express.json());
        app.use('/api', apiRoutes);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Error starting server:', err.message);
    }
})()
