require("dotenv").config({path: ".env"})
const express = require('express');
const {connectToMongo} = require('./lib/mongo.lib');
const {connectToCluster} = require('./lib/solana.lib');
const apiRoutes = require('./routes/api.route');

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
        app.use('/api', apiRoutes);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Error starting server:', err.message);
        process.exit(1);
    }
})()
