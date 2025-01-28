const router = require("express").Router()

const arbitrageController = require('../controllers/arbitrage.controller');

router.get('/latest/price/:nameOnBinance', arbitrageController.getLivePrice);

router.get('/opportunities', arbitrageController.getArbitrageOpportunities);

router.post('/add/pair', arbitrageController.addTradingPair);

module.exports = router;


