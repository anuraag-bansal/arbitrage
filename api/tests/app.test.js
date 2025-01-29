const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const express = require('express');
const router = require('../routes/arbitrage.route');
const mongoLib = require('../../lib/mongo.lib');
const { PublicKey } = require('@solana/web3.js');

chai.use(chaiHttp);

// Create a test app
const app = express();
app.use(express.json());
app.use('/arbitrage', router);

describe('Arbitrage Controller Tests', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('GET /latest/price/:nameOnBinance', () => {
        it('should return the latest price for a valid Binance pair', async () => {
            sinon.stub(mongoLib, 'findOneByQueryWithSelectWithSort').resolves({ price: 100 });
            const res = await chai.request(app).get('/arbitrage/latest/price/solusdc');
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({ price: 100 });
        });

        it('should return 404 if price is not found', async () => {
            sinon.stub(mongoLib, 'findOneByQueryWithSelectWithSort').resolves(null);
            const res = await chai.request(app).get('/arbitrage/latest/price/solusdc');
            expect(res).to.have.status(404);
            expect(res.body).to.deep.equal({ error: 'Failed to fetch price. Give binance pair name for price' });
        });
    });

    describe('GET /opportunities', () => {
        it('should return arbitrage opportunities', async () => {
            sinon.stub(mongoLib, 'findByQueryWithSkipLimit').resolves([{ id: 1, profit: 10 }, { id: 2, profit: 15 }]);
            const res = await chai.request(app).get('/arbitrage/opportunities?skip=0&limit=2');
            expect(res).to.have.status(200);
            expect(res.body.opportunities).to.be.an('array').that.has.length(2);
        });

        it('should return 404 if no opportunities are found', async () => {
            sinon.stub(mongoLib, 'findByQueryWithSkipLimit').resolves(null);
            const res = await chai.request(app).get('/arbitrage/opportunities?skip=0&limit=2');
            expect(res).to.have.status(404);
            expect(res.body).to.deep.equal({ message: 'No opportunities found' });
        });
    });

    describe('POST /add/pair', () => {
        it('should add a new trading pair successfully', async () => {
            sinon.stub(mongoLib, 'findOneAndUpdate').resolves({ _doc: { name: 'SOL/USDC' } });
            sinon.stub(PublicKey, 'isOnCurve').returns(true); // Mocking valid address check

            const res = await chai.request(app)
                .post('/arbitrage/add/pair')
                .send({
                    name: 'SOL/USDC',
                    nameOnBinance: 'solusdc',
                    solanaAmmAddress: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
                    minProfit: 5
                });
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({ message: 'Trading pair added successfully', pair: 'SOL/USDC' });
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await chai.request(app)
                .post('/arbitrage/add/pair')
                .send({});
            expect(res).to.have.status(400);
            expect(res.body.error).to.include('are required');
        });

        it('should return 400 for an invalid Solana AMM address', async () => {
            sinon.stub(PublicKey, 'isOnCurve').returns(false); // Mocking invalid address check
            const res = await chai.request(app)
                .post('/arbitrage/add/pair')
                .send({
                    name: 'SOL/USDC',
                    nameOnBinance: 'SOLUSDC',
                    solanaAmmAddress: 'abcd',
                    minProfit: 5
                });
            expect(res).to.have.status(400);
            expect(res.body).to.deep.equal({ error: 'Invalid Solana AMM address' });
        });
    });
});
