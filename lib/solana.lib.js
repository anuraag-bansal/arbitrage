require("dotenv").config({path: "../.env"});
//const bs58 = require("bs58");
const _ = require("lodash");
// const {createAssociatedTokenAccountInstruction} = require("@solana/spl-token")
const {
    Keypair, Connection, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction
} = require("@solana/web3.js");
//const {struct, u8, nu64} = require("buffer-layout");
const {
    LIQUIDITY_STATE_LAYOUT_V4,
    MARKET_STATE_LAYOUT_V3,
    TOKEN_PROGRAM_ID,
    Liquidity,
    Market,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    SPL_ACCOUNT_LAYOUT
} = require("@raydium-io/raydium-sdk");
const priceLib = require("./price.lib");
const globalLib = require('./global.lib');
const globalConst = require('../global.const');

function connectToCluster() {
    try {
        if(_.isEmpty(process.env.QUICKNODE_URL)) {
            throw new Error("QUICKNODE_URL is required")
        }
        globalLib.setGlobalKey("SOLANA_CONNECTION", new Connection(process.env.QUICKNODE_URL, "confirmed"));
        console.log("Connected to Solana cluster");
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
        const price = (quoteTokenAmount.value.amount / 10**quoteTokenAmount.value.decimals) / (baseTokenAmount.value.amount / 10**baseTokenAmount.value.decimals);

        return {
            price: price,
        }
    } catch (error) {
        throw error;
    }
}


module.exports = {
    connectToCluster: connectToCluster,
    getConnection: getConnection,
    getPoolInfo: getPoolInfo,
    getPoolPrice: getPoolPrice,
}

//amm address of wbtc/usdc = 4nfbdt7dexatvarzfr3wqalgjnogmjqe9vf2h6c1wxbr
//amm address of weth/usdc = eonrn8iuhwgjysd1phu8qxm5gsqqlk3za4m8xzd2rueb
//amm address of wsol/usdc = 58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2
