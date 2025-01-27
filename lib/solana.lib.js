require("dotenv").config({path: "../.env"});
const axios = require("axios");
const _ = require("lodash");
const {
    Connection, PublicKey
} = require("@solana/web3.js");
const {
    LIQUIDITY_STATE_LAYOUT_V4,
} = require("@raydium-io/raydium-sdk");

const globalLib = require('./global.lib');
const consoleLib = require('./console.lib');

function connectToCluster() {
    try {
        if (_.isEmpty(process.env.QUICKNODE_URL)) {
            throw new Error("QUICKNODE_URL is required")
        }
        globalLib.setGlobalKey("SOLANA_CONNECTION", new Connection(process.env.QUICKNODE_URL, "confirmed"));
        consoleLib.logWithColor("Connected to Solana cluster", "INFO");
    } catch (error) {
        throw error;
    }
}

function getConnection() {
    try {
        return globalLib.getGlobalKey("SOLANA_CONNECTION");
    } catch (error) {
        throw error;
    }
}

async function getPoolInfo(poolAddress) {
    try {
        if (_.isEmpty(poolAddress)) {
            throw new Error(`Missing args! poolAddress: ${poolAddress}`);
        }

        const connection = await getConnection();
        const poolInfo = await connection.getAccountInfo(new PublicKey(poolAddress));
        return LIQUIDITY_STATE_LAYOUT_V4.decode(poolInfo.data);
    } catch (error) {
        throw error;
    }
}

async function getPoolPrice(poolAddress) {
    try {
        if (_.isEmpty(poolAddress)) {
            throw new Error(`Missing args! poolAddress: ${poolAddress}`);
        }

        const poolInfo = await getPoolInfo(poolAddress);
        const connection = await getConnection();

        const baseTokenAmount = await connection.getTokenAccountBalance(poolInfo.baseVault);
        const quoteTokenAmount = await connection.getTokenAccountBalance(poolInfo.quoteVault);
        const price = (quoteTokenAmount.value.amount / 10 ** quoteTokenAmount.value.decimals) / (baseTokenAmount.value.amount / 10 ** baseTokenAmount.value.decimals);

        return {
            price: price,
        }
    } catch (error) {
        throw error;
    }
}

async function getPriceFromJupiter(tokenAddress) {
    try {
        if (_.isEmpty(tokenAddress)) {
            throw new Error(`Missing args! tokenAddress: ${tokenAddress}`);
        }
        const url = `https://api.jup.ag/price/v2?ids=${tokenAddress}`;

        const response = await axios.get(url);
        return parseFloat(response.data.data[tokenAddress].price);

    } catch (error) {
        throw error;
    }
}

module.exports = {
    connectToCluster: connectToCluster,
    getConnection: getConnection,
    getPoolInfo: getPoolInfo,
    getPoolPrice: getPoolPrice,
    getPriceFromJupiter: getPriceFromJupiter,
}
