import { AnimalCurrentStatus } from '../interfaces/animal/animal.interface';

/** Business exit reason (stored in animal_disposals.disposal_type). */
export const ANIMAL_EXIT_TYPES = ['SALE', 'DEATH', 'DISPOSED', 'MISSING', 'OTHER'] as const;

export type AnimalExitType = (typeof ANIMAL_EXIT_TYPES)[number];

export function isAnimalExitType(value: string): value is AnimalExitType {
    return (ANIMAL_EXIT_TYPES as readonly string[]).includes(value);
}

export function exitTypeToCurrentStatus(exitType: AnimalExitType): AnimalCurrentStatus {
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
