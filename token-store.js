const mongoose = require("mongoose");
const crypto = require("crypto");

module.exports = class TokenStore {
    /** @type mongoose.Model */
    Token;

    _definition = {};

    constructor(name, { ...definition } = {}, ttl = 10000) {
        this._definition = definition;

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

    async create({ ...value }) {
        const token = await new this.Token(value).save();
        const key = token._key.toString("base64url");

        return key;
    }

    async consume(key) {
        const _key = Buffer.from(key, "base64url");
        const token = await this.Token.findOneAndDelete({ _key });

        const value = {};
        for (const name of Object.getOwnPropertyNames(this._definition)) {
            value[name] = token[name];
        }

        return value;
    }
};
