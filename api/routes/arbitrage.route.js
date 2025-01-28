const router = require("express").Router()

const apiController = require('../controllers/api.controller');

router.get('/prices/:nameOnBinance', apiController.getLivePrice);

router.get('/opportunities', apiController.getArbitrageOpportunities);

router.post('/add/pair', apiController.addTradingPair);

module.exports = router;


