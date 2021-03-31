const mongoose = require("mongoose");
const crypto = require("crypto");

module.exports = class TokenStore {
    /** @type mongoose.Model */
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
                ...definition,
                _key: {
                    type: Buffer,
                    default: () => crypto.randomBytes(24),
                },
                _createdAt: { type: Date, expires: ttl, default: Date.now },
            })
        );
    }

    /**
     *
     * @param {any} param0
     * @returns {string}
     */
    async create({ ...value }) {
        const token = await new this.Token(value).save();
        const key = token._key.toString("base64url");

        return key;
    }

    /**
     * @param {string} key
     * @returns {Promise<mongoose.Document>}
     */
    async consume(key) {
        const _key = Buffer.from(key, "base64url");
        const token = await this.Token.findOneAndDelete({ _key });

        return token;
    }
};
