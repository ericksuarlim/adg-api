/**
 * Canonical cattle breed codes stored in `animals.breed_code`.
 * Add new entries here to extend the catalog (keep UI i18n keys in sync: `animal.breed.<code>`).
 */
export const CATTLE_BREED_CODES = [
    'UNKNOWN',
    'HOLSTEIN',
    'JERSEY',
    'ANGUS',
    'HEREFORD',
    'BRAHMAN',
    'BRANGUS',
    'SIMMENTAL',
    'LIMOUSIN',
    'CHAROLAIS',
    'GIROLANDO',
    'NELORE',
    'OTHER'
] as const;

export type CattleBreedCode = (typeof CATTLE_BREED_CODES)[number];

export function isValidCattleBreedCode(value: string | undefined | null): value is CattleBreedCode {
    return Boolean(value && (CATTLE_BREED_CODES as readonly string[]).includes(value));
}

export const CATTLE_BREED_OPTIONS: { code: CattleBreedCode }[] = CATTLE_BREED_CODES.map((code) => ({ code }));
