"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANIMAL_EXIT_TYPES = void 0;
exports.isAnimalExitType = isAnimalExitType;
exports.exitTypeToCurrentStatus = exitTypeToCurrentStatus;
/** Business exit reason (stored in animal_disposals.disposal_type). */
exports.ANIMAL_EXIT_TYPES = ['SALE', 'DEATH', 'DISPOSED', 'MISSING', 'OTHER'];
function isAnimalExitType(value) {
    return exports.ANIMAL_EXIT_TYPES.includes(value);
}
function exitTypeToCurrentStatus(exitType) {
    switch (exitType) {
        case 'SALE':
            return 'SOLD';
        case 'DEATH':
            return 'DEAD';
        case 'DISPOSED':
            return 'DISPOSED';
        case 'MISSING':
            return 'MISSING';
        case 'OTHER':
        default:
            return 'INACTIVE';
    }
}
