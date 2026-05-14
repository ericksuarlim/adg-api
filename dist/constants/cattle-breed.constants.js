"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATTLE_BREED_OPTIONS = exports.CATTLE_BREED_CODES = void 0;
exports.isValidCattleBreedCode = isValidCattleBreedCode;
/**
 * Canonical cattle breed codes stored in `animals.breed_code`.
 * Add new entries here to extend the catalog (keep UI i18n keys in sync: `animal.breed.<code>`).
 */
exports.CATTLE_BREED_CODES = [
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
];
function isValidCattleBreedCode(value) {
    return Boolean(value && exports.CATTLE_BREED_CODES.includes(value));
}
exports.CATTLE_BREED_OPTIONS = exports.CATTLE_BREED_CODES.map((code) => ({ code }));
