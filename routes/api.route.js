const router = require("express").Router()

const apiController = require('../controllers/api.controller');

// Fetch live prices for a pair
router.get('/prices/:pair', apiController.getLivePrice);

// Retrieve arbitrage opportunities
router.get('/opportunities', apiController.getArbitrageOpportunities);

// Add a new trading pair
router.post('/add/pair', apiController.addTradingPair);

module.exports = router;


