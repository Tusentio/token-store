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
    constructor(name, { ...definition } = {}, ttl = 10, mongoose = mongoose) {
        this.Token = mongoose.model(
            `${name.toLowerCase()}token`,
            new mongoose.Schema(
                {
                    value: definition,
                    id: {
                        type: String,
                        unique: true,
                        default: uid.base64Long,
                    },
                    ...(Number.isFinite(ttl) ? { iat: { type: Date, expires: ttl, default: Date.now } } : {}),
                },
                { minimize: false }
            )
        );
    }

    /**
     * @param {any} value
     * @returns {Promise<string>}
     */
    async create(value) {
        const token = await this.Token.create({ value });
        return token.id;
    }

    /**
     * @param {string} id
     * @returns {mongoose.Query}
     */
    async consume(id) {
        const token = await this.Token.findOneAndDelete({ id }).lean();
        return token ? token.value : undefined;
    }
};
