require("dotenv").config({path: ".env"})
const express = require('express');

const {connectToMongo} = require('../lib/mongo.lib');
const {connectToCluster} = require('../lib/solana.lib');

const arbitrageRoutes = require('./routes/arbitrage.route');
const consoleLib = require("../lib/console.lib");

const app = express();
const PORT = 3000;

;(async () => {
    try {
        await connectToMongo();
        await connectToCluster();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true })); // For form data

        app.get("/", (req, res) => {
            res.sendFile(`${__dirname}//views//index.html`)
        })
        app.use('/arbitrage', arbitrageRoutes);

        app.listen(PORT, () => {
            consoleLib.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        process.exit(1);
    }
})()
