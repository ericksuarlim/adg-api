import { Op } from 'sequelize';

/**
 * Normalizes a scanned or typed animal identifier (registration / chip).
 */
export function normalizeAnimalIdentifier(identifier: string): string {
    return identifier.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function escapeILikeExact(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Case-insensitive exact match on registration_number or chip_number.
 */
export function buildAnimalIdentifierExactMatchClause(
    identifier: string
): Record<string, unknown> | undefined {
    const normalized = normalizeAnimalIdentifier(identifier);
    if (!normalized) {
        return undefined;
    }

    const escaped = escapeILikeExact(normalized);
    return {
        [Op.or]: [
            { registration_number: { [Op.iLike]: escaped } },
            { chip_number: { [Op.iLike]: escaped } },
        ],
    };
}
