import { Op } from "sequelize";

/**
 * Builds a Sequelize OR clause with case-insensitive partial match across string columns.
 */
export function buildSearchOrClause(
    search: string | undefined,
    fields: string[]
): Record<string, unknown> | undefined {
    const term = search?.trim();
    if (!term || fields.length === 0) {
        return undefined;
    }

    const pattern = `%${term}%`;
    return {
        [Op.or]: fields.map((field) => ({
            [field]: { [Op.iLike]: pattern },
        })),
    };
}
