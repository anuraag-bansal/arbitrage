require("dotenv").config({path: "../.env"});

const axios = require("axios");
const _ = require("lodash");

const {Connection, PublicKey} = require("@solana/web3.js");
const {LIQUIDITY_STATE_LAYOUT_V4} = require("@raydium-io/raydium-sdk");

const globalLib = require('./global.lib');
const consoleLib = require('./console.lib');

/**
 * Connects to the Solana cluster using the SOLANA_RPC_URL from the environment variables.
 * Sets the connection in a global key for reuse.
 *
 * @throws {Error} If SOLANA_RPC_URL is not provided in the environment variables.
 */
function connectToCluster() {
    try {
        if (_.isEmpty(process.env.SOLANA_RPC_URL)) {
            throw new Error("SOLANA_RPC_URL is required")
        }
        globalLib.setGlobalKey("SOLANA_CONNECTION", new Connection(process.env.SOLANA_RPC_URL, "confirmed"));
        consoleLib.log("Connected to Solana cluster");
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves the Solana connection object from the global key.
 *
 * @returns {Connection} The Solana connection object.
 * @throws {Error} If the connection is not set in the global key.
 */
function getConnection() {
    try {
        return globalLib.getGlobalKey("SOLANA_CONNECTION");
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves pool information for a given pool address.
 *
 * @param {string} poolAddress - The address of the pool to retrieve information for.
 * @returns {Object} The decoded pool information.
 * @throws {Error} If the pool address is not provided or an error occurs while fetching the pool information.
 */
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

/**
 * Retrieves the price of a token pool based on its pool address.
 *
 * @param {string} poolAddress - The address of the pool to retrieve the price for.
 * @returns {Object} An object containing the price of the pool.
 * @throws {Error} If the pool address is not provided or an error occurs while fetching the pool price.
 */
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

/**
 * Retrieves the price of a token from the Jupiter API.
 *
 * @param {string} tokenAddress - The address of the token to retrieve the price for.
 * @returns {number} The price of the token.
 * @throws {Error} If the token address is not provided or an error occurs while fetching the price from Jupiter.
 */
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
