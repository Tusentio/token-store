const mongoose = require("mongoose");
const uid = require("@tusent.io/uid");

module.exports = class TokenStore {
    /** @type {mongoose.Model} */
    Token;

    /**
     * @param {string} name
     * @param {mongoose.SchemaDefinition} [param1]
     * @param {number} [ttl]
     */
    constructor(name, { ...definition } = {}, ttl = 10000) {
        this.Token = mongoose.model(
            `Token/${name}`,
            new mongoose.Schema({
                value: definition,
                key: {
                    type: String,
                    unique: true,
                    default: uid.base64Long,
                },
                createdAt: { type: Date, expires: ttl, default: Date.now },
            })
        );
    }

    /**
     *
     * @param {any} param0
     * @returns {string}
     */
    async create({ ...value }) {
        const token = await this.Token.create({ value });
        return token.key;
    }

    /**
     * @param {string} key
     * @returns {mongoose.Query}
     */
    async consume(key) {
        const token = await this.Token.findOne({ key }).lean();
        await this.Token.findByIdAndDelete(token._id);
        return token.value;
    }
};
