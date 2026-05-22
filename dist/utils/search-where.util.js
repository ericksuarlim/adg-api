"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSearchOrClause = buildSearchOrClause;
const sequelize_1 = require("sequelize");
/**
 * Builds a Sequelize OR clause with case-insensitive partial match across string columns.
 */
function buildSearchOrClause(search, fields) {
    const term = search?.trim();
    if (!term || fields.length === 0) {
        return undefined;
    }
    const pattern = `%${term}%`;
    return {
        [sequelize_1.Op.or]: fields.map((field) => ({
            [field]: { [sequelize_1.Op.iLike]: pattern },
        })),
    };
}
