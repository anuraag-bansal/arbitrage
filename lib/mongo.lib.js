const mongoose = require('mongoose');
const _ = require('lodash');

async function connectToMongo() {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is required")
        }
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Connected to MongoDB.');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
}


async function findOneAndUpdate(model, filterQuery, updateQuery, options = {}, timeout = 10000,) {
    try {
        if (model === null || filterQuery === null || updateQuery === null) {
            throw new Error("model, filterQuery, and updateQuery are required")
        }
        return await model.findOneAndUpdate(filterQuery, updateQuery, {
            ...options, maxTimeMS: timeout,
        })
    } catch (error) {

        throw error
    }
}

async function findOne(model, filterQuery, options = {}, timeout = 10000,) {
    try {
        if (model === null || filterQuery === null) {
            throw new Error("model and filterQuery are required")
        }
        return await model.findOne(filterQuery, {
            ...options, maxTimeMS: timeout,
        })
    } catch (error) {

        throw error
    }
}

async function findByQueryWithSkipLimit(model, query, skip, limit, timeout = 10000,) {
    try {
        if (model === null || query === null || limit === null || skip === null) {
            throw new Error("model, query, limit, and skip are required")
        }
        const docs = await model
            .find(query)
            .maxTimeMS(timeout)
            .skip(skip)
            .limit(limit)

        return docs
    } catch (err) {

        throw err
    }
}

async function findByQuery(model, query, timeout = 10000) {
    try {
        if (model === null || query === null) {
            throw new Error("model and query are required")
        }
        return await model.find(query).maxTimeMS(timeout)
    } catch (error) {

        throw error
    }
}

module.exports = {
    connectToMongo, findOneAndUpdate, findOne, findByQueryWithSkipLimit, findByQuery,
}
